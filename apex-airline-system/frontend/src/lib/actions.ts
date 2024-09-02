"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";
// Date Utilities
import { format } from "date-fns";
// Password Utilities
const bcrypt = require("bcrypt");
// JSON Web Token Utilities
import * as jose from "jose";
// Email Utilities
const nodemailer = require("nodemailer");

import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "MS_zoX6hx@trial-ynrw7gyqe7n42k8e.mlsender.net",
    pass: process.env.EMAIL_CREDENTIALS,
  },
});

export async function signIn(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const users = database.collection("users");

    const user = await users.findOne({ email: rawFormData.email });

    if (!user) {
      return {
        error: "User not found.",
      };
    }

    const passwordMatch = await bcrypt.compare(
      rawFormData.password,
      user.password
    );

    if (!passwordMatch) {
      return {
        error: "Invalid password.",
      };
    }

    const { password, ...userWithoutPassword } = user;
    const alg = "HS256";
    const jwt = await new jose.SignJWT(userWithoutPassword)
      .setProtectedHeader({ alg })
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    cookies().set("token", jwt, {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Sign In.",
    };
  }

  const params = formData.get("params") as string;
  const searchParams = new URLSearchParams(params);

  redirect(params ? `${searchParams.get("pathname")}?${params}` : "/");
}

export async function signUp(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    if (rawFormData.password !== rawFormData.passwordConfirmation) {
      return {
        error: "Passwords do not match.",
      };
    }

    const database = client.db(process.env.DB_NAME);
    const users = database.collection("users");

    const existingUser = await users.findOne({ email: rawFormData.email });

    if (existingUser) {
      return {
        error: "User already exists.",
      };
    }

    const saltRounds = 10;
    const user = {
      email: rawFormData.email,
      password: await bcrypt.hash(rawFormData.password, saltRounds),
      age: Number(rawFormData.age),
      firstName: rawFormData.firstName,
      lastName: rawFormData.lastName,
      originCountry: rawFormData.originCountry,
      passportNumber: rawFormData.passportNumber,
      role: "user",
    };

    await users.insertOne(user);

    const { password, ...userWithoutPassword } = user;
    const alg = "HS256";
    const jwt = await new jose.SignJWT(userWithoutPassword)
      .setProtectedHeader({ alg })
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    cookies().set("token", jwt, {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Create User.",
    };
  }

  const params = formData.get("params") as string;
  const searchParams = new URLSearchParams(params);

  redirect(params ? `${searchParams.get("pathname")}?${params}` : "/");
}

export async function createHotel(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    if (!rawFormData.city) {
      return {
        error: "Please select a location.",
      };
    }

    const database = client.db(process.env.DB_NAME);
    const hotels = database.collection("hotels");

    const hotel = {
      name: rawFormData.name,
      description: rawFormData.description,
      amenities: JSON.parse(rawFormData.amenities as string),
      picture: rawFormData.picture,
      location: {
        street: rawFormData.street,
        city: rawFormData.city,
        state: rawFormData.state,
        country: rawFormData.country,
        address: rawFormData.address,
      },
      reviews: {
        count: 0,
        rating: 0,
        average: 0,
      },
      rooms: {
        juniorSuite: {
          picture: rawFormData.juniorSuitePicture,
          price: Number(rawFormData.juniorSuitePrice),
          description: rawFormData.juniorSuiteDescription,
          maxOccupancy: Number(rawFormData.juniorSuiteMaxOccupancy),
          beds: {
            amount: Number(rawFormData.juniorSuiteBedsAmount),
            size: rawFormData.juniorSuiteBedsSize,
          },
          roomSize: rawFormData.juniorSuiteRoomSize,
          totalRooms: Number(rawFormData.juniorSuiteTotalRooms),
          reservedRooms: 0,
        },
        standardSuite: {
          picture: rawFormData.standardSuitePicture,
          price: Number(rawFormData.standardSuitePrice),
          description: rawFormData.standardSuiteDescription,
          maxOccupancy: Number(rawFormData.standardSuiteMaxOccupancy),
          beds: {
            amount: Number(rawFormData.standardSuiteBedsAmount),
            size: rawFormData.standardSuiteBedsSize,
          },
          roomSize: rawFormData.standardSuiteRoomSize,
          totalRooms: Number(rawFormData.standardSuiteTotalRooms),
          reservedRooms: 0,
        },
        doubleSuite: {
          picture: rawFormData.doubleSuitePicture,
          price: Number(rawFormData.doubleSuitePrice),
          description: rawFormData.doubleSuiteDescription,
          maxOccupancy: Number(rawFormData.doubleSuiteMaxOccupancy),
          beds: {
            amount: Number(rawFormData.doubleSuiteBedsAmount),
            size: rawFormData.doubleSuiteBedsSize,
          },
          roomSize: rawFormData.doubleSuiteRoomSize,
          totalRooms: Number(rawFormData.doubleSuiteTotalRooms),
          reservedRooms: 0,
        },
        bigSuite: {
          picture: rawFormData.bigSuitePicture,
          price: Number(rawFormData.bigSuitePrice),
          description: rawFormData.bigSuiteDescription,
          maxOccupancy: Number(rawFormData.bigSuiteMaxOccupancy),
          beds: {
            amount: Number(rawFormData.bigSuiteBedsAmount),
            size: rawFormData.bigSuiteBedsSize,
          },
          roomSize: rawFormData.bigSuiteRoomSize,
          totalRooms: Number(rawFormData.bigSuiteTotalRooms),
          reservedRooms: 0,
        },
      },
      commentaries: [],
      state: "active",
    };

    await hotels.insertOne(hotel);
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Create Hotel.",
    };
  }

  redirect("/administration/hotels");
}

