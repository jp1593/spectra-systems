package com.apex.backend;

/**
 * La clase `ApexController` es un controlador RESTful utilizado en la aplicación backend.

 * Este controlador maneja diversas solicitudes HTTP entrantes relacionadas con las funcionalidades
 * de la aplicacion.

 * La clase utiliza anotaciones de Spring Framework para definir los endpoints y manejar las peticiones.

  * @author Juan Pablo Estrada Lucero & Max Arturo Marroquin Arango
  * @version 1.0
  */

import java.sql.*; // Import necesario para la conexión JDBC
import java.text.SimpleDateFormat;
import java.util.ArrayList; // Importacion de listas de arreglos
import java.util.List; // Importacion de listas
import java.util.Map; // Importacion de funcion map
import java.util.concurrent.atomic.AtomicLong;

import java.util.List;
import java.util.ArrayList;
import java.util.Date;

import org.springframework.boot.autoconfigure.integration.IntegrationProperties.RSocket.Server;
import org.springframework.http.ResponseEntity; // Importacion de response http de spring
import org.springframework.http.HttpMethod; // Importacion de metodos http
import org.springframework.security.crypto.bcrypt.BCrypt; // Importacion de encriptacion de datos
import org.springframework.util.LinkedMultiValueMap; // Importacion de listas de map
import org.springframework.util.MultiValueMap; // Importacion de multiples valores map
import org.springframework.web.bind.annotation.GetMapping; // Importacion de GetMapping
import org.springframework.web.bind.annotation.RequestParam; // Importacion de RequestParam
import org.springframework.web.bind.annotation.RestController; // Importacion de controlador Rest
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate; // Importacion de templates para rest

import oracle.security.o3logon.a;
import oracle.sql.DATE;

import org.springframework.web.bind.annotation.PathVariable; // Import para el uso de variables en el path de URL
import org.springframework.web.bind.annotation.PostMapping; // Import de PostMapping
import org.springframework.web.bind.annotation.RequestBody; // Import de Request Body
import java.time.format.DateTimeFormatter; // Import para formateo de fechas
import org.springframework.web.bind.annotation.CrossOrigin; // Import para el uso de CORS en web
import java.time.LocalDateTime; // Import para obtencion de tiempo actual
import org.springframework.beans.factory.annotation.Value; // Import necesario para la inyección de dependencia

/**
 * La clase `ApexController` es un controlador RESTful utilizado en la
 * aplicación backend.
 * 
 * Este controlador maneja diversas solicitudes HTTP entrantes relacionadas con
 * las funcionalidades
 * de la aplicacion.
 * 
 * La clase utiliza anotaciones de Spring para definir los endpoints y manejar
 * las peticiones.
 */
@CrossOrigin
@RestController // Indica que la clase es un controlador RESTful
/**
 * Crea una instancia de `ApexController` el cual representara el controlado del
 * BE
 */
