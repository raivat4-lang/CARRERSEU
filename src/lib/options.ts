export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const EDUCATION_LEVELS = [
  { value: "class_10", label: "Class 10" },
  { value: "class_12", label: "Class 12" },
  { value: "diploma", label: "Diploma" },
  { value: "graduate", label: "Graduate" },
  { value: "post_graduate", label: "Post Graduate" },
] as const;

export const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "hindi", label: "हिन्दी (Hindi)" },
  { value: "marathi", label: "मराठी (Marathi)" },
] as const;

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export const educationLabel = (value?: string | null) =>
  EDUCATION_LEVELS.find((e) => e.value === value)?.label ?? "Not set";
