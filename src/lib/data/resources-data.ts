export interface LearningResourceItem {
  id: string;
  title: string;
  category: "Standard Books" | "Official Portals & Syllabus" | "YouTube Courses" | "Practice Papers & PYQs" | "Free PDFs & Notes";
  targetExamOrCareer: string;
  authorOrProvider: string;
  format: "Book / Paperback" | "Video Playlist" | "Web Portal" | "PDF Download";
  accessType: "Free" | "Paid / Library" | "Open Source";
  sourceUrl: string;
  sourceLabel: string;
  rating: number;
  description: string;
  tags: string[];
}

export const RESOURCES_DATA: LearningResourceItem[] = [
  // UPSC Civil Services
  {
    id: "upsc-laxmikanth-polity",
    title: "Indian Polity for Civil Services (6th/7th Edition)",
    category: "Standard Books",
    targetExamOrCareer: "UPSC CSE / State PSC",
    authorOrProvider: "M. Laxmikanth (McGraw Hill)",
    format: "Book / Paperback",
    accessType: "Paid / Library",
    sourceUrl: "https://www.mheducation.co.in",
    sourceLabel: "McGraw Hill India",
    rating: 4.9,
    description: "The undisputed 'Bible of Indian Polity' covering Constitution, Fundamental Rights, Parliament, and Judiciary.",
    tags: ["UPSC", "Polity", "Constitution", "Core Book"],
  },
  {
    id: "upsc-spectrum-history",
    title: "A Brief History of Modern India",
    category: "Standard Books",
    targetExamOrCareer: "UPSC CSE",
    authorOrProvider: "Rajiv Ahir (Spectrum Books)",
    format: "Book / Paperback",
    accessType: "Paid / Library",
    sourceUrl: "https://spectrumbooks.in",
    sourceLabel: "Spectrum Publications",
    rating: 4.8,
    description: "Chronological and point-by-point coverage of India's freedom struggle, Governor Generals, and reform movements.",
    tags: ["UPSC", "Modern History", "Prelims", "Mains"],
  },
  {
    id: "upsc-official-pyqs",
    title: "UPSC Official Previous Years' Question Papers (Prelims & Mains)",
    category: "Practice Papers & PYQs",
    targetExamOrCareer: "UPSC CSE",
    authorOrProvider: "Union Public Service Commission (Official)",
    format: "PDF Download",
    accessType: "Free",
    sourceUrl: "https://upsc.gov.in/examinations/previous-question-papers",
    sourceLabel: "Official UPSC Portal",
    rating: 5.0,
    description: "Official repository of past 15 years question papers for GS Paper 1, CSAT, and Mains Optional subjects.",
    tags: ["UPSC", "Official PYQs", "Free Download"],
  },

  // GATE & Computer Science
  {
    id: "gate-nptel-dsa",
    title: "Data Structures & Algorithms in C++ (NPTEL IIT Madras)",
    category: "YouTube Courses",
    targetExamOrCareer: "GATE CSE / Software Engineering",
    authorOrProvider: "Prof. Naveen Garg (IIT Delhi / NPTEL)",
    format: "Video Playlist",
    accessType: "Free",
    sourceUrl: "https://nptel.ac.in/courses/106102064",
    sourceLabel: "NPTEL / Swayam Govt Portal",
    rating: 4.9,
    description: "Comprehensive university-level lectures on asymptotic analysis, trees, graphs, dynamic programming, and greedy algorithms.",
    tags: ["GATE", "DSA", "NPTEL", "IIT Lectures", "Free"],
  },
  {
    id: "gate-overflow-pyqs",
    title: "GATE Overflow Comprehensive CSE Question Bank",
    category: "Practice Papers & PYQs",
    targetExamOrCareer: "GATE CSE",
    authorOrProvider: "GATE Overflow Community",
    format: "Web Portal",
    accessType: "Free",
    sourceUrl: "https://gateoverflow.in",
    sourceLabel: "GateOverflow.in",
    rating: 4.9,
    description: "Categorized, peer-reviewed solutions and discussion for every single GATE CS question asked since 1987.",
    tags: ["GATE CSE", "PYQ Solutions", "Free Community"],
  },

  // Coding & Tech
  {
    id: "striver-sde-sheet",
    title: "TakeUforward SDE Placement & DSA Roadmap (Striver Sheet)",
    category: "Practice Papers & PYQs",
    targetExamOrCareer: "Full Stack / SDE Career",
    authorOrProvider: "Raj Vikramaditya (takeUforward)",
    format: "Web Portal",
    accessType: "Free",
    sourceUrl: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2",
    sourceLabel: "TakeUforward Portal",
    rating: 4.9,
    description: "Structured A-to-Z DSA problem curriculum with step-by-step video editorials, C++, Java, and Python solutions.",
    tags: ["DSA", "LeetCode", "Placement", "SDE Sheet", "Free"],
  },
  {
    id: "full-stack-open",
    title: "Full Stack Open (University of Helsinki Deep Dive)",
    category: "YouTube Courses",
    targetExamOrCareer: "Full Stack Software Engineer",
    authorOrProvider: "University of Helsinki",
    format: "Web Portal",
    accessType: "Free",
    sourceUrl: "https://fullstackopen.com/en",
    sourceLabel: "University of Helsinki",
    rating: 5.0,
    description: "Free modern open-source course covering React, Redux, Node.js, Express, REST, GraphQL, TypeScript, and CI/CD.",
    tags: ["Full Stack", "React", "NodeJS", "TypeScript", "Free Certificate"],
  },

  // Banking & SSC
  {
    id: "ssc-cgl-maths-pyqs",
    title: "SSC CGL 7300+ Quantitative Aptitude Chapterwise",
    category: "Standard Books",
    targetExamOrCareer: "SSC CGL / Banking",
    authorOrProvider: "Rakesh Yadav Readers Publication",
    format: "Book / Paperback",
    accessType: "Paid / Library",
    sourceUrl: "https://rypbooks.com",
    sourceLabel: "Rakesh Yadav Publication",
    rating: 4.8,
    description: "Contains all previous year SSC CGL, CPO, CHSL Math questions with fast arithmetic shortcut solutions.",
    tags: ["SSC CGL", "Quantitative Aptitude", "Maths"],
  },
  {
    id: "rbi-official-reports",
    title: "RBI Annual Report & Report on Trend and Progress of Banking in India",
    category: "Official Portals & Syllabus",
    targetExamOrCareer: "RBI Grade B / Finance",
    authorOrProvider: "Reserve Bank of India",
    format: "PDF Download",
    accessType: "Free",
    sourceUrl: "https://rbi.org.in/Scripts/AnnualPublications.aspx",
    sourceLabel: "Official RBI Website",
    rating: 4.9,
    description: "Official monetary and banking statistics directly tested in Phase 2 Economic & Social Issues (ESI) and Finance papers.",
    tags: ["RBI Grade B", "Official Reports", "Finance", "Free"],
  },
];
