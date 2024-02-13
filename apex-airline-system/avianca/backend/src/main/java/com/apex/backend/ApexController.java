package com.apex.backend;

import java.sql.*;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin
@RestController
public class ApexController {

    public record Greeting(long id, String content) {
    }

    private static final String template = "Hello, %s!";
    private final AtomicLong counter = new AtomicLong();

    @GetMapping("/greeting")
    public Greeting greeting(@RequestParam(value = "name", defaultValue = "World") String name) {
        return new Greeting(counter.incrementAndGet(), String.format(template, name));
    }

    // USER - LOGIN
    @PostMapping("/login")
    public Object signIn(@RequestBody User user) {
        Connection conn = new OracleConnector().getConnection();

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
                        result.getString("age"));
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
    @PostMapping("/create-user")
    public Object createUser(@RequestBody User user) {

        Connection conn = new OracleConnector().getConnection();

        String passwordHash = BCrypt.hashpw(user.password, BCrypt.gensalt());

        try {
            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "INSERT INTO users (email, password, first_name, last_name, origin_country, passport_number, role, age) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', 'user', %s)",
                            user.email, passwordHash, user.firstName, user.lastName, user.originCountry,
                            user.passportNumber, user.age));
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
                    result.getString("age"));
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

    @GetMapping("/get-user/{id}")
    public Object getUser(@PathVariable Long id) {
        Connection conn = new OracleConnector().getConnection();

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

    // FLIGHT - REGISTRATION
    @PostMapping("/register-flight")
    public Object register_flight(@RequestBody Flights flight) {
        Connection conn = new OracleConnector().getConnection();
        try {

            PreparedStatement query = conn
                    .prepareStatement(String.format(
                            "INSERT INTO FLIGHTS (origin, destination, departure_date, arrival_date, amount_normal, amount_premium, price_normal, price_premium, type, detail, state) VALUES ('%s', '%s', TO_DATE('%s', 'dd-MM-yyyy'), TO_DATE('%s', 'dd-MM-yyyy'), %s, %s, %s, %s, %s, '%s', 1)",
                            flight.origin, flight.destination, flight.departure_date, flight.arrival_date,
                            flight.amount_normal_tickets, flight.amount_premium_tickets,
                            flight.price_normal, flight.price_premium, flight.type, flight.detail));
            query.executeQuery();
            return "Flight created";
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
}