export async function createCommentary(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    if (!rawFormData.message) {
      return {
        error: "Please enter a message.",
      };
    }

    const token = cookies().get("token");

    if (!token) {
      return {
        error: "Please sign in to leave a commentary.",
      };
    }

    const { payload }: { payload: User } = await jose.jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    const commentary = {
      _id: Date.now().toString(),
      parentId: rawFormData.parentId || "",
      userId: payload._id,
      userName: payload.firstName + " " + payload.lastName,
      date: format(new Date(), "MM/dd/yyyy HH:mm"),
      message: rawFormData.message,
    };

    const database = client.db(process.env.DB_NAME);
    const hotels = database.collection("hotels");

    await hotels.updateOne(
      { _id: new ObjectId(rawFormData.hotelId as string) },
      { $push: { commentaries: commentary } }
    );
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Create Commentary.",
    };
  }

  revalidatePath("/");
}

export async function createLocation(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const locations = database.collection("locations");

    const location = {
      street: rawFormData.street,
      city: rawFormData.city,
      state: rawFormData.state,
      country: rawFormData.country,
      address: `${rawFormData.street} ${rawFormData.city}, ${rawFormData.state}, ${rawFormData.country}`,
      picture: rawFormData.picture,
    };

    await locations.insertOne(location);
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Create Location.",
    };
  }

  redirect("/administration/locations");
}

export async function updateLocation(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const locations = database.collection("locations");

    const location = {
      street: rawFormData.street,
      city: rawFormData.city,
      state: rawFormData.state,
      country: rawFormData.country,
      address: `${rawFormData.street} ${rawFormData.city}, ${rawFormData.state}, ${rawFormData.country}`,
      picture: rawFormData.picture,
    };

    await locations.updateOne(
      { _id: new ObjectId(rawFormData._id as string) },
      { $set: location }
    );
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Update Location.",
    };
  }

  redirect("/administration/locations");
}

export async function deleteLocation(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const locations = database.collection("locations");

    await locations.deleteOne({
      _id: new ObjectId(rawFormData._id as string),
    });
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Delete Location.",
    };
  }

  revalidatePath("/administration/locations");
}

