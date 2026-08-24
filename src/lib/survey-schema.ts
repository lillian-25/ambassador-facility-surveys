export type Department =
  | "Restaurant staff"
  | "Front desk"
  | "Housekeeping"
  | "Culinary"
  | "Banquet service"
  | "Facility staff";

export type Touchpoint =
  | "Leisure facility"
  | "Wellness"
  | "Guest services"
  | "Dining"
  | "Post-checkout";

export interface Facility {
  slug: string;
  name: string;
  touchpoint: Touchpoint;
  department: Department;
  /** Dining venues use dining-specific Q1/Q2 wording */
  dining?: boolean;
  /** Q4 options shown after a 1–3 overall rating */
  negativeOptions: string[];
  /** Q4 options shown after a 4–5 overall rating */
  positiveOptions: string[];
  note?: string;
}

export const OTHER_OPTION = "Other";

export const FACILITIES: Facility[] = [
  {
    slug: "fitness",
    name: "Fitness Centre",
    touchpoint: "Leisure facility",
    department: "Facility staff",
    negativeOptions: [
      "Equipment condition",
      "Equipment availability",
      "Cleanliness",
      "Crowding",
      "Temperature/environment",
      "Operating hours/accessibility",
      "Staff service",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Equipment",
      "Cleanliness",
      "Environment",
      "Convenience",
      "Staff service",
      "Equipment variety",
      "Overall atmosphere",
      OTHER_OPTION,
    ],
  },
  {
    slug: "sauna",
    name: "Sauna",
    touchpoint: "Wellness",
    department: "Facility staff",
    negativeOptions: [
      "Cleanliness",
      "Temperature",
      "Facilities/condition",
      "Crowding",
      "Availability/accessibility",
      "Environment/atmosphere",
      "Staff service",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Cleanliness",
      "Temperature",
      "Facilities",
      "Atmosphere",
      "Staff service",
      "Convenience",
      "Overall experience",
      OTHER_OPTION,
    ],
  },
  {
    slug: "indoor-pool",
    name: "Indoor Swimming Pool",
    touchpoint: "Wellness",
    department: "Facility staff",
    negativeOptions: [
      "Pool cleanliness",
      "Facility condition",
      "Water temperature",
      "Crowding",
      "Changing/shower facilities",
      "Availability/accessibility",
      "Staff service",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Pool cleanliness",
      "Facilities",
      "Water temperature",
      "Atmosphere",
      "Staff service",
      "Convenience",
      "Overall experience",
      OTHER_OPTION,
    ],
  },
  {
    slug: "urban-escape",
    name: "Urban Escape",
    touchpoint: "Leisure facility",
    department: "Facility staff",
    negativeOptions: [
      "Facility condition",
      "Cleanliness",
      "Equipment",
      "Waiting time",
      "Availability/accessibility",
      "Environment",
      "Staff service",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Facility",
      "Equipment",
      "Cleanliness",
      "Environment",
      "Staff service",
      "Overall experience",
      "Convenience",
      OTHER_OPTION,
    ],
  },
  {
    slug: "cabana-nest-bed",
    name: "Cabana & Nest Bed",
    touchpoint: "Leisure facility",
    department: "Facility staff",
    negativeOptions: [
      "Cleanliness",
      "Comfort",
      "Condition",
      "Availability",
      "Privacy",
      "Environment",
      "Staff service",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Comfort",
      "Cleanliness",
      "Privacy",
      "Environment",
      "Facilities",
      "Staff service",
      "Overall atmosphere",
      OTHER_OPTION,
    ],
  },
  {
    slug: "screen-golf",
    name: "Screen Golf",
    touchpoint: "Leisure facility",
    department: "Facility staff",
    note: "QR placement: club storage / club return area.",
    negativeOptions: [
      "Golf equipment",
      "Screen/technology",
      "Facility condition",
      "Cleanliness",
      "Waiting time",
      "Availability",
      "Environment",
      "Staff service",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Golf equipment",
      "Screen/technology",
      "Facility",
      "Cleanliness",
      "Environment",
      "Staff service",
      "Overall experience",
      OTHER_OPTION,
    ],
  },
  {
    slug: "gx-yoga-pilates",
    name: "GX / Yoga / Pilates",
    touchpoint: "Wellness",
    department: "Facility staff",
    negativeOptions: [
      "Class/instructor",
      "Equipment",
      "Cleanliness",
      "Studio condition",
      "Class availability",
      "Schedule",
      "Environment",
      "Staff service",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Instructor/class",
      "Equipment",
      "Cleanliness",
      "Studio environment",
      "Class variety",
      "Staff service",
      "Overall experience",
      OTHER_OPTION,
    ],
  },
  {
    slug: "club-ambassador-lounge",
    name: "Club Ambassador Lounge",
    touchpoint: "Guest services",
    department: "Front desk",
    negativeOptions: [
      "Food/beverage",
      "Cleanliness",
      "Seating/space",
      "Facilities",
      "Availability",
      "Atmosphere",
      "Staff service",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Food/beverage",
      "Cleanliness",
      "Seating/space",
      "Facilities",
      "Atmosphere",
      "Staff service",
      "Convenience",
      OTHER_OPTION,
    ],
  },
  {
    slug: "business-centre",
    name: "Business Centre",
    touchpoint: "Guest services",
    department: "Front desk",
    negativeOptions: [
      "Equipment",
      "Cleanliness",
      "Facility condition",
      "Availability",
      "Accessibility",
      "Environment",
      "Staff service",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Equipment",
      "Cleanliness",
      "Facilities",
      "Convenience",
      "Environment",
      "Staff service",
      "Accessibility",
      OTHER_OPTION,
    ],
  },
  {
    slug: "barber",
    name: "Barber",
    touchpoint: "Guest services",
    department: "Facility staff",
    negativeOptions: [
      "Service quality",
      "Staff/professionalism",
      "Cleanliness",
      "Waiting time",
      "Facility condition",
      "Appointment/accessibility",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Service quality",
      "Staff/professionalism",
      "Cleanliness",
      "Facility",
      "Convenience",
      "Overall experience",
      OTHER_OPTION,
    ],
  },
  {
    slug: "lobby-buffet",
    name: "Lobby Buffet",
    touchpoint: "Dining",
    department: "Restaurant staff",
    dining: true,
    negativeOptions: [
      "Food quality",
      "Food variety",
      "Food temperature",
      "Waiting time",
      "Cleanliness",
      "Crowding/seating",
      "Staff service",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Food quality",
      "Food variety",
      "Food presentation",
      "Cleanliness",
      "Staff service",
      "Variety",
      "Atmosphere",
      OTHER_OPTION,
    ],
  },
  {
    slug: "haobin",
    name: "Haobin",
    touchpoint: "Dining",
    department: "Restaurant staff",
    dining: true,
    negativeOptions: [
      "Food quality",
      "Food temperature/presentation",
      "Waiting time",
      "Staff service",
      "Cleanliness",
      "Atmosphere",
      "Crowding",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Food quality",
      "Food presentation",
      "Staff service",
      "Atmosphere",
      "Cleanliness",
      "Overall dining experience",
      OTHER_OPTION,
    ],
  },
  {
    slug: "lobby-bar",
    name: "Lobby Bar",
    touchpoint: "Dining",
    department: "Restaurant staff",
    dining: true,
    negativeOptions: [
      "Beverage quality",
      "Food quality",
      "Waiting time",
      "Staff service",
      "Cleanliness",
      "Atmosphere",
      "Seating",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Beverage quality",
      "Food quality",
      "Staff service",
      "Atmosphere",
      "Cleanliness",
      "Seating",
      "Overall experience",
      OTHER_OPTION,
    ],
  },
  {
    slug: "poolside-bar",
    name: "Pool-side Bar",
    touchpoint: "Dining",
    department: "Restaurant staff",
    dining: true,
    negativeOptions: [
      "Beverage quality",
      "Food quality",
      "Speed of service",
      "Staff service",
      "Cleanliness",
      "Poolside environment",
      "Seating",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Beverage quality",
      "Food quality",
      "Service speed",
      "Staff service",
      "Environment",
      "Cleanliness",
      "Overall atmosphere",
      OTHER_OPTION,
    ],
  },
  {
    slug: "kings-restaurant",
    name: "King's Restaurant",
    touchpoint: "Dining",
    department: "Restaurant staff",
    dining: true,
    negativeOptions: [
      "Food quality",
      "Food presentation",
      "Waiting time",
      "Staff service",
      "Cleanliness",
      "Atmosphere",
      "Menu variety",
      OTHER_OPTION,
    ],
    positiveOptions: [
      "Food quality",
      "Food presentation",
      "Staff service",
      "Atmosphere",
      "Cleanliness",
      "Menu variety",
      "Overall experience",
      OTHER_OPTION,
    ],
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

/** Conversational reaction shown right after Q1 */
export const Q1_REACTIONS: Record<number, string> = {
  1: "We're sorry to hear that. We'd really appreciate knowing what could have been better.",
  2: "Thank you for letting us know. We'd love to understand how we could have made your experience better.",
  3: "Thank you for your feedback. What could have made your experience better?",
  4: "Thank you! We're glad you enjoyed your experience. Is there anything that could have made it even better?",
  5: "Wonderful! We're delighted you had a great experience.",
};

export function q4Prompt(rating: number): string {
  if (rating <= 2) return "We're sorry to hear that. What could we have improved?";
  if (rating === 3) return "Thank you for your feedback. What could have made your experience better?";
  return "We're glad you enjoyed your experience! What did you enjoy most?";
}

export const SERVICE_RECOVERY_OPTIONS = [
  "Helpfulness",
  "Attentiveness",
  "Knowledge",
  "Responsiveness",
  "Professionalism",
  "Waiting time",
  OTHER_OPTION,
];

export const NOTHING_OPTION = "Nothing — everything was satisfactory";

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
  OTHER_OPTION,
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
