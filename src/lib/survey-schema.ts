export type Department =
  | "Restaurant staff"
  | "Front desk"
  | "Housekeeping"
  | "Culinary"
  | "Banquet service"
  | "Facility staff";

export type Touchpoint = "Leisure facility" | "Wellness" | "Guest services" | "Dining" | "Post-checkout";

export interface Facility {
  slug: string;
  name: string;
  touchpoint: Touchpoint;
  department: Department;
  /** Wording used in Q2 for the physical thing being rated */
  qualityNoun: string;
  /** Extra improvement option tailored to the venue */
  extraImprovement?: string;
  note?: string;
}

export const FACILITIES: Facility[] = [
  {
    slug: "fitness",
    name: "Fitness Centre",
    touchpoint: "Leisure facility",
    department: "Facility staff",
    qualityNoun: "the gym equipment and changing areas",
    extraImprovement: "Equipment availability",
  },
  {
    slug: "sauna",
    name: "Sauna",
    touchpoint: "Wellness",
    department: "Facility staff",
    qualityNoun: "the sauna, showers and locker areas",
    extraImprovement: "Water / steam quality",
  },
  {
    slug: "swimming-pool",
    name: "Indoor Swimming Pool",
    touchpoint: "Wellness",
    department: "Facility staff",
    qualityNoun: "the pool, poolside and changing areas",
    extraImprovement: "Water quality",
  },
  {
    slug: "urban-escape",
    name: "Urban Escape",
    touchpoint: "Leisure facility",
    department: "Facility staff",
    qualityNoun: "the Urban Escape space and furnishings",
    extraImprovement: "Atmosphere / noise",
  },
  {
    slug: "cabana",
    name: "Cabana & Nest Bed",
    touchpoint: "Leisure facility",
    department: "Facility staff",
    qualityNoun: "the cabanas, nest beds and surrounding area",
    extraImprovement: "Comfort of seating / beds",
  },
  {
    slug: "screen-golf",
    name: "Screen Golf",
    touchpoint: "Leisure facility",
    department: "Facility staff",
    qualityNoun: "the simulators, clubs and club storage area",
    extraImprovement: "Club storage & return",
    note: "QR placement: club storage / return area.",
  },
  {
    slug: "gx-yoga-pilates",
    name: "GX / Yoga / Pilates",
    touchpoint: "Wellness",
    department: "Facility staff",
    qualityNoun: "the studio, mats and class equipment",
    extraImprovement: "Class schedule / instructor",
  },
  {
    slug: "club-lounge",
    name: "Club Ambassador Lounge",
    touchpoint: "Guest services",
    department: "Front desk",
    qualityNoun: "the lounge space, seating and food & beverage offer",
    extraImprovement: "Food & beverage selection",
  },
  {
    slug: "business-centre",
    name: "Business Centre",
    touchpoint: "Guest services",
    department: "Front desk",
    qualityNoun: "the workstations, printing and meeting facilities",
    extraImprovement: "Equipment / connectivity",
  },
  {
    slug: "barber",
    name: "Barber",
    touchpoint: "Guest services",
    department: "Facility staff",
    qualityNoun: "the barber shop, tools and seating",
    extraImprovement: "Quality of the service itself",
  },
  {
    slug: "lobby-buffet",
    name: "Lobby Buffet",
    touchpoint: "Dining",
    department: "Restaurant staff",
    qualityNoun: "the food quality, presentation and dining area",
    extraImprovement: "Food quality / variety",
  },
  {
    slug: "haobin",
    name: "Haobin",
    touchpoint: "Dining",
    department: "Restaurant staff",
    qualityNoun: "the food quality, presentation and dining room",
    extraImprovement: "Food quality / variety",
  },
  {
    slug: "lobby-bar",
    name: "Lobby Bar",
    touchpoint: "Dining",
    department: "Restaurant staff",
    qualityNoun: "the drinks, snacks and bar area",
    extraImprovement: "Drinks quality / selection",
  },
  {
    slug: "pool-side-bar",
    name: "Pool-side Bar",
    touchpoint: "Dining",
    department: "Restaurant staff",
    qualityNoun: "the drinks, snacks and poolside seating",
    extraImprovement: "Drinks quality / selection",
  },
  {
    slug: "kings-restaurant",
    name: "King's Restaurant",
    touchpoint: "Dining",
    department: "Restaurant staff",
    qualityNoun: "the food quality, presentation and dining room",
    extraImprovement: "Food quality / variety",
  },
];

export const facilityBySlug = (slug: string) => FACILITIES.find((f) => f.slug === slug);

export const SATISFACTION_LABELS = [
  "Very dissatisfied",
  "Dissatisfied",
  "Neutral",
  "Satisfied",
  "Very satisfied",
];

export const QUALITY_LABELS = ["Very poor", "Poor", "Average", "Good", "Excellent"];

export const BASE_IMPROVEMENTS = [
  "Cleanliness",
  "Facility / equipment condition",
  "Staff service",
  "Waiting time / crowding",
  "Availability / accessibility",
  "Temperature / environment",
];

export const NOTHING_OPTION = "Nothing — everything was satisfactory";

export function improvementOptions(facility: Facility): string[] {
  const extras = facility.extraImprovement ? [facility.extraImprovement] : [];
  return [...BASE_IMPROVEMENTS, ...extras, "Other", NOTHING_OPTION];
}

export const POST_CHECKOUT_MATRIX = [
  { id: "room_housekeeping", label: "Room & housekeeping", department: "Housekeeping" as Department },
  { id: "cleanliness", label: "Cleanliness", department: "Housekeeping" as Department },
  { id: "facilities", label: "Facilities & amenities", department: "Facility staff" as Department },
  { id: "dining", label: "Dining & F&B", department: "Restaurant staff" as Department },
  { id: "staff", label: "Staff & service", department: "Front desk" as Department },
  { id: "checkin", label: "Check-in & check-out", department: "Front desk" as Department },
  { id: "value", label: "Value for money", department: "Front desk" as Department },
];

export const POST_CHECKOUT_IMPROVEMENTS = [
  "Room / housekeeping",
  "Cleanliness",
  "Dining / F&B",
  "Facilities / amenities",
  "Staff / service",
  "Check-in / check-out",
  "Value for money",
  "Other",
  NOTHING_OPTION,
];

export function sentimentForRating(rating: number, scaleMax = 5): "Negative" | "Neutral" | "Positive" {
  if (scaleMax === 10) {
    if (rating <= 6) return "Negative";
    if (rating <= 8) return "Neutral";
    return "Positive";
  }
  if (rating <= 2) return "Negative";
  if (rating === 3) return "Neutral";
  return "Positive";
}

export const PRIVACY_STATEMENT =
  "Your feedback is collected anonymously and used only to improve our facilities and service. We do not ask for personal details, we never share individual responses outside the hotel, and results are reported to our teams in aggregate.";