export async function updateHotel(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    if (!rawFormData.city) {
      return {
        error: "Please select a location.",
      };
    }

    const database = client.db(process.env.DB_NAME);
    const hotels = database.collection("hotels");

    const hotel = {
      name: rawFormData.name,
      description: rawFormData.description,
      amenities: JSON.parse(rawFormData.amenities as string),
      picture: rawFormData.picture,
      location: {
        street: rawFormData.street,
        city: rawFormData.city,
        state: rawFormData.state,
        country: rawFormData.country,
        address: rawFormData.address,
      },
      // reviews: {
      //   count: 0,
      //   average: 0,
      // },
      rooms: {
        juniorSuite: {
          picture: rawFormData.juniorSuitePicture,
          price: Number(rawFormData.juniorSuitePrice),
          description: rawFormData.juniorSuiteDescription,
          maxOccupancy: Number(rawFormData.juniorSuiteMaxOccupancy),
          beds: {
            amount: Number(rawFormData.juniorSuiteBedsAmount),
            size: rawFormData.juniorSuiteBedsSize,
          },
          roomSize: rawFormData.juniorSuiteRoomSize,
          totalRooms: Number(rawFormData.juniorSuiteTotalRooms),
          reservedRooms: Number(rawFormData.juniorSuiteReservedRooms),
        },
        standardSuite: {
          picture: rawFormData.standardSuitePicture,
          price: Number(rawFormData.standardSuitePrice),
          description: rawFormData.standardSuiteDescription,
          maxOccupancy: Number(rawFormData.standardSuiteMaxOccupancy),
          beds: {
            amount: Number(rawFormData.standardSuiteBedsAmount),
            size: rawFormData.standardSuiteBedsSize,
          },
          roomSize: rawFormData.standardSuiteRoomSize,
          totalRooms: Number(rawFormData.standardSuiteTotalRooms),
          reservedRooms: Number(rawFormData.standardSuiteReservedRooms),
        },
        doubleSuite: {
          picture: rawFormData.doubleSuitePicture,
          price: Number(rawFormData.doubleSuitePrice),
          description: rawFormData.doubleSuiteDescription,
          maxOccupancy: Number(rawFormData.doubleSuiteMaxOccupancy),
          beds: {
            amount: Number(rawFormData.doubleSuiteBedsAmount),
            size: rawFormData.doubleSuiteBedsSize,
          },
          roomSize: rawFormData.doubleSuiteRoomSize,
          totalRooms: Number(rawFormData.doubleSuiteTotalRooms),
          reservedRooms: Number(rawFormData.doubleSuiteReservedRooms),
        },
        bigSuite: {
          picture: rawFormData.bigSuitePicture,
          price: Number(rawFormData.bigSuitePrice),
          description: rawFormData.bigSuiteDescription,
          maxOccupancy: Number(rawFormData.bigSuiteMaxOccupancy),
          beds: {
            amount: Number(rawFormData.bigSuiteBedsAmount),
            size: rawFormData.bigSuiteBedsSize,
          },
          roomSize: rawFormData.bigSuiteRoomSize,
          totalRooms: Number(rawFormData.bigSuiteTotalRooms),
          reservedRooms: Number(rawFormData.bigSuiteReservedRooms),
        },
      },
      // commentaries: [],
    };

    await hotels.updateOne(
      { _id: new ObjectId(rawFormData._id as string) },
      { $set: hotel }
    );
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Update Hotel.",
    };
  }

  redirect("/administration/hotels");
}

export async function createReservation(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const reservations = database.collection("reservations");

    const token = cookies().get("token");

    if (!token) {
      return {
        error: "Please sign in to make a reservation.",
      };
    }

    const { payload }: { payload: User } = await jose.jwtVerify(
      token!.value,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    const reservation = {
      hotelId: new ObjectId(rawFormData.hotelId as string),
      userId: new ObjectId(payload._id),
      checkin: rawFormData.checkin,
      checkout: rawFormData.checkout,
      roomType: rawFormData.roomType,
      roomPrice: Number(rawFormData.roomPrice),
      guests: Number(rawFormData.guests),
      stayDays: Number(rawFormData.stayDays),
      totalPrice: Number(rawFormData.totalPrice),
      state: "active",
      madeAt: format(new Date(), "MM/dd/yyyy HH:mm"),
    };

    await reservations.insertOne(reservation);
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Make Reservation.",
    };
  }

  redirect("/checkout/success");
}

export async function updateUser(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const users = database.collection("users");

    const user = {
      email: rawFormData.email,
      age: Number(rawFormData.age),
      firstName: rawFormData.firstName,
      lastName: rawFormData.lastName,
      originCountry: rawFormData.originCountry,
      passportNumber: rawFormData.passportNumber,
      role: rawFormData.role,
    };

    await users.updateOne(
      { _id: new ObjectId(rawFormData._id as string) },
      { $set: user }
    );
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Update User.",
    };
  }

  redirect("/administration/users");
}

