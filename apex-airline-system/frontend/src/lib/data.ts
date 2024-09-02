import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function getLocations() {
  try {
    const database = client.db(process.env.DB_NAME);
    const locationsCollection = database.collection<HotelLocation>("locations");

    const result = locationsCollection.find();

    const locations = [];
    for await (const location of result) {
      locations.push({ ...location, _id: location._id.toString() });
    }

    return locations;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Cities");
  }
}

export async function getLocationById(id: string) {
  try {
    const database = client.db(process.env.DB_NAME);
    const locationsCollection = database.collection("locations");

    const result = await locationsCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      throw new Error("Location not found");
    }

    const location = { ...result, _id: result._id.toString() };

    return location as HotelLocation;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Location");
  }
}

export async function getHotels() {
  try {
    const database = client.db(process.env.DB_NAME);
    const hotelsCollection = database.collection<Hotel>("hotels");

    const result = hotelsCollection.find();

    const hotels = [];
    for await (const hotel of result) {
      const commentaries = generateCommentaryTree(hotel.commentaries);

      hotels.push({ ...hotel, _id: hotel._id.toString(), commentaries });
    }

    return hotels;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Hotels");
  }
}

export async function getAvailableHotels() {
  try {
    const database = client.db(process.env.DB_NAME);
    const hotelsCollection = database.collection("hotels");

    const result = hotelsCollection.find({ state: "active" });

    const hotels = [];
    for await (const hotel of result) {
      const commentaries = generateCommentaryTree(hotel.commentaries);

      hotels.push({ ...hotel, _id: hotel._id.toString(), commentaries });
    }

    return hotels as Hotel[];
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Hotels");
  }
}

export async function getHotelById(id: string) {
  try {
    const database = client.db(process.env.DB_NAME);
    const hotelsCollection = database.collection("hotels");

    const result = await hotelsCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      throw new Error("Hotel not found");
    }

    const hotel = { ...result, _id: result._id.toString() };

    return hotel as Hotel;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Hotel");
  }
}

export async function getCities() {
  try {
    const database = client.db(process.env.DB_NAME);
    const citiesCollection = database.collection("locations");

    const cities = await citiesCollection.distinct("city");

    return cities;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Cities");
  }
}

export async function getFilteredHotels(searchParams: HotelSearchParams) {
  try {
    const database = client.db(process.env.DB_NAME);
    const hotelsCollection = database.collection<Hotel>("hotels");

    const result = hotelsCollection.find({
      "location.city": searchParams.location,
      state: "active",
      // guests: { $gte: searchParams.guests },
    });

    const hotels = [];
    for await (const hotel of result) {
      const commentaries = generateCommentaryTree(hotel.commentaries);

      hotels.push({ ...hotel, _id: hotel._id.toString(), commentaries });
    }

    return hotels;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Hotels");
  }
}

export async function getUsers() {
  try {
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection<User>("users");

    const result = usersCollection.find();

    const users = [];
    for await (const user of result) {
      users.push({ ...user, _id: user._id.toString() });
    }

    return users;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Users");
  }
}

export async function getUserById(id: string) {
  try {
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    const result = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      throw new Error("User not found");
    }

    const user = { ...result, _id: result._id.toString() };

    return user as User;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve User");
  }
}

export async function getReservations() {
  try {
    const database = client.db(process.env.DB_NAME);
    const reservationsCollection = database.collection("reservations");

    const result = reservationsCollection.aggregate([
      {
        $lookup: {
          from: "hotels",
          localField: "hotelId",
          foreignField: "_id",
          as: "hotel",
        },
      },
      {
        $unwind: "$hotel",
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          _id: { $toString: "$_id" },
          userId: { $toString: "$userId" },
          hotelId: { $toString: "$hotelId" },
          "hotel._id": { $toString: "$hotel._id" },
          "user._id": { $toString: "$user._id" },
        },
      },
    ]);

    const reservations = [];
    for await (const reservation of result) {
      const commentaries = generateCommentaryTree(
        reservation.hotel.commentaries
      );

      reservations.push({
        ...reservation,
        hotel: { ...reservation.hotel, commentaries: commentaries },
      });
    }

    return reservations as Reservation[];
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Reservations");
  }
}

export async function getUserReservations(userId: string) {
  try {
    const database = client.db(process.env.DB_NAME);
    const reservationsCollection = database.collection("reservations");

    const result = reservationsCollection.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "hotels",
          localField: "hotelId",
          foreignField: "_id",
          as: "hotel",
        },
      },
      {
        $unwind: "$hotel",
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          _id: { $toString: "$_id" },
          userId: { $toString: "$userId" },
          hotelId: { $toString: "$hotelId" },
          "hotel._id": { $toString: "$hotel._id" },
          "user._id": { $toString: "$user._id" },
        },
      },
    ]);

    const reservations = [];
    for await (const reservation of result) {
      const commentaries = generateCommentaryTree(
        reservation.hotel.commentaries
      );

      reservations.push({
        ...reservation,
        hotel: { ...reservation.hotel, commentaries: commentaries },
      });
    }

    return reservations as Reservation[];
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Reservations");
  }
}