public class ApexController 
    /**
     * URL base de la API de Nexus (valor inyectado mediante `@Value`).
     */
    @Value("${agency.urls}")
    private String agencyUrls;

    @Value("${oracle.user}")
    private String oracleUser;

    /**
     * Representa un mensaje de bienvenida establecido para el usuario
     * 
     * @param id      Id del usuario
     * @param content Contenido dentro del mensaje de bienvenida
     */
    public record Greeting(long id, String content) {
    }

    private static final String template = "Hello, %s!";
    private final AtomicLong counter = new AtomicLong();
    private final String NEXUS_API = "http://localhost:42069/nexus/flights/";

    // Greeting - API
    /**
     * End point para obtener un saludo personalizado.
     * 
     * Este método maneja la solicitud GET a la ruta "/greeting" y devuelve un
     * saludo personalizado
     * con el nombre proporcionado en el parámetro `name`.
     * 
     * @param name Nombre de la persona a saludar (valor por defecto: "World").
     * @return Objeto `Greeting` que contiene el identificador del saludo y el
     *         contenido del mensaje.
     */
    @GetMapping("/greeting")
    public Greeting greeting(@RequestParam(value = "name", defaultValue = "World") String name) {
        return new Greeting(counter.incrementAndGet(), String.format(template, agencyUrls));
    }

    // USER - LOGIN
    /**
     * End point para el inicio de sesión de usuario.
     *
     * @param user Objeto `User` que contiene las credenciales del usuario.
     * @return Dependiendo del resultado del login, se devuelve un objeto `WebError`
     *         indicando un error, un objeto `LoggedUser` con los datos del usuario
     *         logueado,
     */

    @PostMapping("/login")
    public Object signIn(@RequestBody User user) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format("SELECT * FROM users WHERE email = '%s'", user.email));
            ResultSet result = query.executeQuery();

            if (!result.next()) {
                return new WebError("User not found");
            }

            if (BCrypt.checkpw(user.password, result.getString("password"))) {
                return new LoggedUser(
                        result.getString("user_id"),
                        result.getString("email"),
                        result.getString("first_name"),
                        result.getString("last_name"),
                        result.getString("origin_country"),
                        result.getString("passport_number"),
                        result.getString("role"),
                        result.getString("age"),
                        result.getString("percentage"),
                        result.getString("entry_date"));
            }
            return new WebError("Invalid password");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to login");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // USER - SIGN UP
    /**
     * End point para crear un nuevo usuario en el sistema.
     * 
     * Este método maneja la solicitud POST a la ruta "/create-user/{token}" y
     * registra un nuevo usuario.
     * 
     * @param user  Objeto `User` que contiene la información del usuario a crear
     *              (correo electrónico, contraseña,
     *              nombre, apellido, país de origen, número de pasaporte, edad).
     *              La contraseña se espera en texto plano y será encriptada antes
     *              de guardarla.
     * @param token Token de reCAPTCHA v2 para verificar que la solicitud no sea de
     *              un bot.
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebError`: En caso de error (correo electrónico duplicado, error
     *         de reCAPTCHA, error genérico).
     *         * `LoggedUser`: Objeto que contiene la información del usuario
     *         registrado exitosamente.
     */
    @PostMapping("/create-user/{token}")
    public Object createUser(@RequestBody User user, @PathVariable String token) {
        String secretkey = "6LfqapMpAAAAABzyK_kit2nrY39Hg1_VTg92SBXR";

        Connection conn = new OracleConnector(oracleUser).getConnection();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        LocalDateTime now = LocalDateTime.now();

        String passwordHash = BCrypt.hashpw(user.password, BCrypt.gensalt());

        try {
            RestTemplate restTemplate = new RestTemplate();
            MultiValueMap<String, String> requestMap = new LinkedMultiValueMap<>();
            requestMap.add("secret", secretkey);
            requestMap.add("response", token);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://www.google.com/recaptcha/api/siteverify", requestMap, Map.class);

            Map<String, Object> responseBody = response.getBody();

            if ((Boolean) responseBody.get("success")) {
                PreparedStatement query = conn
                        .prepareStatement(String.format(
                                "INSERT INTO users (email, password, first_name, last_name, origin_country, passport_number, role, age, percentage, entry_date) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', 'user', %s, %s, TO_DATE('%s', 'dd-MM-yyyy'))",
                                user.email, passwordHash, user.firstName, user.lastName, user.originCountry,
                                user.passportNumber, user.age, 0, dtf.format(now)));
                query.executeQuery();

                PreparedStatement retrievalQueery = conn
                        .prepareStatement(String.format("SELECT * FROM users WHERE email = '%s'", user.email));
                ResultSet result = retrievalQueery.executeQuery();

                if (!result.next()) {
                    return new WebError("Failed to create user");
                }

                return new LoggedUser(
                        result.getString("user_id"),
                        result.getString("email"),
                        result.getString("first_name"),
                        result.getString("last_name"),
                        result.getString("origin_country"),
                        result.getString("passport_number"),
                        result.getString("role"),
                        result.getString("age"),
                        result.getString("percentage"),
                        result.getString("entry_date"));
            } else {
                return new WebError("Failed to verify reCAPTCHA");
            }

        } catch (Throwable e) {
            e.printStackTrace();
            if (e.getMessage().contains(
                    "ORA-00001: unique constraint (SYSTEM.EMAIL_UK) violated on table SYSTEM.USERS columns (EMAIL)")) {
                return new WebError("Email already in use");
            }
            return new WebError("Failed to create user");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * End point para obtener la información básica de un usuario.
     * 
     * Este método maneja la solicitud GET a la ruta "/get-user/{id}" y devuelve
     * un resumen de la información del usuario identificado por el parámetro
     * `{id}`.
     * 
     * @param id Identificador único del usuario (valor esperado: número entero).
     * @return Dependiendo del resultado de la búsqueda, se devuelve uno de los
     *         siguientes objetos:
     *         * `User`: Objeto que contiene el nombre y correo electrónico del
     *         usuario encontrado
     *         (se usa un record temporal dentro del método).
     *         * `WebError`: En caso de error (usuario no encontrado, error
     *         genérico).
     */
    @GetMapping("/get-user/{id}")
    public Object getUser(@PathVariable Long id) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format("SELECT * FROM users WHERE user_id = %d", id));
            ResultSet result = query.executeQuery();

            record User(String name, String email) {
            }

            if (result.next()) {
                return new User(result.getString("first_name"), result.getString("email"));
            }
            return new WebError("User not found");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to retrieve user");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Get All Users - API
    /**
     * End point para obtener la lista de todos los usuarios registrados en el
     * sistema.
     * 
     * Este método maneja la solicitud GET a la ruta "/get-users" y devuelve una
     * lista
     * con la información detallada de todos los usuarios.
     * 
     * @return Lista de objetos `LoggedUser` que contienen la información completa
     *         de cada usuario registrado.
     */
    @GetMapping("/get-users")
    public Object getUsers() {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        List<LoggedUser> users = new ArrayList<LoggedUser>();

        try {
            PreparedStatement query = conn
                    .prepareStatement("SELECT * FROM users");
            ResultSet result = query.executeQuery();

            while (result.next()) {
                users.add(new LoggedUser(
                        result.getString("user_id"),
                        result.getString("email"),
                        result.getString("first_name"),
                        result.getString("last_name"),
                        result.getString("origin_country"),
                        result.getString("passport_number"),
                        result.getString("role"),
                        result.getString("age"),
                        result.getString("percentage"),
                        result.getString("entry_date")));
            }
            return users;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to retrieve users");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Update User
    /**
     * End point para actualizar la información de un usuario existente.
     * 
     * Este método maneja la solicitud POST a la ruta "/update-user" y permite
     * modificar
     * los datos del usuario enviado en el cuerpo de la petición (`@RequestBody`).
     * 
     * @param user Objeto `User` que contiene la información actualizada del usuario
     *             (nombre, apellido, país de origen, número de pasaporte opcional,
     *             rol, edad opcional, porcentaje opcional).
     *             Se espera que el objeto `user` tenga establecido el identificador
     *             único (`userId`)
     *             para identificar al usuario a actualizar.
     * @return Dependiendo del resultado de la actualización, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: En caso de éxito en la actualización del usuario.
     *         * `WebError`: En caso de error (error genérico).
     */
    @PostMapping("/update-user")
    public Object updateUser(@RequestBody User user) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE users SET first_name = '%s', last_name = '%s', origin_country = '%s', passport_number = '%s', role = '%s', age = '%s', percentage = %s WHERE user_id = %s",
                            user.firstName, user.lastName, user.originCountry, user.passportNumber, user.role,
                            user.age, user.percentage, user.userId));
            query.executeQuery();

            return new WebSuccess("User updated successfully");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to update user");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // FLIGHT - REGISTRATION
    /**
     * End point para crear un nuevo registro de vuelo en el sistema.
     * 
     * Este método maneja la solicitud POST a la ruta "/create-flight" y registra un
     * nuevo vuelo.
     * 
     * @param flight Objeto `Flight` que contiene la información del vuelo a crear
     *               (ciudad de origen, ciudad destino, fecha y hora de salida,
     *               fecha y hora de llegada,
     *               capacidad y precio de tickets turista, capacidad y precio de
     *               tickets premium, detalles del vuelo, tipo de vuelo).
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: En caso de éxito en la creación del vuelo.
     *         * `WebError`: En caso de error (error genérico).
     */
    @PostMapping("/create-flight")
    public Object createFlight(@RequestBody Flight flight) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            PreparedStatement flightQuery = conn
                    .prepareStatement(String.format(
                            "INSERT INTO flights (origin, destination, departure_date, arrival_date, amount_normal, amount_premium, price_normal, price_premium, detail, type, state) VALUES ('%s', '%s', TO_TIMESTAMP('%s', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('%s', 'YYYY-MM-DD HH24:MI:SS'), %s, %s, %s, %s, '%s', %s, 1)",
                            flight.originCity, flight.destinationCity, flight.departureDate, flight.arrivalDate,
                            flight.touristCapacity, flight.businessCapacity,
                            flight.touristPrice, flight.businessPrice, flight.detail, flight.type));
            flightQuery.executeQuery();

            PreparedStatement flightIdQuery = conn.prepareStatement("SELECT MAX(flight_id) as flight_id FROM flights");
            ResultSet flightIdResult = flightIdQuery.executeQuery();

            PreparedStatement ticketIdQuery = conn.prepareStatement("SELECT MAX(ticket_id) as ticket_id FROM tickets");
            ResultSet ticketIdResult = ticketIdQuery.executeQuery();

            if (!flightIdResult.next() || !ticketIdResult.next()) {
                return new WebError("Failed to create flight");
            }

            int flightId = flightIdResult.getInt("flight_id");

            int ticketId = ticketIdResult.getInt("ticket_id");

            String tickets = "";
            int counter = 0;
            for (int i = 0; i < flight.touristQuantity; i++) {
                counter++;
                tickets = tickets + String.format(
                        "INTO tickets (ticket_id, price, flight_id, type, state) VALUES (%s, %s, %s, '%s', '%s') ",
                        ticketId + counter,
                        flight.touristPrice, flightId, "economy", "active");
            }
            for (int i = 0; i < flight.businessQuantity; i++) {
                counter++;
                tickets = tickets + String.format(
                        "INTO tickets (ticket_id, price, flight_id, type, state) VALUES (%s, %s, %s, '%s', '%s') ",
                        ticketId + counter,
                        flight.businessPrice, flightId, "premium", "active");
            }

            PreparedStatement ticketQuery = conn
                    .prepareStatement(String.format("INSERT ALL %s SELECT * FROM DUAL", tickets));
            ticketQuery.executeQuery();

            return new WebSuccess("Flight created successfully");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to create flight");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Get One Way Flights - API
    /**
     * End point para buscar vuelos de ida (one-way) disponibles en el sistema.
     * 
     * Este método maneja la solicitud GET a la ruta "/get-one-way-flights" y
     * permite buscar vuelos
     * de un origen a un destino específico, filtrados por fecha de salida y
     * cantidad de pasajeros
     * (informada como cadena de texto).
     * 
     * @param originCity      Parámetro opcional para filtrar por ciudad de origen
     *                        (valor por defecto vacío).
     * @param destinationCity Parámetro opcional para filtrar por ciudad destino
     *                        (valor por defecto vacío).
     * @param departureDay    Parámetro opcional para filtrar por fecha de salida
     *                        (formato YYYY-MM-DD, valor por defecto vacío).
     * @param passengers      Parámetro opcional para informar la cantidad de
     *                        pasajeros (cadena de texto, valor por defecto vacío).
     * @return Dependiendo del resultado de la búsqueda, se devuelve uno de los
     *         siguientes objetos:
     *         * Lista de objetos `FlightRecord`: En caso de encontrar vuelos que
     *         coincidan con los filtros.
     *         Cada objeto `FlightRecord` contiene la información del vuelo y
     *         detalles adicionales.
     *         * Arreglo vacío (`Object[]`): Si no se encuentran vuelos que
     *         coincidan con los filtros.
     *         * `WebError`: En caso de error (error genérico).
     */
    @GetMapping("/get-one-way-flights")
    public Object getOneWayFlights(
            @RequestParam(value = "originCity", defaultValue = "") String originCity,
            @RequestParam(value = "destinationCity", defaultValue = "") String destinationCity,
            @RequestParam(value = "departureDay", defaultValue = "") String departureDay,
            @RequestParam(value = "passengers", defaultValue = "") String passengers) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        List<FlightRecord> flights = new ArrayList<FlightRecord>();

        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT DISTINCT flights.flight_id, origin.city_id as origin_city_id, origin.name as origin_name, destination.city_id as destination_city_id, destination.name as destination_name, flights.departure_date, flights.arrival_date, flights.price_normal, flights.price_premium, flights.detail, flights.type, flights.state from flights inner join tickets on flights.flight_id = tickets.flight_id inner join cities origin on flights.origin = origin.city_id inner join cities destination on flights.destination = destination.city_id where tickets.user_id is null and flights.origin = %s and flights.destination = %s and TRUNC(flights.departure_date) = TO_DATE('%s', 'YYYY-MM-DD') and tickets.state != 'canceled'",
                            originCity, destinationCity, departureDay));
            ResultSet result = query.executeQuery();

            while (result.next()) {
                List<CommentaryRecord> commentaries = new ArrayList<CommentaryRecord>();

                PreparedStatement countQuery = conn.prepareStatement(String
                        .format("SELECT (select count(ticket_id) from tickets where flight_id = %s and type = 'economy' and state = 'active' and user_id is null) as economy_quantity, (select count(ticket_id) from tickets where flight_id = %s and type = 'premium' and state = 'active' and user_id is null) as premium_quantity",
                                result.getInt("flight_id"), result.getInt("flight_id")));
                ResultSet countResult = countQuery.executeQuery();

                PreparedStatement commentariesQuery = conn.prepareStatement(String.format(
                        "SELECT comments.comment_id, comments.parent_comment_id, comments.user_id, comments.content, comments.creation_date, comments.path, comments.flight_id, users.first_name from comments inner join users on comments.user_id = users.user_id where comments.flight_id = %s",
                        result.getInt("flight_id")));
                ResultSet commentariesResult = commentariesQuery.executeQuery();

                PreparedStatement ratingsQuery = conn.prepareStatement(String.format(
                        "SELECT ratingAverage(%s) as rating, COUNT(ratings.rating_id) as count from ratings where flight_id = %s",
                        result.getInt("flight_id"), result.getInt("flight_id")));
                ResultSet ratingsResult = ratingsQuery.executeQuery();

                if (!countResult.next() || !ratingsResult.next()) {
                    return new WebError("Failed to retrieve flights");
                }

                while (commentariesResult.next()) {
                    commentaries.add(new CommentaryRecord(commentariesResult.getInt("comment_id"),
                            commentariesResult.getInt("parent_comment_id"),
                            commentariesResult.getInt("user_id"), commentariesResult.getString("content"),
                            commentariesResult.getString("creation_date"),
                            commentariesResult.getString("path"), commentariesResult.getInt("flight_id"),
                            commentariesResult.getString("first_name"), new ArrayList<CommentaryRecord>()));
                }

                flights.add(new FlightRecord(result.getInt("flight_id"), result.getInt("origin_city_id"),
                        result.getString("origin_name"), result.getInt("destination_city_id"),
                        result.getString("destination_name"), result.getString("departure_date").toString(),
                        result.getString("arrival_date"), result.getInt("price_normal"), result.getInt("price_premium"),
                        result.getString("detail"),
                        countResult.getInt("economy_quantity"), countResult.getInt("premium_quantity"), commentaries,
                        new RatingRecord(
                                ratingsResult.getInt("rating"), ratingsResult.getInt("count"))));
            }
            if (flights.isEmpty()) {
                return new Object[0];
            }

            return flights;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to retrieve flights");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Comments - Insert - API
    /**
     * End point para crear un nuevo comentario asociado a un vuelo específico.
     * 
     * Este método maneja la solicitud POST a la ruta "/create-commentary" y
     * registra un nuevo comentario
     * enviado en el cuerpo de la petición (`@RequestBody`).
     * 
     * @param commentary Objeto `Commentary` que contiene la información del
     *                   comentario
     *                   (identificador del comentario padre opcional, identificador
     *                   del usuario que realiza el comentario,
     *                   contenido del comentario, identificador del vuelo
     *                   asociado).
     * @return Dependiendo del resultado de la creación del comentario, se devuelve
     *         uno de los siguientes objetos:
     *         * `WebSuccess`: En caso de éxito en la creación del comentario.
     *         * `WebError`: En caso de error (error genérico).
     */
    @PostMapping("/create-commentary")
    public Object createCommentary(@RequestBody Commentary commentary) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "INSERT INTO comments (parent_comment_id, user_id, content, creation_date, path, flight_id) VALUES (%s, %s, '%s', CURRENT_DATE, '/', %s)",
                            commentary.parentId, commentary.userId, commentary.content, commentary.flightId));
            query.executeQuery();

            return new WebSuccess("Commentary created successfully");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to create commentary");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
                return new WebError("Failed to create commentary");
            }
        }
    }

    // Ratings - Insert - API
    /**
     * End point para crear una nueva calificación asociada a un vuelo específico
     * por un usuario registrado.
     * 
     * Este método maneja la solicitud POST a la ruta "/create-rating" y registra
     * una nueva calificación
     * enviada en el cuerpo de la petición (`@RequestBody`). Solo se permite una
     * calificación por usuario y vuelo.
     * 
     * @param rating Objeto `Rating` que contiene la información de la calificación
     *               (identificador del usuario que realiza la calificación,
     *               identificador del vuelo asociado, valor de la calificación).
     * @return Dependiendo del resultado de la creación de la calificación, se
     *         devuelve uno de los siguientes objetos:
     *         * `WebSuccess`: En caso de éxito en la creación de la calificación.
     *         * `WebError`: En caso de error (error genérico o intento de calificar
     *         un vuelo ya calificado).
     */
    @PostMapping("/create-rating")
    public Object createRating(@RequestBody Rating rating) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "INSERT INTO ratings (user_id, flight_id, value) VALUES (%s, %s, %s)",
                            rating.userId, rating.flightId, rating.value));
            query.executeQuery();

            return new WebSuccess("Rating created successfully");
        } catch (Throwable e) {
            e.printStackTrace();
            if (e.getMessage().contains(
                    "ORA-20001: ")) {
                return new WebError("You already have left a rating.");
            }
            return new WebError("Failed to create rating");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
                return new WebError("Failed to create rating");
            }
        }
    }

    // Get all Tickets - API
    /**
     * End point para obtener la lista de todos los tickets del sistema.
     * 
     * Este método maneja la solicitud GET a la ruta "/get-all-tickets" y devuelve
     * una lista
     * con la información de todos los tickets registrados.
     * 
     * @return Lista de objetos `TicketRecord` que contienen la información de cada
     *         ticket
     *         (incluyendo datos del usuario asociado si existe).
     */
    @GetMapping("/get-all-tickets")
    public Object getAllTickets() {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        List<TicketRecord> tickets = new ArrayList<TicketRecord>();

        try {
            PreparedStatement query = conn
                    .prepareStatement(
                            "SELECT tickets.ticket_id, tickets.user_id, tickets.flight_id, tickets.type, tickets.state, tickets.price, users.first_name, users.email from tickets left join users on tickets.user_id = users.user_id");
            ResultSet result = query.executeQuery();

            while (result.next()) {
                tickets.add(
                        new TicketRecord(result.getInt("ticket_id"), result.getInt("price"), result.getInt("flight_id"),
                                result.getString("type"), result.getString("state"), result.getInt("user_id"),
                                result.getString("first_name"), result.getString("email")));
            }

            return tickets;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to retrieve tickets");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Get all Flights - API
    /**
     * End point para obtener la lista de todos los vuelos del sistema.
     * 
     * Este método maneja la solicitud GET a la ruta "/get-all-flights" y devuelve
     * una lista
     * con la información detallada de todos los vuelos registrados.
     * 
     * @return Lista de objetos `CompleteFlightRecord` que contienen la información
     *         completa de cada vuelo,
     *         incluyendo la cantidad disponible de tickets por tipo (económico y
     *         premium),
     *         y su estado (activo o inactivo).
     */
    @GetMapping("/get-all-flights")
    public Object getFlights() {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        List<CompleteFlightRecord> flights = new ArrayList<CompleteFlightRecord>();

        try {
            PreparedStatement query = conn
                    .prepareStatement(
                            "SELECT DISTINCT flights.flight_id, origin.city_id as origin_city_id, origin.name as origin_name, destination.city_id as destination_city_id, destination.name as destination_name, flights.departure_date, flights.arrival_date, flights.state, flights.amount_normal, flights.amount_premium, flights.price_normal, flights.price_premium, flights.detail, flights.type, flights.state from flights inner join tickets on flights.flight_id = tickets.flight_id inner join cities origin on flights.origin = origin.city_id inner join cities destination on flights.destination = destination.city_id");
            ResultSet result = query.executeQuery();

            while (result.next()) {
                PreparedStatement countQuery = conn.prepareStatement(String
                        .format("SELECT (select count(ticket_id) from tickets where flight_id = %s) as economy_quantity, (select count(ticket_id) from tickets where flight_id = %s) as premium_quantity",
                                result.getInt("flight_id"), result.getInt("flight_id")));
                ResultSet countResult = countQuery.executeQuery();

                if (!countResult.next()) {
                    return new WebError("Failed to retrieve flights");
                }

                flights.add(new CompleteFlightRecord(result.getInt("flight_id"), result.getInt("origin_city_id"),
                        result.getString("origin_name"), result.getInt("destination_city_id"),
                        result.getString("destination_name"), result.getString("departure_date").toString(),
                        result.getString("arrival_date"), result.getInt("price_normal"), result.getInt("price_premium"),
                        result.getString("detail"),
                        countResult.getInt("economy_quantity"), countResult.getInt("premium_quantity"),
                        result.getInt("amount_normal"), result.getInt("amount_premium"),
                        result.getInt("state")));
            }

            return flights;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to retrieve flights");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Get all Cities - API
    /**
     * End point para obtener la lista de todas las ciudades registradas en el
     * sistema.
     * 
     * Este método maneja la solicitud GET a la ruta "/get-cities" y devuelve una
     * lista
     * con información básica de todas las ciudades.
     * 
     * @return Lista de objetos `City` que contienen el identificador único
     *         (city_id) y el nombre de cada ciudad.
     */
    @GetMapping("/get-cities")
    public Object getCities() {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        List<City> cities = new ArrayList<City>();

        try {
            PreparedStatement query = conn
                    .prepareStatement("SELECT * FROM cities");
            ResultSet result = query.executeQuery();

            while (result.next()) {
                cities.add(new City(result.getString("city_id"), result.getString("name")));
            }
            return cities;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to retrieve cities");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Ticket information - API
    /**
     * End point para obtener la información de un ticket específico.
     * 
     * Este método maneja la solicitud GET a la ruta "/ticket-information" y
     * devuelve la información completa de ese ticket.
     * 
     * @return Dependiendo del resultado de la búsqueda, se devuelve uno de los
     *         siguientes objetos:
     *         * Objeto `Ticket` que contiene la información detallada de un ticket
     *         (identificador, precio, identificador de vuelo asociado, tipo y
     *         estado).
     *         * `WebError`: En caso de error (error genérico o ticket no
     *         encontrado).
     */
    @GetMapping("/ticket-information")
    public Object getAllticketinfo() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format("Select * FROM Tickets"));
            ResultSet result = query.executeQuery();

            record Ticket(String ticket_id, String price, String flight_id, String type, String state) {
            }

            if (result.next()) {
                return new Ticket(result.getString("ticket_id"), result.getString("price"),
                        result.getString("flight_id"),
                        result.getString("type"), result.getString("state"));
            }
            return new WebError("Tickets information not accesed");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get tickets information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // User tickets - API
    /**
     * End point para obtener la lista de tickets asociados a un usuario registrado.
     * 
     * Este método maneja la solicitud GET a la ruta "/user_tickets/{id}" donde
     * `{id}` representa el identificador
     * del usuario. Devuelve una lista con la información detallada de todos los
     * tickets del usuario especificado.
     * 
     * @param id Identificador del usuario del cual se desean obtener los tickets.
     * @return Dependiendo del resultado de la búsqueda, se devuelve uno de los
     *         siguientes objetos:
     *         * Lista de objetos `UserTicket` que contienen la información
     *         detallada de cada ticket asociado
     *         al usuario (identificador de ticket, precio, tipo, estado,
     *         identificador de vuelo asociado,
     *         origen, destino, fecha de salida y llegada del vuelo).
     *         * `WebError`: En caso de error (error genérico o si el usuario no
     *         posee tickets).
     */
    @GetMapping("/user_tickets/{id}")
    public Object getUsertickets(@PathVariable int id) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT t.ticket_id, t.price, t.type, t.state, t.flight_id, o.name as origin, d.name as destination, f.departure_date, f.arrival_date\n"
                                    + //
                                    "FROM tickets t \n" + //
                                    "JOIN flights f ON t.flight_id = f.flight_id JOIN cities o ON f.origin = o.city_id JOIN cities d ON f.destination = d.city_id WHERE t.user_id = %d",
                            id));
            ResultSet result = query.executeQuery();

            record UserTicket(String ticket_id, String price, String type, String state, String flight_id,
                    String origin, String destination, String departure_date, String arrival_date) {
            }

            List<UserTicket> usertickets = new ArrayList<>();
            while (result.next()) {
                usertickets.add(new UserTicket(
                        result.getString("ticket_id"),
                        result.getString("price"),
                        result.getString("type"),
                        result.getString("state"),
                        result.getString("flight_id"),
                        result.getString("origin"),
                        result.getString("destination"),
                        result.getString("departure_date"),
                        result.getString("arrival_date")));
            }
            if (usertickets.isEmpty()) {
                return new WebError("This user doesn't have any tickets");
            }
            return usertickets;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get user tickets");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Historical purchases - API
    /**
     * End point para obtener el historial de compras de un usuario registrado.
     * 
     * Este método maneja la solicitud GET a la ruta "/historical_purchases/{id}"
     * donde `{id}` representa el identificador
     * del usuario. Devuelve una lista con la información detallada de todas las
     * compras históricas
     * (independientemente del estado actual de los tickets) asociadas al usuario.
     * 
     * @param id Identificador del usuario del cual se desea obtener el historial de
     *           compras.
     * @return Dependiendo del resultado de la búsqueda, se devuelve uno de los
     *         siguientes objetos:
     *         * Lista de objetos `User_purchases` que contienen la información
     *         detallada de cada compra histórica
     *         del usuario (número de compra, ticket asociado, tipo de ticket,
     *         origen, destino, fecha de compra,
     *         precio, método de pago, fecha de salida, fecha de llegada, nombre de
     *         usuario, descuento aplicado
     *         e identificador del usuario).
     *         * `WebError`: En caso de error (error genérico o si el usuario no
     *         posee un historial de compras).
     */
    @GetMapping("/historical_purchases/{id}")
    public Object getHistoricpurchases(@PathVariable int id) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT * FROM Historical_purchases WHERE user_id = %d",
                            id));
            ResultSet result = query.executeQuery();

            record User_purchases(String purchase_number, String ticket, String type, String origin, String destination,
                    String purchase_date, String price, String paymenth_method,
                    String departure_date, String arrival_date, String user_name, int discount, int user_id) {
            }

            List<User_purchases> historicalPurchases = new ArrayList<>();
            while (result.next()) {
                historicalPurchases.add(new User_purchases(
                        result.getString("purchase_number"),
                        result.getString("ticket"),
                        result.getString("type"),
                        result.getString("origin"),
                        result.getString("destination"),
                        result.getString("purchase_date"),
                        result.getString("price"),
                        result.getString("paymenth_method"),
                        result.getString("departure_date"),
                        result.getString("arrival_date"),
                        result.getString("user_name"),
                        result.getInt("discount"),
                        result.getInt("user_id")));
            }
            if (historicalPurchases.isEmpty()) {
                return new WebError("This user doesn't have any purchases made");
            }
            return historicalPurchases;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get user tickets");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // FLIGHTS - ALL
    /**
     * End point para obtener la lista de todos los vuelos del sistema.
     * 
     * Este método maneja la solicitud GET a la ruta "/inventory" y devuelve una
     * lista
     * con la información básica de todos los vuelos registrados.
     * 
     * @return Dependiendo del resultado de la búsqueda, se devuelve uno de los
     *         siguientes objetos:
     *         * Lista de objetos `FLIGHTS` que contienen la información esencial de
     *         cada vuelo
     *         (origen, destino, fechas de salida y llegada, cantidades y precios
     *         disponibles por tipo
     *         (económico y premium), detalles, tipo de vuelo (regular o charter),
     *         estado
     *         (activo o inactivo) e identificador del vuelo).
     *         * `WebError`: En caso de error (error genérico o si no hay vuelos
     *         registrados).
     */
    @GetMapping("/inventory")
    public Object getInvetory() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT o.name as origin, d.name as destination, f.departure_date, f.arrival_date, f.amount_normal, f.amount_premium, f.price_normal, f.price_premium, f.detail, f.type, f.state, f.flight_id \n"
                                    + //
                                    "FROM flights f \n" + //
                                    "JOIN cities o ON f.origin = o.city_id JOIN cities d ON f.destination = d.city_id"));
            ResultSet result = query.executeQuery();

            record FLIGHTS(String origin, String destination, String departure_date, String arrival_date,
                    int amount_normal, int amount_premium, int price_normal, int price_premium,
                    String detail, boolean type, boolean state, int flight_id) {
            }

            List<FLIGHTS> flight = new ArrayList<>();
            while (result.next()) {
                flight.add(new FLIGHTS(
                        result.getString("origin"),
                        result.getString("destination"),
                        result.getString("departure_date"),
                        result.getString("arrival_date"),
                        result.getInt("amount_normal"),
                        result.getInt("amount_premium"),
                        result.getInt("price_normal"),
                        result.getInt("price_premium"),
                        result.getString("detail"),
                        result.getBoolean("type"),
                        result.getBoolean("state"),
                        result.getInt("flight_id")));
            }
            if (flight.isEmpty()) {
                return new WebError("Flights haven't been registered");
            }
            return flight;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get flights");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // AboutUs - GET INFORMATION
    /**
     * End point para obtener la información de la página "Acerca de Nosotros".
     * 
     * Este método maneja la solicitud GET a la ruta "/aboutus" y devuelve un objeto
     * que contiene la información configurada para la sección "Acerca de Nosotros".
     * 
     * @return Dependiendo del resultado de la búsqueda, se devuelve uno de los
     *         siguientes objetos:
     *         * Objeto `aboutus` que contiene la configuración completa de la
     *         sección "Acerca de Nosotros"
     *         (lema, GIF animado, enlace de Youtube, cantidad de tarjetas
     *         informativas, títulos, textos e imágenes
     *         de cada tarjeta).
     *         * `WebError`: En caso de error (error genérico o si no se encuentra
     *         la información configurada).
     */
    @GetMapping("/aboutus")
    public Object getAbout() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT * FROM About_us"));
            ResultSet result = query.executeQuery();

            record aboutus(String slogan, String gif, String yt, int cards_amoun, String title_one, String text_one,
                    String img_one,
                    String title_two, String text_two, String img_two,
                    String title_three, String text_three, String img_three,
                    String title_four, String text_four, String img_four) {
            }

            if (result.next()) {
                return new aboutus(
                        result.getString("slogan"),
                        result.getString("gif"),
                        result.getString("yt"),
                        result.getInt("cards_amount"),
                        result.getString("title_one"),
                        result.getString("text_one"),
                        result.getString("img_one"),
                        result.getString("title_two"),
                        result.getString("text_two"),
                        result.getString("img_two"),
                        result.getString("title_three"),
                        result.getString("text_three"),
                        result.getString("img_three"),
                        result.getString("title_four"),
                        result.getString("text_four"),
                        result.getString("img_four"));
            }
            return new WebError("Failed to get about us information");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("API DENIED ACCESS");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // About Us - UPDATE
    /**
     * End point para actualizar el contenido de la página "About us".
     * 
     * Este método maneja la solicitud POST a la ruta "/update-aboutus" y actualiza
     * el contenido de la página "About Us".
     * 
     * @param au Objeto `AboutUs` que contiene la estructura de la página "About
     *           us".
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: Mensaje que confirma que la operación se ha realizado
     *         exitosamente.
     *         * `WebError`: En caso de error durante la modificación dentro de la
     *         base de datos.
     */
    @PostMapping("/update-aboutus")
    public Object updateAboutUs(@RequestBody Aboutus au) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            Statement checkStatement = conn.createStatement();
            ResultSet result = checkStatement.executeQuery("SELECT COUNT(*) FROM About_Us");
            result.next();
            int rowCount = result.getInt(1);

            if (rowCount == 0) {
                PreparedStatement insertStatement = conn.prepareStatement(String.format(
                        "INSERT INTO About_us (slogan, gif, yt, cards_amount, title_one, text_one, img_one, TITLE_TWO, text_two, img_two, title_three, text_three, img_three,\n"
                                + //
                                "title_four, text_four, img_four) VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', '%s', '%s',\n"
                                + //
                                "'%s', '%s', '%s', '%s', '%s', '%s', '%s')",
                        au.slogan, au.gif, au.yt, au.cards_amoun, au.title_one, au.text_one, au.img_one,
                        au.title_two, au.text_two, au.img_two, au.title_three, au.text_three,
                        au.img_three, au.title_four, au.text_four, au.img_four));
                insertStatement.executeUpdate();
                return new WebSuccess("About Us information inserted");
            }
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE About_us SET slogan = '%s', gif = '%s', yt = '%s', cards_amount = %d, title_one = '%s', text_one = '%s', img_one = '%s', \n"
                                    + //
                                    "TITLE_TWO = '%s', text_two = '%s', img_two = '%s', \n" + //
                                    "title_three = '%s', text_three = '%s', img_three = '%s', \n" + //
                                    "title_four = '%s', text_four = '%s', img_four = '%s'",
                            au.slogan, au.gif, au.yt, au.cards_amoun, au.title_one, au.text_one, au.img_one,
                            au.title_two, au.text_two, au.img_two, au.title_three, au.text_three,
                            au.img_three, au.title_four, au.text_four, au.img_four));
            query.executeQuery();

            return new WebSuccess("Aboutus information updated");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to update information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Purchase - API
    /**
     * End point para realizar la compra de un boleto.
     * 
     * Este método maneja la solicitud POST a la ruta
     * "/purchase/{amount}/{method}/{discount}" donde amount es la cantidad, method
     * es el tipo
     * de compra y discount es el descuento aplicado. Registra la compra de un
     * boleto en la base de datos.
     * 
     * @param ticket   Objeto `Ticket_purchase` que contiene la estructura del
     *                 ticket.
     * @param amount   Valor numérico representando la cantidad de tickets a
     *                 comprar.
     * @param method   String indicando el tipo de tarjeta utilizado para la compra.
     * @param discount Valor numérico indicando el descuento de la compra.
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * Una lista con objetios de tipo `userTickets` representando los
     *         tickets del usuario.
     *         * `WebError`: En caso de error durante el registro dentro de la base
     *         de datos o si el usuario no posee tickets.
     */
    @PostMapping("/purchase/{amount}/{method}/{discount}")
    public Object purchase(@RequestBody Ticket_purchase ticket, @PathVariable int amount, @PathVariable String method,
            @PathVariable int discount) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        LocalDateTime now = LocalDateTime.now();
        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE TICKETS\n" + //
                                    "SET user_id = '%d'\n" + //
                                    "WHERE flight_id = '%d'\n" + //
                                    "  AND state = '%s'\n" + //
                                    "  AND type = '%s'\n" + //
                                    "  AND ROWNUM <= '%d' AND user_id IS NULL",
                            ticket.user_id, ticket.flight_id, ticket.state, ticket.type, amount));
            query.executeQuery();

            PreparedStatement tickets_assigned = conn.prepareStatement(String.format(
                    "Select DISTINCT(t.ticket_id), t.user_id\n" + //
                            "FROM tickets t\n" + //
                            "JOIN purchase p ON t.ticket_id != p.ticket_id WHERE t.flight_id = '%d' and t.type = '%s' and t.user_id = '%d'",
                    ticket.flight_id, ticket.type, ticket.user_id));
            ResultSet usertickets = tickets_assigned.executeQuery();

            record userTickets(int ticket_id, int user_id) {
            }

            List<userTickets> usert = new ArrayList<>();
            while (usertickets.next()) {
                usert.add(new userTickets(
                        usertickets.getInt("ticket_id"),
                        usertickets.getInt("user_id")));

                int ticketId = usertickets.getInt("ticket_id");
                int userId = usertickets.getInt("user_id");

                PreparedStatement purchased_ticket = conn.prepareStatement(String.format(
                        "INSERT INTO purchase (ticket_id, user_id, purchase_date, paymenth_method, discount)\n" + //
                                "SELECT %d, %d, TO_DATE('%s', 'dd-MM-yyyy'), '%s', %d \n" + //
                                "WHERE NOT EXISTS (\n" + //
                                "  SELECT 1 FROM purchase\n" + //
                                "  WHERE ticket_id = %d AND user_id = %d)",
                        ticketId, userId, dtf.format(now), method, discount, ticketId, userId));
                purchased_ticket.executeQuery();

            }
            if (usert.isEmpty()) {
                return new WebError("This user doesn't have any tickets");
            }
            return usert;

        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to buy ticket");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Tickets information - Purchase
    /**
     * End point para obtener información sobre los tickets disponibles para compra.
     * 
     * Este método maneja la solicitud GET a la ruta
     * "/availabletickets/{flight_id}/{category}" donde flight_id es el
     * identificador del vuelo,
     * y category es la categoría del ticket a comprar. Devuelve la información de
     * los tickets disponibles para la compra.
     * 
     * @param flight_id Valor numérico indicando el identificador del vuelo.
     * @param category  String indicando la categoría del ticket a comprar.
     * @return Se devuelve uno de los siguientes objetos:
     *         * Una lista con objetos de tipo `Availabletickets` representando los
     *         tickets del usuario.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos o si no hay tickets disponibles.
     */
    @GetMapping("/availabletickets/{flight_id}/{category}")
    public Object getTicketstobuy(@PathVariable int flight_id, @PathVariable String category) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT t.ticket_id, t.price, o.name As origin, d.name as destination\n" + //
                                    "FROM tickets t\n" + //
                                    "JOIN Flights f ON f.flight_id = t.flight_id JOIN cities o ON f.origin = o.city_id JOIN cities d ON f.destination = d.city_id\n"
                                    + //
                                    "WHERE t.type = '%s' and t.flight_id = '%d' and t.state = 'active' and t.user_id IS null ",
                            category, flight_id));
            ResultSet result = query.executeQuery();

            record Availabletickets(String origin, String destination, int price, int ticket_id) {
            }

            List<Availabletickets> availabletickets = new ArrayList<>();
            while (result.next()) {
                availabletickets.add(new Availabletickets(
                        result.getString("origin"),
                        result.getString("destination"),
                        result.getInt("price"),
                        result.getInt("ticket_id")));
            }
            if (availabletickets.isEmpty()) {
                return new WebError("No tickets available");
            }
            return availabletickets;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to retrieve data");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Tickets available amount - Purchase
    /**
     * End point para obtener la cantidad de tickets disponibles de un vuelo.
     * 
     * Este método maneja la solicitud GET a la ruta
     * "/ticketsamount/{flight_id}/{category}" donde flight_id es el identificador
     * del vuelo,
     * y category es la categoría del ticket a comprar. Devuelve la cantidad de
     * tickets disponibles para la compra.
     * 
     * @param flight_id Valor numérico indicando el identificador del vuelo.
     * @param category  String indicando la categoría del ticket a comprar.
     * @return Dependiendo del resultado de la consulta, se devuelve uno de los
     *         siguientes objetos:
     *         * La cantidad de tickets disponibles para el vuelo y categoría.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos o si no hay tickets disponibles.
     */
    @GetMapping("/ticketsamount/{flight_id}/{category}")
    public Object getAmounttickets(@PathVariable int flight_id, @PathVariable String category) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT COUNT(ticket_id) as Tickets_amount\n" + //
                                    "FROM tickets \n" + //
                                    "WHERE type = '%s' and flight_id = '%d' and state = 'active' and user_id IS null ",
                            category, flight_id));
            ResultSet result = query.executeQuery();

            record ticketsamount(int tickets_amount) {
            }
            if (result.next()) {
                return new ticketsamount(
                        result.getInt("tickets_amount"));
            } else {
                return new WebError("No tickets available");
            }
            // return result;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to retrieve data");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Purchase logs - API
    /**
     * End point para obtener los registros de compra.
     * 
     * Este método maneja la solicitud GET a la ruta "/purchaselogs" y devuelve una
     * lista con la información detallada de todas las compras realizadas.
     * 
     * @return Dependiendo del resultado de la consulta, se devuelve uno de los
     *         siguientes objetos:
     *         * Una lista con objetos de tipo `purchases` representando los
     *         registros de compra.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos o si no hay compras realizadas.
     */
    @GetMapping("/purchaselogs")
    public Object getpurchaselogs() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT * FROM Historical_purchases"));
            ResultSet result = query.executeQuery();

            record purchases(String purchase_number, String ticket, String type, String origin, String destination,
                    String purchase_date, String price, String paymenth_method,
                    String departure_date, String arrival_date, int discount, String user_name) {
            }

            List<purchases> purchaseslogs = new ArrayList<>();
            while (result.next()) {
                purchaseslogs.add(new purchases(
                        result.getString("purchase_number"),
                        result.getString("ticket"),
                        result.getString("type"),
                        result.getString("origin"),
                        result.getString("destination"),
                        result.getString("purchase_date"),
                        result.getString("price"),
                        result.getString("paymenth_method"),
                        result.getString("departure_date"),
                        result.getString("arrival_date"),
                        result.getInt("discount"),
                        result.getString("user_name")));
            }
            if (purchaseslogs.isEmpty()) {
                return new WebError("This user doesn't have any purchases made");
            }
            return purchaseslogs;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get user tickets");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Header - GET INFORMATION
    /**
     * End point para obtener la información del header.
     * 
     * Este método maneja la solicitud GET a la ruta "/header" y devuelve un objeto
     * con la información configurada para el header.
     * 
     * @return Dependiendo del resultado de la consulta, se devuelve uno de los
     *         siguientes objetos:
     *         * Un objeto de tipo `Header` representando la información del header.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos.
     */
    @GetMapping("/header")
    public Object getHeader() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT * FROM Header"));
            ResultSet result = query.executeQuery();

            record Header(String Text_Logo,
                    String Section,
                    String Link_Section,
                    String Link_Profile,
                    String Link_Login,
                    String Logo) {
            }

            if (result.next()) {
                return new Header(
                        result.getString("Text_Logo"),
                        result.getString("Section"),
                        result.getString("Link_Section"),
                        result.getString("Link_Profile"),
                        result.getString("Link_Login"),
                        result.getString("Logo")

                );
            }
            return new WebError("Failed to get header information");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("API Incorrect");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Header - UPDATE
    /**
     * End point para actualizar la información del header.
     * 
     * Este método maneja la solicitud POST a la ruta "/update-header" y actualiza
     * la información del header.
     * 
     * @param head Valor correspondiente al de la clase para acceso a atributos
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: Mensaje que confirma que la operación se ha realizado
     *         exitosamente.
     *         * `WebError`: En caso de error durante el registro dentro de la base
     *         de datos.
     */
    @PostMapping("/update-header")
    public Object updateHeader(@RequestBody Header head) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            Statement checkStatement = conn.createStatement();
            ResultSet result = checkStatement.executeQuery("SELECT COUNT(*) FROM Header");
            result.next();
            int rowCount = result.getInt(1);

            if (rowCount == 0) {
                PreparedStatement insertStatement = conn.prepareStatement(String.format(
                        "INSERT INTO Header (TEXT_LOGO, SECTION, LINK_SECTION, LINK_PROFILE, LINK_LOGIN, LOGO) VALUES ('%s', '%s', '%s', '%s', '%s', '%s')",
                        head.Text_Logo, head.Section, head.Link_Section, head.Link_Profile, head.Link_Login,
                        head.Logo));
                insertStatement.executeUpdate();
                return new WebSuccess("Header information inserted");
            }
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE Header SET TEXT_LOGO = '%s', SECTION = '%s', LINK_SECTION = '%s', LINK_PROFILE = '%s', LINK_LOGIN = '%s', LOGO = '%s'",
                            head.Text_Logo, head.Section, head.Link_Section, head.Link_Profile, head.Link_Login,
                            head.Logo));
            query.executeQuery();

            return new WebSuccess("Header information updated");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to update information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // FLight and Tickets - Cancelation
    /**
     * End point para la cancelación de un vuelo.
     * 
     * Este método maneja la solicitud POST a la ruta "/cancelation/{flight_id}"
     * donde flight_id es el identificador del vuelo.
     * Cancela un vuelo y los tickets asociados a él.
     * 
     * @param flight_id Valor numérico indicando el identificador del vuelo.
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: Mensaje que confirma que la operación se ha realizado
     *         exitosamente.
     *         * `WebError`: En caso de error durante el registro dentro de la base
     *         de datos.
     */
    @PostMapping("/cancelation/{flight_id}")
    public Object updateFlightandTickets(@PathVariable int flight_id) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE FLIGHTS SET State = 0 WHERE FLIGHT_ID = %d",
                            flight_id));
            query.executeQuery();

            PreparedStatement ticketquery = conn
                    .prepareStatement(String.format(
                            "UPDATE TICKETS SET State = 'canceled' WHERE FLIGHT_ID = %d",
                            flight_id));
            ticketquery.executeQuery();
            // API call to nexus cancelation ticket
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(agencyUrls +
                    "deactivate/" + flight_id, HttpMethod.PUT, null, String.class);
            // End of API call

            return new WebSuccess("Flight and tickets canceled");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to execute operation");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Tickets Individual - Cancelation
    /**
     * End point para la cancelación individual de tickets.
     * 
     * Este método maneja la solicitud POST a la ruta "/ticketcanceled/{ticket_id}"
     * donde ticket_id es el identificador del ticket.
     * Cancela un tickets individual.
     * 
     * @param ticket_id Valor numérico indicando el identificador del ticket.
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: Mensaje que confirma que la operación se ha realizado
     *         exitosamente.
     *         * `WebError`: En caso de error durante el registro dentro de la base
     *         de datos.
     */
    @PostMapping("/ticketcanceled/{ticket_id}")
    public Object updateIndividualTicket(@PathVariable int ticket_id) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE TICKETS SET User_ID = NULL WHERE TICKET_ID = %d",
                            ticket_id));
            query.executeQuery();
            // API call to nexus cancelation ticket
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(agencyUrls +
                    "deactivateTicket/" + ticket_id, HttpMethod.PUT, null, String.class);
            // End of API call
            return new WebSuccess("User Ticket canceled");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to execute operation");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // User Discount - GET
    /**
     * End point para obtener el descuento de un usuario.
     * 
     * Este método maneja la solicitud GET a la ruta "/discount/{id}" donde id es el
     * identificador del usuario.
     * Obtiene el descuento aplicado a un usuario.
     * 
     * @param id Valor numérico indicando el identificador del usuario.
     * @return Dependiendo del resultado de la consulta, se devuelve uno de los
     *         siguientes objetos:
     *         * Un objeto de tipo `Discount` representando el porcentaje de
     *         descuento.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos.
     */
    @GetMapping("/discount/{id}")
    public Object getDiscount(@PathVariable int id) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT percentage FROM USERS WHERE user_id = %d",
                            id));
            ResultSet result = query.executeQuery();

            record Discount(int discount) {
            }

            if (result.next()) {
                return new Discount(
                        result.getInt("percentage"));
            }
            return new WebError("Failed to get user Discount");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to retrieve information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Update flight
    /**
     * End point para actualizar la información de un vuelo.
     * 
     * Este método maneja la solicitud POST a la ruta "/update-flight/{flight_id}"
     * donde flight_id es el identificador del vuelo.
     * Actualiza la información de un vuelo.
     * 
     * @param flight    Objeto `Flight` que contiene la estructura del vuelo.
     * @param flight_id Valor numérico indicando el identificador del vuelo.
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: Mensaje que confirma que la operación se ha realizado
     *         exitosamente.
     *         * `WebError`: En caso de error durante el registro dentro de la base
     *         de datos.
     */
    @PostMapping("/update-flight/{flight_id}")
    public Object updateFlight(@RequestBody Flight flight, @PathVariable int flight_id) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE FLIGHTS SET Origin = %d, Destination = %d, Departure_date = TO_TIMESTAMP('%s', 'YYYY-MM-DD HH24:MI:SS'), Arrival_date = TO_TIMESTAMP('%s', 'YYYY-MM-DD HH24:MI:SS'), Detail = '%s' WHERE FLIGHT_ID = %d",
                            flight.originCity, flight.destinationCity, flight.departureDate, flight.arrivalDate,
                            flight.detail, flight_id));
            query.executeQuery();

            return new WebSuccess("Flight updated successfully");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("API ERROR");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Footer - GET INFORMATION
    /**
     * End point para obtener la información del footer.
     * 
     * Este método maneja la solicitud GET a la ruta "/footer" y devuelve un objeto
     * con la información configurada para el footer.
     * 
     * @return Dependiendo del resultado de la consulta, se devuelve uno de los
     *         siguientes objetos:
     *         * Un objeto de tipo `Footer` representando la información del footer.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos.
     */
    @GetMapping("/footer")
    public Object getFooter() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT * FROM Footer"));
            ResultSet result = query.executeQuery();

            record Footer(
                    String Title_1,
                    String Section_1,
                    String L1,
                    String Section_2,
                    String L2,
                    String Section_3,
                    String L3,
                    String Section_4,
                    String L4,
                    String Section_5,
                    String L5,
                    String Section_6,
                    String L6,
                    String Title_2,
                    String Q_1,
                    String Link_quick_1,
                    String Q_2,
                    String Linkl_quick_2,
                    String Title_3,
                    String C_1,
                    String C_2,
                    String Copyright) {
            }

            if (result.next()) {
                return new Footer(
                        result.getString("Title_1"),
                        result.getString("Section_1"),
                        result.getString("L1"),
                        result.getString("Section_2"),
                        result.getString("L2"),
                        result.getString("Section_3"),
                        result.getString("L3"),
                        result.getString("Section_4"),
                        result.getString("L4"),
                        result.getString("Section_5"),
                        result.getString("L5"),
                        result.getString("Section_6"),
                        result.getString("L6"),
                        result.getString("Title_2"),
                        result.getString("Q_1"),
                        result.getString("Link_quick_1"),
                        result.getString("Q_2"),
                        result.getString("Link_quick_2"),
                        result.getString("Title_3"),
                        result.getString("C_1"),
                        result.getString("C_2"),
                        result.getString("Copyright"));
            }
            return new WebError("Failed to get footer information");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("API Incorrect");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Footer - UPDATE
    /**
     * End point para actualizar la información del footer.
     * 
     * Este método maneja la solicitud POST a la ruta "/update-footer" y actualiza
     * la información del footer.
     * 
     * @param footer Objeto de tipo `Footer` representando la estructura del footer.
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: Mensaje que confirma que la operación se ha realizado
     *         exitosamente.
     *         * `WebError`: En caso de error durante el registro dentro de la base
     *         de datos.
     */
    @PostMapping("/update-footer")
    public Object updateFooter(@RequestBody Footer footer) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            Statement checkStatement = conn.createStatement();
            ResultSet result = checkStatement.executeQuery("SELECT COUNT(*) FROM Footer");
            result.next();
            int rowCount = result.getInt(1);

            if (rowCount == 0) {
                PreparedStatement insertStatement = conn.prepareStatement(String.format(
                        "INSERT INTO Footer (Title_1, SECTION_1, L1, SECTION_2, L2, SECTION_3, L3, SECTION_4, L4, SECTION_5, L5, SECTION_6, L6,\n"
                                + //
                                "Title_2, Q_1, Link_quick_1, Q_2, Link_quick_2, Title_3, C_1, C_2, copyright) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s',\n"
                                + //
                                "'%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')",
                        footer.Title_1, footer.Section_1, footer.L1, footer.Section_2, footer.L2, footer.Section_3,
                        footer.L3, footer.Section_4, footer.L4,
                        footer.Section_5, footer.L5, footer.Section_6, footer.L6, footer.Title_2,
                        footer.Quick_Section_1, footer.Link_quick_1,
                        footer.Quick_Section_2, footer.Link_quick_2, footer.Title_3, footer.Contact_1,
                        footer.Contact_2, footer.copyright));
                insertStatement.executeUpdate();
                return new WebSuccess("Footer information inserted");
            }
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE Footer SET Title_1 = '%s', SECTION_1 = '%s', L1 = '%s', SECTION_2 = '%s', L2 = '%s', SECTION_3 = '%s', L3 = '%s', \n"
                                    + //
                                    "SECTION_4 = '%s', L4 = '%s', SECTION_5 = '%s', L5 = '%s', SECTION_6 = '%s', L6 = '%s', Title_2 = '%s', \n"
                                    + //
                                    "Q_1 = '%s', Link_quick_1 = '%s', Q_2 = '%s', Link_quick_2 = '%s', Title_3 = '%s', C_1 = '%s', C_2 = '%s', copyright = '%s'",
                            footer.Title_1, footer.Section_1, footer.L1, footer.Section_2, footer.L2, footer.Section_3,
                            footer.L3, footer.Section_4, footer.L4,
                            footer.Section_5, footer.L5, footer.Section_6, footer.L6, footer.Title_2,
                            footer.Quick_Section_1, footer.Link_quick_1,
                            footer.Quick_Section_2, footer.Link_quick_2, footer.Title_3, footer.Contact_1,
                            footer.Contact_2, footer.copyright));
            query.executeQuery();

            return new WebSuccess("Footer information updated");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to update information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Partners - GET INFORMATION
    /**
     * End point para obtener la información de los partners.
     * 
     * Este método maneja la solicitud GET a la ruta "/partners" y devuelve un
     * objeto con la información de los partners.
     * 
     * @return Dependiendo del resultado de la consulta, se devuelve uno de los
     *         siguientes objetos:
     *         * Un objeto de tipo `Partner` representando la información de los
     *         partners.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos.
     */
    @GetMapping("/partners")
    public Object getPartners() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT * FROM partners"));
            ResultSet result = query.executeQuery();

            record Partner(String Title, String Description, String Partner1, String L1, String Partner2, String L2,
                    String Partner3, String L3,
                    String Partner4, String L4, String Partner5, String L5) {
            }

            if (result.next()) {
                return new Partner(
                        result.getString("Title"),
                        result.getString("Description"),
                        result.getString("Partner_1"),
                        result.getString("L1"),
                        result.getString("Partner_2"),
                        result.getString("L2"),
                        result.getString("Partner_3"),
                        result.getString("L3"),
                        result.getString("Partner_4"),
                        result.getString("L4"),
                        result.getString("Partner_5"),
                        result.getString("L5"));
            }
            return new WebError("Failed to get partners");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("API Incorrect");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Partners - UPDATE
    /**
     * End point para actualizar la información de los partners.
     * 
     * Este método maneja la solicitud POST a la ruta "/update-partners" y actualiza
     * la información de los partners.
     * 
     * @param partner Objeto de tipo `Partners` representando la estructura de los
     *                partners.
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: Mensaje que confirma que la operación se ha realizado
     *         exitosamente.
     *         * `WebError`: En caso de error durante el registro dentro de la base
     *         de datos.
     */
    @PostMapping("/update-partners")
    public Object updatePartners(@RequestBody Partners partner) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            Statement checkStatement = conn.createStatement();
            ResultSet result = checkStatement.executeQuery("SELECT COUNT(*) FROM Partners");
            result.next();
            int rowCount = result.getInt(1);

            if (rowCount == 0) {
                PreparedStatement insertStatement = conn.prepareStatement(String.format(
                        "INSERT INTO Partners (Title, Description, Partner_1, L1, Partner_2, L2, Partner_3, L3, Partner_4, L4, Partner_5, L5)\n"
                                + //
                                "VALUES ('%s', '%s', '%s','%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')",
                        partner.Title, partner.Description, partner.Partner1, partner.L1, partner.Partner2,
                        partner.L2, partner.Partner3, partner.L3, partner.Partner4, partner.L4, partner.Partner5,
                        partner.L5));
                insertStatement.executeUpdate();
                return new WebSuccess("Partner information inserted");
            }
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE Partners SET Title = '%s', Description = '%s', Partner_1 = '%s', L1 = '%s', Partner_2 = '%s', L2 = '%s', Partner_3 = '%s', \n"
                                    + //
                                    "L3 = '%s', Partner_4 = '%s', L4 = '%s', Partner_5 = '%s', L5= '%s'",
                            partner.Title, partner.Description, partner.Partner1, partner.L1, partner.Partner2,
                            partner.L2,
                            partner.Partner3, partner.L3, partner.Partner4, partner.L4, partner.Partner5, partner.L5));
            query.executeQuery();

            return new WebSuccess("Partners information updated");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to update information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Modification Flight - GET INFORMATION OF RESPECTIVE USERS THAT THE FLIGHT
    // HAVE BEEN MODIFIED
    /**
     * End point para obtener la información de los usuarios que han comprado un
     * ticket de un vuelo modificado.
     * 
     * Este método maneja la solicitud GET a la ruta
     * "/modification-notification/{flightid}" donde flightid es el identificador
     * del vuelo.
     * Obtiene la información de los usuarios que han comprado un ticket de un vuelo
     * modificado.
     * 
     * @param flightid Valor numérico indicando el identificador del vuelo.
     * @return Dependiendo del resultado de la consulta, se devuelve uno de los
     *         siguientes objetos:
     *         * Una lista con objetos de tipo `userinformation` representando la
     *         información de los usuarios.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos o si no hay información disponible.
     */
    @GetMapping("/modification-notification/{flightid}")
    public Object getEmailParametersFlightModified(@PathVariable int flightid) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT concat(u.first_name,' ', u.last_name) as username, u.email, t.ticket_id, t.flight_id\n"
                                    + //
                                    "FROM tickets t\n" + //
                                    "Join Users u ON t.user_id = u.user_id where t.flight_id = %d",
                            flightid));
            ResultSet result = query.executeQuery();

            record userinformation(String name, String email, int flight_id, int ticket) {
            }

            List<userinformation> userinformations = new ArrayList<>();
            while (result.next()) {
                userinformations.add(new userinformation(
                        result.getString("username"),
                        result.getString("email"),
                        result.getInt("flight_id"),
                        result.getInt("ticket_id")));
            }
            if (userinformations.isEmpty()) {
                return new WebError("No information retrieve available");
            }
            return userinformations;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to retrieve information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // City - REGISTRATION
    /**
     * End point para registrar una ciudad.
     * 
     * Este método maneja la solicitud POST a la ruta "/create-city/{city}" donde
     * city es el nombre de la ciudad.
     * Registra una ciudad en la base de datos.
     * 
     * @param city Valor de tipo String indicando el nombre de la ciudad.
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: Mensaje que confirma que la operación se ha realizado
     *         exitosamente.
     *         * `WebError`: En caso de error durante el registro dentro de la base
     *         de datos.
     */
    @PostMapping("/create-city/{city}")
    public Object createCity(@PathVariable String city) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "INSERT INTO CITIES (name) values ('%s')",
                            city));
            query.executeQuery();
            return new WebSuccess("City added successfully");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to add city");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Cities - UPDATE
    /**
     * End point para actualizar el nombre de una ciudad.
     * 
     * Este método maneja la solicitud POST a la ruta "/update-city/{city}/{id}"
     * donde city es el nombre de la ciudad y id es el identificador de la ciudad.
     * Actualiza el nombre de una ciudad en la base de datos.
     * 
     * @param city Valor de tipo String indicando el nombre de la ciudad.
     * @param id   Valor numérico indicando el identificador de la ciudad.
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: Mensaje que confirma que la operación se ha realizado
     *         exitosamente.
     *         * `WebError`: En caso de error durante el registro dentro de la base
     *         de datos.
     */
    @PostMapping("/update-city/{city}/{id}")
    public Object updateCities(@PathVariable String city, @PathVariable int id) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE Cities SET Name = '%s' WHERE City_ID = %d",
                            city, id));
            query.executeQuery();
            return new WebSuccess("City name updated");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to update city");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Home - GET INFORMATION
    /**
     * End point para obtener la información de la página de inicio.
     * 
     * Este método maneja la solicitud GET a la ruta "/home" y devuelve un objeto
     * con la información configurada para la página de inicio.
     * 
     * @return Dependiendo del resultado de la consulta, se devuelve uno de los
     *         siguientes objetos:
     *         * Un objeto de tipo `Home` representando la información de la página
     *         de inicio.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos.
     */
    @GetMapping("/home")
    public Object getHome() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT * FROM Home"));
            ResultSet result = query.executeQuery();

            record Home(String Background, String FeatureImage1, String Title1, String Content1, String FeatureImage2,
                    String Title2, String Content2,
                    String FeatureImage3, String Title3, String Content3) {
            }

            if (result.next()) {
                return new Home(
                        result.getString("Background_Image"),
                        result.getString("FeatureImage_1"),
                        result.getString("Title_1"),
                        result.getString("Content_1"),
                        result.getString("FeatureImage_2"),
                        result.getString("Title_2"),
                        result.getString("Content_2"),
                        result.getString("FeatureImage_3"),
                        result.getString("Title_3"),
                        result.getString("Description_3"));
            }
            return new WebError("Failed to get home information");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("API Incorrect");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Home - UPDATE
    /**
     * End point para actualizar la información de la página de inicio.
     * 
     * Este método maneja la solicitud POST a la ruta "/update-home" y actualiza la
     * información de la página de inicio.
     * 
     * @param Home Objeto de tipo `Home` representando la estructura de la página de
     *             inicio.
     * @return Dependiendo del resultado del registro, se devuelve uno de los
     *         siguientes objetos:
     *         * `WebSuccess`: Mensaje que confirma que la operación se ha realizado
     *         exitosamente.
     *         * `WebError`: En caso de error durante el registro dentro de la base
     *         de datos.
     */
    @PostMapping("/update-home")
    public Object updateHome(@RequestBody Home Home) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            Statement checkStatement = conn.createStatement();
            ResultSet result = checkStatement.executeQuery("SELECT COUNT(*) FROM Home");
            result.next();
            int rowCount = result.getInt(1);

            if (rowCount == 0) {
                PreparedStatement insertStatement = conn.prepareStatement(String.format(
                        "INSERT INTO Home (BACKGROUND_IMAGE, FEATUREIMAGE_1, TITLE_1, CONTENT_1, FEATUREIMAGE_2, TITLE_2, CONTENT_2, FEATUREIMAGE_3, TITLE_3, DESCRIPTION_3)\n"
                                + //
                                "VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')",
                        Home.Background, Home.FlightImage1, Home.Title1, Home.Content1, Home.FlightImage2,
                        Home.Title2, Home.Content2, Home.FlightImage3, Home.Title3, Home.Content3));
                insertStatement.executeUpdate();
                return new WebSuccess("Home information inserted");
            }
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE Home SET BACKGROUND_IMAGE = '%s', FEATUREIMAGE_1 = '%s', TITLE_1 = '%s', CONTENT_1 = '%s', FEATUREIMAGE_2 = '%s', TITLE_2 = '%s', CONTENT_2 = '%s', FEATUREIMAGE_3 = '%s', TITLE_3 = '%s', DESCRIPTION_3 = '%s'",
                            Home.Background, Home.FlightImage1, Home.Title1, Home.Content1, Home.FlightImage2,
                            Home.Title2, Home.Content2, Home.FlightImage3, Home.Title3, Home.Content3));
            query.executeQuery();

            return new WebSuccess("Home information updated");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to update information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Scale Flights Simple - API
    /**
     * End point para obtener la información de los vuelos directos.
     * 
     * Este método maneja la solicitud GET a la ruta "/scale-flights-simple" y
     * devuelve un objeto con la información de los vuelos directos.
     * 
     * @param origin       Representa el pais seleccionado de busqueda el cual sera
     *                     el origen
     * @param destination  Representa el pais seleccionado de busqueda el cual sera
     *                     el destino
     * @param departureDay Dia de salida establecido en la busqueda
     * @return Dependiendo del resultado de la consulta, se devuelve uno de los
     *         siguientes objetos:
     *         * Una lista con objetos de tipo `FlightSimple` representando la
     *         información de los vuelos directos.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos o si no hay información disponible.
     */
    @GetMapping("/scale-flights")
    public Object getScaleFLights(
            @RequestParam(value = "originCity", defaultValue = "") int origin,
            @RequestParam(value = "destinationCity", defaultValue = "") int destination,
            @RequestParam(value = "departureDay", defaultValue = "") String departureDay) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT f.flight_id, origin, c1.name AS origin_city, destination, c2.name AS destination_city, f.departure_date, f.arrival_date,\n"
                                    + //
                                    "f.price_normal, f.price_premium, f.detail, f.type, f.state FROM Flights f INNER JOIN Cities c1 ON f.origin = c1.city_id INNER JOIN Cities c2 ON f.destination = c2.city_id\n"
                                    + //
                                    "WHERE flight_id IN (SELECT f1.FLIGHT_ID AS first_flight_id FROM Flights f1 INNER JOIN Flights f2 ON f1.destination = f2.ORIGIN WHERE f1.ORIGIN = %d AND f2.destination = %d\n"
                                    + //
                                    ") AND f.state = 1 AND TRUNC(f.departure_date) = TO_DATE('%s', 'YYYY-MM-DD') ORDER BY flight_id",
                            origin, destination, departureDay));
            ResultSet result = query.executeQuery();

            record FlightScale(int flightId, int originCityId, String originCityName, int destinationCityId,
                    String destinationCityName,
                    String departureDate, String arrivalDate, int touristQuantity, int businessQuantity,
                    int touristPrice, int businessPrice,
                    String detail, int type, int state, List<CommentaryRecord> commentaries, RatingRecord rating) {
            }

            List<FlightScale> flightscale = new ArrayList<>();
            while (result.next()) {
                List<CommentaryRecord> commentaries = new ArrayList<CommentaryRecord>();

                PreparedStatement countQuery = conn.prepareStatement(String
                        .format("SELECT (select count(ticket_id) from tickets where flight_id = %s and type = 'economy' and state = 'active' and user_id is null) as economy_quantity, (select count(ticket_id) from tickets where flight_id = %s and type = 'premium' and state = 'active' and user_id is null) as premium_quantity",
                                result.getInt("flight_id"), result.getInt("flight_id")));
                ResultSet countResult = countQuery.executeQuery();

                PreparedStatement commentariesQuery = conn.prepareStatement(String.format(
                        "SELECT comments.comment_id, comments.parent_comment_id, comments.user_id, comments.content, comments.creation_date, comments.path, comments.flight_id, users.first_name from comments inner join users on comments.user_id = users.user_id where comments.flight_id = %s",
                        result.getInt("flight_id")));
                ResultSet commentariesResult = commentariesQuery.executeQuery();

                PreparedStatement ratingsQuery = conn.prepareStatement(String.format(
                        "SELECT ratingAverage(%s) as rating, COUNT(ratings.rating_id) as count from ratings where flight_id = %s",
                        result.getInt("flight_id"), result.getInt("flight_id")));
                ResultSet ratingsResult = ratingsQuery.executeQuery();

                if (!countResult.next() || !ratingsResult.next()) {
                    return new WebError("Failed to retrieve flights");
                }

                while (commentariesResult.next()) {
                    commentaries.add(new CommentaryRecord(commentariesResult.getInt("comment_id"),
                            commentariesResult.getInt("parent_comment_id"),
                            commentariesResult.getInt("user_id"), commentariesResult.getString("content"),
                            commentariesResult.getString("creation_date"),
                            commentariesResult.getString("path"), commentariesResult.getInt("flight_id"),
                            commentariesResult.getString("first_name"), new ArrayList<CommentaryRecord>()));
                }

                flightscale.add(new FlightScale(
                        result.getInt("flight_id"),
                        result.getInt("origin"),
                        result.getString("origin_city"),
                        result.getInt("destination"),
                        result.getString("destination_city"),
                        result.getString("departure_date"),
                        result.getString("arrival_date"),
                        countResult.getInt("economy_quantity"),
                        countResult.getInt("premium_quantity"),
                        result.getInt("price_normal"),
                        result.getInt("price_premium"),
                        result.getString("detail"),
                        result.getInt("type"),
                        result.getInt("state"),
                        commentaries,
                        new RatingRecord(
                                ratingsResult.getInt("rating"), ratingsResult.getInt("count"))));
            }
            if (flightscale.isEmpty()) {
                return new Object[0];
            }
            return flightscale;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get scale flights");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Get a Cities - API
    /**
     * End point para obtener la información de las ciudades.
     * 
     * Este método maneja la solicitud GET a la ruta "/get-cities" y devuelve un
     * objeto con la información de las ciudades.
     * 
     * @param cityid Id correspondiente al ID de la ciudad seleccionada
     * @return Dependiendo del resultado de la consulta, se devuelve uno de los
     *         siguientes objetos:
     *         * Una lista con objetos de tipo `City` representando la información
     *         de las ciudades.
     *         * `WebError`: En caso de error durante la consulta dentro de la base
     *         de datos o si no hay información disponible.
     */
    @GetMapping("/get-city/{cityid}")
    public Object getOneCity(@PathVariable int cityid) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format("SELECT name FROM cities WHERE city_id = %d", cityid));
            ResultSet result = query.executeQuery();

            record UniqueCity(String name) {
            }

            if (result.next()) {
                return new UniqueCity(result.getString("name"));
            }
            return new WebError("City not found");

        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("User not found");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // GRAPH1 - INSERTION DATA AND ADITION OF COUNT SEACHES FOR TYPE
    /**
     * Actualiza la información del tipo de búsqueda en la tabla GRAPH1 aumentando
     * el
     * valor de la busqueda dependiendo del tipo que se haya realizado o inserta el
     * dato
     * en caso de que no encuentre dentro de la tabla.
     * 
     * @param type Tipo de búsqueda a actualizar (one-way o roundtrip)
     * @return WebSuccess en caso de éxito, WebError en caso de fallo.
     */
    @PostMapping("/typesearch/{type}")
    public Object typesearch(@PathVariable String type) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            PreparedStatement checkStatement = conn
                    .prepareStatement(String.format("SELECT * FROM GRAPH1 WHERE TYPE = '%s'", type));
            ResultSet result = checkStatement.executeQuery();

            if (!result.next()) {
                PreparedStatement insertStatement = conn.prepareStatement(String.format(
                        "INSERT INTO GRAPH1 (TYPE, COUNT) VALUES ('%s', %d)", type, 1));
                insertStatement.executeQuery();
            } else {
                PreparedStatement updatestatement = conn.prepareStatement(String.format(
                        "UPDATE GRAPH1 SET COUNT = COUNT + 1 WHERE TYPE = '%s'", type));
                updatestatement.executeQuery();
            }
            return new WebSuccess("Type search information updated");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to update information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // GRAPH1 - SELECT DATA
    /**
     * Obtiene información sobre tipos de búsqueda y la cantidad de busquedas
     * realizadas para cada uno de ellos para alimentar
     * a la grafica respectiva
     * 
     * @return Lista de datagraphs o WebError.
     */
    @GetMapping("/typesearch")
    public Object typesearch() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT TYPE, Count FROM GRAPH1"));
            ResultSet result = query.executeQuery();

            record datagraph(String TYPE, int count) {
            }

            List<datagraph> datagraphs = new ArrayList<>();
            while (result.next()) {
                datagraphs.add(new datagraph(
                        result.getString("TYPE"),
                        result.getInt("COUNT")));
            }
            if (datagraphs.isEmpty()) {
                return new WebError("Users havent search any type of flight");
            }
            return datagraphs;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get type stats");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // GRAPH2 - INSERTION DATA AND ADITION OF COUNT SEACHES FOR CITIES
    /**
     * Actualiza la información de las ciudades buscadas en la tabla GRAPH2
     * aumentando
     * el valor de la busqueda correspondiente dependiendo del la ciudad buscada
     * en caso de que no encuentre dentro de la tabla inserta la ciudad con un
     * conteo de 1.
     * 
     * @param id Identificador de la ciudad.
     * @return WebSuccess en caso de éxito, WebError en caso de fallo.
     */
    @PostMapping("/citysearch/{id}")
    public Object citysearch(@PathVariable int id) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            PreparedStatement checkStatement = conn
                    .prepareStatement(String.format("SELECT * FROM GRAPH2 WHERE CITY_ID = %d", id));
            ResultSet result = checkStatement.executeQuery();

            if (!result.next()) {
                PreparedStatement insertStatement = conn.prepareStatement(String.format(
                        "INSERT INTO GRAPH2 (CITY_ID, COUNT) VALUES (%d, %d)", id, 1));
                insertStatement.executeQuery();
            } else {
                PreparedStatement updatestatement = conn.prepareStatement(String.format(
                        "UPDATE GRAPH2 SET COUNT = COUNT + 1 WHERE CITY_ID = %d", id));
                updatestatement.executeQuery();
            }
            return new WebSuccess("City search information updated");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to update information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // GRAPH2 - SELECT DATA
    /**
     * Obtiene información sobre las ciuades buscadas y la cantidad de busquedas
     * asociadas a cada ciudad para generar los datos en la grafica
     * a la grafica respectiva
     * 
     * @return Lista de datagraphs o WebError.
     */
    @GetMapping("/citysearchgraph")
    public Object citysearchgraph() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT C.name CITY, G.count FROM GRAPH2 G JOIN Cities C ON G.CITY_ID = C.CITY_ID"));
            ResultSet result = query.executeQuery();

            record datagraph(String CITY, int count) {
            }

            List<datagraph> datagraphs = new ArrayList<>();
            while (result.next()) {
                datagraphs.add(new datagraph(
                        result.getString("CITY"),
                        result.getInt("count")));
            }
            if (datagraphs.isEmpty()) {
                return new WebError("No cities have been searched");
            }
            return datagraphs;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get city stats");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // GRAPH3 - SELECT DATA
    /**
     * Obtiene información de las compras realizadas por cada tipo de usuario
     * adjuntando su conteo de valores
     * para posteriormente ser utilizados en el FE para generar datos estadisticos
     * respecto a esta informacion
     * 
     * @return Lista de datagraphs o WebError.
     */
    @GetMapping("/userspurchasedata")
    public Object userspurchasedata() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT CASE WHEN role = 'admin' THEN 'Admin' WHEN role = 'user' THEN 'Users' ELSE 'Enterprise' END AS role, COUNT(*) AS Count \n"
                                    + //
                                    "FROM GRAPH3_DATA GROUP BY CASE WHEN role = 'admin' THEN 'Admin' WHEN role = 'user' THEN 'Users' ELSE 'Enterprise' END"));
            ResultSet result = query.executeQuery();

            record datagraph(String Role, int count) {
            }

            List<datagraph> datagraphs = new ArrayList<>();
            while (result.next()) {
                datagraphs.add(new datagraph(
                        result.getString("ROLE"),
                        result.getInt("COUNT")));
            }
            if (datagraphs.isEmpty()) {
                return new WebError("No users have made a purchase");
            }
            return datagraphs;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get users purchase stats");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Insertion of searches made
    /**
     * Registra búsquedas de vuelos en la base de datos.
     * 
     * Este método recibe un objeto `Search` que toma los detalles de la
     * búsqueda (origen, destino, fechas, etc.)
     * e inserta la información en la tabla `SEARCHES`.
     * 
     * El método maneja dos escenarios: vuelos de ida y vuelta (con fecha de
     * regreso) y vuelos de ida
     * (sin fecha de regreso).
     * 
     * @param search Objeto `Search` que contiene los detalles de la búsqueda.
     * @return WebSuccess en caso de éxito, WebError en caso de fallo.
     */
    @PostMapping("/searchregistration")
    public Object searchregistration(@RequestBody Search search) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        Date currentDate = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        String formattedDate = formatter.format(currentDate);

        try {
            if (search.return_date == null) {
                PreparedStatement insertStatemento = conn.prepareStatement(String.format(
                        "INSERT INTO SEARCHES (ORIGIN, DESTINATION, DEPARTURE, RETURN, PASSENGERS, FLIGHT_TYPE, TYPE_SEARCH, DATE_MADE)\n"
                                + //
                                "VALUES (%d, %d, TO_DATE('%s', 'YYYY-MM-DD'), NULL, %d, '%s', '%s', TO_DATE('%s', 'YYYY-MM-DD'))",
                        search.origin, search.destination, search.departure_date, search.passengers,
                        search.flight_type, search.type_search, formattedDate));
                insertStatemento.executeUpdate();
                return new WebSuccess("Search information inserted");
            } else {
                PreparedStatement insertStatementt = conn.prepareStatement(String.format(
                        "INSERT INTO SEARCHES (ORIGIN, DESTINATION, DEPARTURE, RETURN, PASSENGERS, FLIGHT_TYPE, TYPE_SEARCH, DATE_MADE)\n"
                                + //
                                "VALUES (%d, %d, TO_DATE('%s', 'YYYY-MM-DD'), TO_DATE('%s', 'YYYY-MM-DD'), %d, '%s', '%s', TO_DATE('%s', 'YYYY-MM-DD'))",
                        search.origin, search.destination, search.departure_date, search.return_date,
                        search.passengers,
                        search.flight_type, search.type_search, formattedDate));
                insertStatementt.executeUpdate();
                return new WebSuccess("Search information inserted");
            }
            // return new WebSuccess("Search information inserted");

        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to insert information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Selection of searches made
    /**
     * Obtiene historial de búsquedas realizadas dentro del sistema.
     * 
     * @return Lista de búsquedas o WebError.
     */
    @GetMapping("/searchdatatake")
    public Object searchdatatake() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT o.name as Origin, d.name as Destination, Departure, Return, Passengers, Flight_type, type_search, date_made\n"
                                    + //
                                    "FROM SEARCHES s JOIN cities o ON s.origin = o.city_id JOIN cities d ON s.destination = d.city_id"));
            ResultSet result = query.executeQuery();

            record list(String Origin, String Destination, String Departure_date, String Return_date, int passengers,
                    String Flight_type, String type_search,
                    String date_made) {
            }

            List<list> list = new ArrayList<>();
            while (result.next()) {
                list.add(new list(
                        result.getString("Origin"),
                        result.getString("Destination"),
                        result.getString("Departure"),
                        result.getString("Return"),
                        result.getInt("Passengers"),
                        result.getString("Flight_type"),
                        result.getString("type_search"),
                        result.getString("date_made")));
            }
            if (list.isEmpty()) {
                return new WebError("No users have made a search");
            }
            return list;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get users search stats");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Insertion of hotel aliance
    /**
     * Registra alianzas e informacion de estas en la base de datos
     * 
     * 
     * El método guarda la IP, endpoint y un key necesario para zen como token.
     * 
     * @param aliance Objeto `Aliance` que contiene los detalles de la alianza.
     * @return WebSuccess en caso de éxito, WebError en caso de fallo.
     */
    @PostMapping("/alianceinsertion")
    public Object alianceinsertion(@RequestBody Aliance aliance) {
        Connection conn = new OracleConnector(oracleUser).getConnection();

        try {
            PreparedStatement insertStatemento = conn.prepareStatement(String.format(
                    "INSERT INTO ALIANCE (IP, ENDPOINT, KEY) VALUES ('%s', '%s', '%s')",
                    aliance.IP, aliance.endpoint, aliance.key));
            insertStatemento.executeUpdate();
            return new WebSuccess("Aliance information inserted");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to insert information");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    @GetMapping("/getAliances")
    public Object getAliances() {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "SELECT * FROM aliance"));
            ResultSet result = query.executeQuery();

            record aliance(int ID, String IP, String endpoint, String key) {
            }

            List<aliance> aliance = new ArrayList<>();
            while (result.next()) {
                aliance.add(new aliance(
                        result.getInt("ID"),
                        result.getString("IP"),
                        result.getString("endpoint"),
                        result.getString("key")));
            }
            if (aliance.isEmpty()) {
                return new WebError("No users have made a search");
            }
            return aliance;
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to get users search stats");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    @PostMapping("/update-aliance/{id}")
    public Object updateAliance(@PathVariable int id, @RequestBody Aliance aliance) {
        Connection conn = new OracleConnector(oracleUser).getConnection();
        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "UPDATE ALIANCE SET IP = '%s', ENDPOINT = '%s', KEY = '%s' WHERE ID = %d",
                            aliance.IP, aliance.endpoint, aliance.key, id));
            query.executeQuery();
            return new WebSuccess("Aliance updated");
        } catch (Throwable e) {
            e.printStackTrace();
            return new WebError("Failed to update Aliance");
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

}
