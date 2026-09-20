export interface ScholarshipItem {
  id: string;
  name: string;
  provider: string;
  category: "Central Government" | "State Government" | "Corporate CSR" | "Private Foundation" | "Women in STEM";
  amount: string;
  annualValueINR: number;
  eligibility: string;
  minEducation: "Class 10" | "Class 12" | "Diploma" | "Graduate" | "Post Graduate";
  eligibleStates: string[];
  gender: "All" | "Female Only" | "Differently Abled";
  annualFamilyIncomeLimitINR: number;
  deadline: string;
  status: "Open" | "Closing Soon" | "Upcoming" | "Closed";
  officialUrl: string;
  lastUpdated: string;
  description: string;
  documentsRequired: string[];
  selectionBasis: "Merit Based" | "Means & Merit" | "Competitive Entrance";
}

export const SCHOLARSHIPS_DATA: ScholarshipItem[] = [
  {
    id: "nsp-csss",
    name: "Central Sector Scheme of Scholarships for College & University Students (NSP CSSS)",
    provider: "Department of Higher Education (MHRD/MoE), Govt of India",
    category: "Central Government",
    amount: "₹12,000 to ₹20,000 per year",
    annualValueINR: 20000,
    eligibility: "Students scoring above 80th percentile in relevant stream in Class 12 board exams, pursuing regular graduation/post-graduation.",
    minEducation: "Class 12",
    eligibleStates: ["All India"],
    gender: "All",
    annualFamilyIncomeLimitINR: 450000,
    deadline: "November 30, 2026",
    status: "Open",
    officialUrl: "https://scholarships.gov.in",
    lastUpdated: "September 2026",
    description: "Financial assistance to meritorious students from low-income families to meet day-to-day expenses while pursuing higher studies.",
    documentsRequired: ["Class 12 Marksheet", "Income Certificate (< ₹4.5 Lakhs)", "Aadhaar Card", "Bank Passbook seeded with Aadhaar", "College Bonafide Certificate"],
    selectionBasis: "Merit Based",
  },
  {
    id: "dst-inspire-fellowship",
    name: "INSPIRE Scholarship for Higher Education (SHE) - DST",
    provider: "Department of Science and Technology (DST), Govt of India",
    category: "Central Government",
    amount: "₹80,000 per year (₹60,000 cash + ₹20,000 mentorship project grant)",
    annualValueINR: 80000,
    eligibility: "Top 1% rankers in Class 12 board exams or rankers within 10,000 in JEE/NEET pursuing B.Sc / B.S / Int. M.Sc in Natural & Basic Sciences.",
    minEducation: "Class 12",
    eligibleStates: ["All India"],
    gender: "All",
    annualFamilyIncomeLimitINR: 1000000,
    deadline: "December 31, 2026",
    status: "Open",
    officialUrl: "https://online-inspire.gov.in",
    lastUpdated: "August 2026",
    description: "Prestigious fellowship designed to attract young talent to the study of basic sciences (Physics, Chemistry, Maths, Biology, Geology).",
    documentsRequired: ["Class 12 Advisory Note / Top 1% Certificate", "College Endorsement Certificate", "SBI Bank Account Details", "Class 10/12 Marksheet"],
    selectionBasis: "Merit Based",
  },
  {
    id: "aicte-pragati-scholarship",
    name: "AICTE Pragati Scholarship for Girl Students (Technical Degree/Diploma)",
    provider: "All India Council for Technical Education (AICTE)",
    category: "Women in STEM",
    amount: "₹50,000 per annum (Tuition + Incidental Expenses)",
    annualValueINR: 50000,
    eligibility: "Girl students admitted to 1st year of Degree/Diploma level AICTE-approved technical program (max 2 girls per family).",
    minEducation: "Class 12",
    eligibleStates: ["All India"],
    gender: "Female Only",
    annualFamilyIncomeLimitINR: 800000,
    deadline: "October 31, 2026",
    status: "Closing Soon",
    officialUrl: "https://www.aicte-pragati-saksham-gov.in",
    lastUpdated: "September 2026",
    description: "Empowers girl students in engineering, architecture, pharmacy, and computer applications with comprehensive annual funding.",
    documentsRequired: ["Admission Allotment Letter", "Tuition Fee Receipt", "Annual Income Certificate (< ₹8 Lakhs)", "Family Declaration (Max 2 girls)"],
    selectionBasis: "Means & Merit",
  },
  {
    id: "mahadbt-ebc-freeship",
    name: "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti (EBC Freeship)",
    provider: "Directorate of Higher & Technical Education, Govt of Maharashtra",
    category: "State Government",
    amount: "50% to 100% Tuition Fee & Exam Fee Waiver",
    annualValueINR: 65000,
    eligibility: "Domicile of Maharashtra enrolled in government or approved private engineering, medical, management, or degree colleges.",
    minEducation: "Class 12",
    eligibleStates: ["Maharashtra"],
    gender: "All",
    annualFamilyIncomeLimitINR: 800000,
    deadline: "December 15, 2026",
    status: "Open",
    officialUrl: "https://mahadbt.maharashtra.gov.in",
    lastUpdated: "September 2026",
    description: "State-funded fee waiver for Economically Backward Class (EBC) students in Maharashtra across professional degree programs.",
    documentsRequired: ["Maharashtra Domicile Certificate", "Tahasildar Income Certificate", "CAP Allotment Letter", "Fee Receipts"],
    selectionBasis: "Means & Merit",
  },
  {
    id: "reliance-foundation-scholarship",
    name: "Reliance Foundation Undergraduate Scholarships",
    provider: "Reliance Foundation",
    category: "Corporate CSR",
    amount: "Up to ₹2,00,000 over the duration of degree",
    annualValueINR: 50000,
    eligibility: "1st year full-time undergraduate students in any stream with min 60% in Class 12 and family income below ₹15 Lakhs.",
    minEducation: "Class 12",
    eligibleStates: ["All India"],
    gender: "All",
    annualFamilyIncomeLimitINR: 1500000,
    deadline: "October 15, 2026",
    status: "Closing Soon",
    officialUrl: "https://www.reliancefoundation.org",
    lastUpdated: "September 2026",
    description: "Supports 5,000 meritorious undergraduate students annually with financial grants, mentorship workshops, and leadership development.",
    documentsRequired: ["Class 12 Marksheet", "Income Proof", "College ID Card", "Aptitude Test Score"],
    selectionBasis: "Competitive Entrance",
  },
  {
    id: "tata-pankh-scholarship",
    name: "Tata Capital Pankh Scholarship Programme",
    provider: "Tata Capital CSR Foundation",
    category: "Corporate CSR",
    amount: "Up to 80% of Tuition Fees (₹12,000 to ₹50,000)",
    annualValueINR: 50000,
    eligibility: "Students studying in Class 11, 12, or general/professional undergraduate degree courses with min 60% in previous exam.",
    minEducation: "Class 10",
    eligibleStates: ["All India"],
    gender: "All",
    annualFamilyIncomeLimitINR: 400000,
    deadline: "November 15, 2026",
    status: "Open",
    officialUrl: "https://www.buddy4study.com/page/the-tata-capital-pankh-scholarship-programme",
    lastUpdated: "August 2026",
    description: "Aims to support economically weaker students to prevent dropout from formal school and higher professional education.",
    documentsRequired: ["Previous Year Marksheet", "Income Proof (Salary slip / Form 16 / ITR)", "Current Academic Fee Receipt"],
    selectionBasis: "Means & Merit",
  },
];