export async function getReservationById(id: string) {
  try {
    const database = client.db(process.env.DB_NAME);

    const hotelCollection = database.collection("hotels");
    const userCollection = database.collection("users");
    const reservationsCollection = database.collection("reservations");

    const reservationResult = await reservationsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!reservationResult) {
      throw new Error("Reservation not found");
    }

    const hotelResult = await hotelCollection.findOne({
      _id: reservationResult.hotelId,
    });

    if (!hotelResult) {
      throw new Error("Hotel not found");
    }

    const userResult = await userCollection.findOne({
      _id: reservationResult.userId,
    });

    if (!userResult) {
      throw new Error("User not found");
    }

    const commentaries = generateCommentaryTree(hotelResult.commentaries);

    const reservation = {
      ...reservationResult,
      _id: reservationResult._id.toString(),
      hotelId: reservationResult.hotelId.toString(),
      userId: reservationResult.userId.toString(),
      hotel: { ...hotelResult, commentaries, _id: hotelResult._id.toString() },
      user: { ...userResult, _id: userResult._id.toString() },
    };

    return reservation as Reservation;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Reservation");
  }
}

export async function getFeaturedHotel() {
  try {
    const database = client.db(process.env.DB_NAME);
    const hotelsCollection = database.collection<Hotel>("hotels");

    const result = hotelsCollection
      .find()
      .sort({ "reviews.average": -1 })
      .limit(1);

    const array = await result.toArray();

    if (array.length === 0) {
      return null;
    }
    
    const commentaries = generateCommentaryTree(array[0].commentaries);

    const featuredHotel = {
      ...array[0],
      commentaries: commentaries,
      _id: array[0]._id.toString(),
    };

    return featuredHotel;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Featured Hotel");
  }
}

export async function getPartners() {
  try {
    const database = client.db(process.env.DB_NAME);
    const partnersCollection = database.collection<Partner>("partners");

    const result = partnersCollection.find();

    const partners = [];
    for await (const partner of result) {
      partners.push({ ...partner, _id: partner._id.toString() });
    }

    return partners;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Partners");
  }
}

export async function getSiteIdentity() {
  try {
    const database = client.db(process.env.DB_NAME);
    const siteIdentityCollection =
      database.collection<SiteIdentity>("siteIdentity");

    const result = await siteIdentityCollection.findOne();

    if (!result) {
      return {
        name: "Zen Systems",
        logo: "/logo.png",
        description: "",
        vision: "",
        mission: "",
        contactNumber: "",
        address: "",
        copyright: "",
      };
    }

    return result;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Site Identity");
  }
}

export async function getAnalytics(filters: {
  source?: "web" | "rest";
  location?: string;
  checkin?: string;
  checkout?: string;
  madeAt?: string;
}) {
  try {
    const database = client.db(process.env.DB_NAME);
    const analyticsCollection = database.collection<Analytic>("analytics");

    const result = analyticsCollection.find({ ...filters });

    const analytics = [];
    for await (const analytic of result) {
      analytics.push({ ...analytic, _id: analytic._id.toString() });
    }

    return analytics;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Analytics");
  }
}

export async function getStats() {
  try {
    const database = client.db(process.env.DB_NAME);
    const analyticsCollection = database.collection<Analytic>("analytics");

    const statsResult = analyticsCollection.aggregate([
      {
        $group: {
          _id: { location: "$location", source: "$source" },
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = [];
    for await (const analytic of statsResult) {
      stats.push(analytic);
    }

    return stats;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Stats");
  }
}

export async function getAgencies() {
  try {
    const database = client.db(process.env.DB_NAME);
    const agenciesCollection = database.collection<Agency>("agencies");

    const result = agenciesCollection.find();

    const agencies = [];
    for await (const agency of result) {
      agencies.push({ ...agency, _id: agency._id.toString() });
    }

    return agencies;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Agencies");
  }
}

export async function getAlliances() {
  try {
    const database = client.db(process.env.DB_NAME);
    const alliancesCollection = database.collection<Alliance>("alliances");

    const result = alliancesCollection.find();

    const alliances = [];
    for await (const alliance of result) {
      alliances.push({ ...alliance, _id: alliance._id.toString() });
    }

    return alliances;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Retrieve Alliances");
  }
}

export async function confirmAlliance(key: string) {
  try {
    const database = client.db(process.env.DB_NAME);
    const alliancesCollection = database.collection("alliances");

    const result = await alliancesCollection.findOne({ key });

    if (!result) {
      throw new Error("Invalid Alliance");
    }

    const alliance = { ...result, _id: result._id.toString() };

    return alliance as Alliance;
  } catch (e) {
    console.log(e);
    throw new Error("Failed to Confirm Alliance");
  }
}

const generateCommentaryTree = function (
  commentaries: Commentary[],
  parentId: string | "" = ""
) {
  const result = [];

  for (const commentary of commentaries) {
    if (commentary.parentId === parentId) {
      const children = generateCommentaryTree(commentaries, commentary._id);
      if (children.length) {
        commentary.children = children;
      }
      result.push(commentary);
    }
  }

  return result;
};
