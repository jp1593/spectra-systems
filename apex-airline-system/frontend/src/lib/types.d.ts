declare global {
  interface User {
    _id: string;
    email: string;
    password: string;
    age: number;
    firstName: string;
    lastName: string;
    originCountry: string;
    passportNumber: string;
    role: "user" | "admin" | "webService";
  }

  interface Commentary {
    _id: string;
    parentId: string;
    userId: string;
    userName: string;
    date: string;
    message: string;
    children?: Commentary[];
  }

  interface HotelLocation {
    _id: string;
    street: string;
    city: string;
    state: string;
    country: string;
    address: string;
    picture: string;
  }

  export interface HotelSearchParams {
    [key: string]: string;
    location: string;
    checkin: string;
    checkout: string;
    guests: string;
  }

  export interface Hotel {
    _id: string;
    name: string;
    description: string;
    amenities: string[];
    picture: string;
    location: {
      street: string;
      city: string;
      state: string;
      country: string;
      address: string;
    };
    reviews: {
      count: number;
      rating: number;
      average: number;
    };
    rooms: {
      doubleSuite: {
        picture: string;
        price: number;
        description: string;
        maxOccupancy: number;
        beds: {
          amount: number;
          size: string;
        };
        roomSize: string;
        totalRooms: number;
        reservedRooms: number;
      };
      juniorSuite: {
        picture: string;
        price: number;
        description: string;
        maxOccupancy: number;
        beds: {
          amount: number;
          size: string;
        };
        roomSize: string;
        totalRooms: number;
        reservedRooms: number;
      };
      standardSuite: {
        picture: string;
        price: number;
        description: string;
        maxOccupancy: number;
        beds: {
          amount: number;
          size: string;
        };
        roomSize: string;
        totalRooms: number;
        reservedRooms: number;
      };
      bigSuite: {
        picture: string;
        price: number;
        description: string;
        maxOccupancy: number;
        beds: {
          amount: number;
          size: string;
        };
        roomSize: string;
        totalRooms: number;
        reservedRooms: number;
      };
    };
    commentaries: Commentary[];
    state: "active" | "disabled";
  }

  export interface Reservation {
    _id: string;
    hotelId: string;
    userId: string;
    checkin: string;
    checkout: string;
    roomType: string;
    roomPrice: number;
    guests: number;
    stayDays: number;
    totalPrice: number;
    state: "active" | "disabled" | "completed" | "manuallyDisabled";
    madeAt: string;
    hotel: Hotel;
    user: User;
  }

  export interface Partner {
    _id: string;
    name: string;
    logo: string;
  }

  export interface SiteIdentity {
    name: string;
    logo: string;
    description: string;
    vision: string;
    mission: string;
    contactNumber: string;
    address: string;
    copyright: string;
  }

  export interface Analytic {
    _id: string;
    source: "web" | "rest";
    location: string;
    checkin: string;
    checkout: string;
    guests: number;
    madeAt: string;
  }

  export interface Agency {
    _id: string;
    name: string;
    endpoint: string;
  }

  export interface Alliance {
    _id: string;
    name: string;
    address: string;
    key: string;
    discount: string;
  }
}

export {};