export async function createReview(prevState: any, formData: FormData) {
  try {
    const token = cookies().get("token");

    if (!token) {
      return {
        error: "Please sign in to leave a review.",
      };
    }

    const { payload }: { payload: User } = await jose.jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const hotels = database.collection("hotels");

    const hotel = await hotels.findOne({
      _id: new ObjectId(rawFormData.hotelId as string),
    });

    if (!hotel) {
      return {
        error: "Hotel not found.",
      };
    }

    const reviews = {
      count: hotel.reviews.count + 1,
      rating: hotel.reviews.rating + Number(rawFormData.rating),
      average:
        (hotel.reviews.rating + Number(rawFormData.rating)) /
        (hotel.reviews.count + 1),
    };

    await hotels.updateOne(
      { _id: new ObjectId(rawFormData.hotelId as string) },
      { $set: { reviews: reviews } }
    );
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Create Review.",
    };
  }

  revalidatePath("/");
}

export async function createPartner(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const partners = database.collection("partners");

    const partner = {
      name: rawFormData.name,
      logo: rawFormData.logo,
    };

    await partners.insertOne(partner);
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Create Partner.",
    };
  }

  redirect("/administration/partners");
}

export async function updateSiteIdentity(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const siteIdentity = database.collection("siteIdentity");

    const identity = {
      name: rawFormData.name,
      logo: rawFormData.logo,
      description: rawFormData.description,
      vision: rawFormData.vision,
      mission: rawFormData.mission,
      contactNumber: rawFormData.contactNumber,
      address: rawFormData.address,
      copyright: rawFormData.copyright,
    };

    await siteIdentity.updateOne(
      // @ts-ignore comment
      { _id: "siteIdentity" },
      { $set: identity },
      { upsert: true }
    );
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Update Site Identity.",
    };
  }

  redirect("/administration");
}

export async function deletePartner(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const partners = database.collection("partners");

    await partners.deleteOne({
      _id: new ObjectId(rawFormData.partnerId as string),
    });
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Delete Partner.",
    };
  }

  revalidatePath("/");
}

export async function disableHotel(prevState: any, formData: FormData) {
  // Travel Agency
  const rawFormData = Object.fromEntries(formData.entries());
  const database = client.db(process.env.DB_NAME);
  const agencies = database.collection("agencies");

  const result = agencies.find();
  for await (const agency of result) {
    await fetch(
      `${agency.endpoint}/reservations/cancelHotel/${rawFormData.hotelId})`,
      {
        method: "PUT",
      }
    );
  }
  // ----------------
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const hotels = database.collection("hotels");
    const reservations = database.collection("reservations");
    const users = database.collection("users");

    const hotel = await hotels.findOne({
      _id: new ObjectId(rawFormData.hotelId as string),
    });

    if (!hotel) {
      return {
        error: "Hotel not found.",
      };
    }

    await hotels.updateOne(
      { _id: new ObjectId(rawFormData.hotelId as string) },
      { $set: { state: "disabled" } }
    );

    await reservations.updateMany(
      {
        hotelId: new ObjectId(rawFormData.hotelId as string),
        state: { $nin: ["manuallyDisabled"] },
      },
      { $set: { state: "disabled" } }
    );

    const hotelReservations = reservations.find({
      hotelId: new ObjectId(rawFormData.hotelId as string),
      state: { $nin: ["manuallyDisabled"] },
    });

    for await (const reservation of hotelReservations) {
      const user = await users.findOne({
        _id: reservation.userId,
      });

      if (!user) {
        continue;
      }

      transporter.sendMail({
        from: "MS_zoX6hx@trial-ynrw7gyqe7n42k8e.mlsender.net",
        to: user.email,
        subject: `Your reservation on ${hotel.name} has been disabled`,
        text: `Hello ${
          user.firstName + " " + user.lastName
        }, we are sending this message to inform you that your reservation on hotel ${
          hotel.name
        } from ${reservation.checkin} to ${
          reservation.checkout
        } has been disabled.`,
      });
    }
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Disable Hotel.",
    };
  }

  revalidatePath("/");
}

export async function enableHotel(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const hotels = database.collection("hotels");
    const reservations = database.collection("reservations");

    await hotels.updateOne(
      { _id: new ObjectId(rawFormData.hotelId as string) },
      { $set: { state: "active" } }
    );

    await reservations.updateMany(
      {
        hotelId: new ObjectId(rawFormData.hotelId as string),
        state: { $nin: ["manuallyDisabled"] },
      },
      { $set: { state: "active" } }
    );
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Enable Hotel.",
    };
  }

  revalidatePath("/");
}

export async function enableReservation(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const reservations = database.collection("reservations");

    await reservations.updateOne(
      { _id: new ObjectId(rawFormData.reservationId as string) },
      { $set: { state: "active" } }
    );
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Enable Reservation.",
    };
  }

  revalidatePath("/");
}

