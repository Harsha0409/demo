export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string | any;
  contentType?: "text" | "json" | "bus_data";
  timestamp: Date;
  busRoutes?: Bus[];
  rawData?: any;
  isLoading?: boolean;
  ticketData?: any;
  passengerData?: Passenger[];
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

export interface FareDetails {
  "Base Fare": number;
  GST: number;
  Discount: number;
}

export interface Seat {
  seat_id: number;
  seat_number: string;
  price: number;
  type?: "window" | "aisle";
  fare_details: FareDetails;
  is_reserved_female: boolean;
  is_reserved_male: boolean;
  availability_status_code: string;
}

export interface SeatCategory {
  window: Seat[];
  aisle: Seat[];
}

export interface RecommendedSeats {
  Premium?: {
    window?: Seat[];
    aisle?: Seat[];
  };
  Reasonable?: {
    window?: Seat[];
    aisle?: Seat[];
  };
  "Budget-Friendly"?: {
    window?: Seat[];
    aisle?: Seat[];
  };
}

export interface GenderAssignments {
  [category: string]: {
    [seat_id: string]: "male" | "female";
  };
}

export interface BoardingPoint {
  boardingPointId: number;
  currentTime: string;
  boardingPoint: {
    id: number;
    name: string;
    landmark: string;
    stationId?: number;
    latitude?: number;
    longitude?: number;
    active?: boolean;
  };
}

export interface DroppingPoint {
  droppingPointId: number;
  currentTime: string;
  droppingPoint: {
    id: number;
    name: string;
    landmark: string;
    stationId?: number;
    latitude?: number;
    longitude?: number;
    active?: boolean;
  };
}

export interface RecommendedPoint {
  name: string;
  landmark: string;
  popularity: number;
}

export interface Bus {
  tripID: number;
  from: string;
  to: string;
  rating: number;
  duration: string;
  startTime: string;
  endTime: string;
  allBoardingPoints: BoardingPoint[];
  allDroppingPoints: DroppingPoint[];
  recommended_boarding_points?: RecommendedPoint[];
  recommended_dropping_points?: RecommendedPoint[];
  recommended_seats?: RecommendedSeats;
  gender_assignments?: GenderAssignments;
  vehicleType?: string;
  seatData?: vehicleData;
}
export interface vehicleData {
  seats: SeatData[];
}

export interface SeatData {
  id: number;
  x: number;
  y: number;
  z: number;
  width: number;
  length: number;
  hasExtraLegRoom: boolean;
  isRecliner: boolean;
  seatType: string;
  totalFare: number;
  seatName: string;
  isOccupied: boolean;
  availabilityStatus: string;
  isReservedForFemales: boolean;
  isReservedForMales: boolean;
  fare: FareDetails;
  hasStaticFare: boolean;
  isDummy: boolean;
}

export interface Passenger {
  id?: number;
  name: string;
  age: number;
  gender: string;
  seat?: string | number;
}

export interface GreenCoins {
  available: number;
  total_accrued: number;
  total_used: number;
}

export interface FreshCard {
  available: boolean;
  id: number;
  name: string;
  fare: number;
  tickets: number;
  discountAmount: number;
  usage: number;
  active: boolean;
  expiresInDays: number;
  balance: number;
  campaignName: string;
  total_used: number;
  total_accrued: number;
  total_consumed: number;
}

export interface FinalFareCalculation {
  baseFare: number;
  gst: number;
  discount: number;
  greenCoinsDiscount: number;
  freshCardDiscount: number;
  total: number;
}

export interface BusQueryResponse {
  recommendations: Bus[];
  passengers: Passenger[];
  green_coins: GreenCoins;
  freshcard: FreshCard;
}
