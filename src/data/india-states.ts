import type { IndianState } from "@/lib/types";

/** Coordinates are [longitude, latitude] and are used for the interactive India map. */
export const INDIAN_STATES: IndianState[] = [
  { id: "andhra-pradesh", name: "Andhra Pradesh", region: "South", capital: "Amaravati", coords: [80.1, 15.5] },
  { id: "arunachal-pradesh", name: "Arunachal Pradesh", region: "Northeast", capital: "Itanagar", coords: [94.7, 27.7] },
  { id: "assam", name: "Assam", region: "Northeast", capital: "Dispur", coords: [92.9, 26.2] },
  { id: "bihar", name: "Bihar", region: "East", capital: "Patna", coords: [85.1, 25.6] },
  { id: "chhattisgarh", name: "Chhattisgarh", region: "Central", capital: "Raipur", coords: [81.6, 21.3] },
  { id: "goa", name: "Goa", region: "West", capital: "Panaji", coords: [74.0, 15.3] },
  { id: "gujarat", name: "Gujarat", region: "West", capital: "Gandhinagar", coords: [71.2, 22.5] },
  { id: "haryana", name: "Haryana", region: "North", capital: "Chandigarh", coords: [76.1, 29.2] },
  { id: "himachal-pradesh", name: "Himachal Pradesh", region: "North", capital: "Shimla", coords: [77.2, 32.0] },
  { id: "jharkhand", name: "Jharkhand", region: "East", capital: "Ranchi", coords: [85.3, 23.6] },
  { id: "karnataka", name: "Karnataka", region: "South", capital: "Bengaluru", coords: [76.0, 14.5] },
  { id: "kerala", name: "Kerala", region: "South", capital: "Thiruvananthapuram", coords: [76.5, 10.3] },
  { id: "madhya-pradesh", name: "Madhya Pradesh", region: "Central", capital: "Bhopal", coords: [78.6, 23.5] },
  { id: "maharashtra", name: "Maharashtra", region: "West", capital: "Mumbai", coords: [75.5, 19.2] },
  { id: "manipur", name: "Manipur", region: "Northeast", capital: "Imphal", coords: [93.9, 24.7] },
  { id: "meghalaya", name: "Meghalaya", region: "Northeast", capital: "Shillong", coords: [91.7, 25.5] },
  { id: "mizoram", name: "Mizoram", region: "Northeast", capital: "Aizawl", coords: [92.8, 23.2] },
  { id: "nagaland", name: "Nagaland", region: "Northeast", capital: "Kohima", coords: [94.5, 25.8] },
  { id: "odisha", name: "Odisha", region: "East", capital: "Bhubaneswar", coords: [85.0, 20.5] },
  { id: "punjab", name: "Punjab", region: "North", capital: "Chandigarh", coords: [75.4, 30.9] },
  { id: "rajasthan", name: "Rajasthan", region: "North", capital: "Jaipur", coords: [73.8, 26.6] },
  { id: "tamil-nadu", name: "Tamil Nadu", region: "South", capital: "Chennai", coords: [78.5, 10.8] },
  { id: "telangana", name: "Telangana", region: "South", capital: "Hyderabad", coords: [78.9, 17.9] },
  { id: "tripura", name: "Tripura", region: "Northeast", capital: "Agartala", coords: [91.7, 23.7] },
  { id: "uttar-pradesh", name: "Uttar Pradesh", region: "North", capital: "Lucknow", coords: [80.9, 26.8] },
  { id: "uttarakhand", name: "Uttarakhand", region: "North", capital: "Dehradun", coords: [79.0, 30.1] },
  { id: "west-bengal", name: "West Bengal", region: "East", capital: "Kolkata", coords: [87.8, 23.5] },
  { id: "delhi", name: "Delhi (NCT)", region: "North", capital: "New Delhi", coords: [77.1, 28.6] },
  { id: "chandigarh", name: "Chandigarh (UT)", region: "North", capital: "Chandigarh", coords: [76.7, 30.7] },
  { id: "jammu-kashmir", name: "Jammu & Kashmir", region: "North", capital: "Srinagar", coords: [74.8, 34.1] },
];

export const STATE_MAP = new Map(INDIAN_STATES.map((s) => [s.id, s]));

export const STATE_REGIONS = ["North", "South", "East", "West", "Central", "Northeast"] as const;