export async function createAgency(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const agencies = database.collection("agencies");

    const agency = {
      name: rawFormData.name,
      endpoint: rawFormData.endpoint,
    };

    await agencies.insertOne(agency);
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Create Agency.",
    };
  }

  redirect("/administration/agencies");
}

export async function deleteAgency(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const agencies = database.collection("agencies");
    console.log(rawFormData);
    await agencies.deleteOne({
      _id: new ObjectId(rawFormData.id as string),
    });
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Delete Agency.",
    };
  }

  revalidatePath("/administration/agencies");
}

export async function createAlliance(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const alliances = database.collection("alliances");

    const results = await alliances.find().toArray();

    if (results.length >= 1) {
      return {
        error: "Only one alliance is allowed.",
      };
    }

    const alliance = {
      name: rawFormData.name,
      address: rawFormData.address,
      discount: rawFormData.discount,
      key: rawFormData.key,
    };

    await alliances.insertOne(alliance);
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Create Alliance.",
    };
  }

  redirect("/administration/alliances");
}

export async function deleteAlliance(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const alliances = database.collection("alliances");

    await alliances.deleteOne({
      _id: new ObjectId(rawFormData.id as string),
    });
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Delete Alliance.",
    };
  }

  revalidatePath("/administration/alliances");
}

export async function disableReservation(prevState: any, formData: FormData) {
  // Travel Agency
  const rawFormData = Object.fromEntries(formData.entries());
  const database = client.db(process.env.DB_NAME);
  const agencies = database.collection("agencies");

  const result = agencies.find();
  for await (const agency of result) {
    const result = await fetch(
      `${agency.endpoint}/reservations/cancel/${rawFormData.reservationId}`,
      {
        method: "PUT",
      }
    );
    console.log(result);
  }
  // ----------------
  try {
    const rawFormData = Object.fromEntries(formData.entries());

    const database = client.db(process.env.DB_NAME);
    const reservations = database.collection("reservations");
    const users = database.collection("users");
    const hotels = database.collection("hotels");

    const reservation = await reservations.findOne({
      _id: new ObjectId(rawFormData.reservationId as string),
    });

    if (!reservation) {
      return {
        error: "Reservation not found.",
      };
    }

    const user = await users.findOne({
      _id: reservation.userId,
    });

    if (!user) {
      return {
        error: "User not found.",
      };
    }

    const hotel = await hotels.findOne({
      _id: reservation.hotelId,
    });

    if (!hotel) {
      return {
        error: "Hotel not found.",
      };
    }

    await reservations.updateOne(
      { _id: new ObjectId(rawFormData.reservationId as string) },
      { $set: { state: "manuallyDisabled" } }
    );

    await transporter.sendMail(
      {
        from: "MS_zoX6hx@trial-ynrw7gyqe7n42k8e.mlsender.net",
        to: user.email,
        subject: `Your reservation on ${hotel.name} has been disabled`,
        text: `Hello ${
          user.firstName + " " + user.lastName
        }, we are sending this message to inform you that your reservation on hotel ${
          hotel.name
        } from ${reservation.checkin} to ${
          reservation.checkout
        } has been disabled.`,
      },
      function (err: any, info: any) {
        console.log(info);
      }
    );
  } catch (e) {
    console.log(e);
    return {
      error: "Database Error: Failed to Disable Reservation.",
    };
  }

  revalidatePath("/");
}

export async function initiateSignUp(prevState: any, formData: FormData) {
  await transporter.sendMail({
    from: "MS_zoX6hx@trial-ynrw7gyqe7n42k8e.mlsender.net", // sender address
    to: "voxjmjm@gmail.com", // list of receivers
    subject: "Your reservation has been cancelled", // Subject line
    text: "Hello, we are sending this to inform you that your reservation has been disabled.", // plain text body
  });
}

export async function registerAnalytic(
  location: string,
  checkin: string,
  checkout: string,
  guests: number
) {
  const database = client.db(process.env.DB_NAME);
  const analytics = database.collection("analytics");

  await analytics.insertOne({
    source: "web",
    location,
    checkin,
    checkout,
    guests,
    madeAt: format(new Date(), "MM/dd/yyyy HH:mm"),
  });
}

export async function logOut() {
  cookies().delete("token");
  redirect("/");
}
