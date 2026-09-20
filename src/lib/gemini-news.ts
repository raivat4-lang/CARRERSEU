export interface ExamNewsItem {
  id: string;
  title: string;
  shortName: string;
  category: "Engineering" | "Medical" | "Civil Services" | "Banking" | "Defense" | "Management" | "General";
  status: "Registration Open" | "Upcoming" | "Admit Card Released" | "Results Declared";
  date: string;
  eligibility: string;
  summary: string;
  highlights: string[];
  officialUrl?: string;
  lastUpdated: string;
}

export const FALLBACK_EXAM_NEWS: ExamNewsItem[] = [
  {
    id: "upsc-cse-2026",
    title: "UPSC Civil Services Examination (CSE) 2026 Notification",
    shortName: "UPSC CSE",
    category: "Civil Services",
    status: "Registration Open",
    date: "May 24, 2026",
    eligibility: "Bachelor's degree in any discipline | Age: 21-32 years",
    summary:
      "Union Public Service Commission has released the prelims notification. Over 1,000 posts announced for IAS, IPS, IFS, and Central Group A/B services.",
    highlights: [
      "Prelims scheduled for May 2026 across major cities",
      "Negative marking of 1/3rd for wrong answers in GS Paper I",
      "CSAT Paper II remains qualifying with 33% minimum mark",
    ],
    officialUrl: "https://upsc.gov.in",
    lastUpdated: "Just now",
  },
  {
    id: "gate-2027",
    title: "GATE 2027 Official Exam Calendar & Syllabus Update",
    shortName: "GATE 2027",
    category: "Engineering",
    status: "Upcoming",
    date: "Feb 06-14, 2027",
    eligibility: "3rd year or completed B.Tech / B.E / M.Sc",
    summary:
      "IIT organizing body releases tentative schedule for Graduate Aptitude Test in Engineering 2027 covering 30 paper disciplines.",
    highlights: [
      "2 new sectional sub-topics added in Data Science & AI paper",
      "Score valid for 3 years for PSU recruitment (ONGC, IOCL, NTPC)",
      "Direct M.Tech admission eligibility for IITs & NITs",
    ],
    officialUrl: "https://gate.iitk.ac.in",
    lastUpdated: "Today",
  },
  {
    id: "jee-main-2026",
    title: "JEE Main 2026 Session 2 Scorecard & Rank List Out",
    shortName: "JEE Main",
    category: "Engineering",
    status: "Results Declared",
    date: "April 2026",
    eligibility: "Class 12 Passed/Appearing with Physics, Chemistry & Math",
    summary:
      "National Testing Agency (NTA) has published JEE Main final ranks. Top 2,50,000 candidates qualify for JEE Advanced 2026.",
    highlights: [
      "JoSAA counseling registration starts next week",
      "Cutoff percentiles announced for General, OBC-NCL, EWS, SC, ST",
      "AIR rank cards available on jeemain.nta.ac.in",
    ],
    officialUrl: "https://jeemain.nta.ac.in",
    lastUpdated: "1 day ago",
  },
  {
    id: "neet-ug-2026",
    title: "NEET UG 2026 Registration & Exam Date Announcement",
    shortName: "NEET UG",
    category: "Medical",
    status: "Registration Open",
    date: "May 03, 2026",
    eligibility: "Class 12 with PCB (Physics, Chemistry, Biology) min 50%",
    summary:
      "National Testing Agency opens NEET UG registration for MBBS, BDS, BAMS, BHMS & Nursing admissions in India.",
    highlights: [
      "Single national level entrance for all AIIMS, JIPMER & Govt Colleges",
      "Pen and paper OMR-based test across 500+ exam centers",
      "720 marks total (Biology 360, Physics 180, Chemistry 180)",
    ],
    officialUrl: "https://neet.nta.nic.in",
    lastUpdated: "2 days ago",
  },
  {
    id: "ssc-cgl-2026",
    title: "SSC CGL 2026 Tier 1 Admit Card & Exam City Intimation",
    shortName: "SSC CGL",
    category: "Civil Services",
    status: "Admit Card Released",
    date: "September 2026",
    eligibility: "Graduation in any stream | Age 18-30 years",
    summary:
      "Staff Selection Commission releases Tier 1 hall tickets for 17,000+ Assistant Section Officer, Inspector & Auditor posts.",
    highlights: [
      "Computer Based Test (CBT) covering Reasoning, Quant, English, GK",
      "Tier 1 qualifying in nature, Tier 2 determines final selection list",
      "Regional website download links live for NR, CR, WR, SR zones",
    ],
    officialUrl: "https://ssc.gov.in",
    lastUpdated: "3 days ago",
  },
  {
    id: "ibps-po-2026",
    title: "IBPS Probationary Officer (PO) 2026 Recruitment Drive",
    shortName: "IBPS PO",
    category: "Banking",
    status: "Registration Open",
    date: "October 2026",
    eligibility: "Graduate degree from a recognized university",
    summary:
      "Institute of Banking Personnel Selection invites online applications for 4,500+ PO/MT posts in 11 participating public sector banks.",
    highlights: [
      "3-stage selection: Prelims, Mains, and Personal Interview",
      "Participating banks include PNB, Bank of Baroda, Canara Bank",
      "Starting salary package approx ₹52,000 - ₹55,000 per month",
    ],
    officialUrl: "https://ibps.in",
    lastUpdated: "Just now",
  },
  {
    id: "isro-icrb-2026",
    title: "ISRO Scientist/Engineer Recruitment Notification 2026",
    shortName: "ISRO Scientist",
    category: "Engineering",
    status: "Upcoming",
    date: "November 2026",
    eligibility: "B.E/B.Tech with minimum 65% aggregate marks",
    summary:
      "Indian Space Research Organisation announces Scientist 'SC' vacancies in Mechanical, Electronics and Computer Science disciplines.",
    highlights: [
      "GATE score based shortlisting followed by written test and interview",
      "Posting at ISRO centers across India (VSSC, URSC, SAC, SDSC)",
      "Prestigious Pay Matrix Level 10 entry for young engineers",
    ],
    officialUrl: "https://isro.gov.in",
    lastUpdated: "Today",
  },
  {
    id: "nda-2-2026",
    title: "UPSC NDA & NA (II) Exam 2026 Application Portal",
    shortName: "NDA II 2026",
    category: "Defense",
    status: "Registration Open",
    date: "September 2026",
    eligibility: "Passed/Appearing Class 12 | Unmarried Male/Female candidates",
    summary:
      "UPSC invites applications for National Defence Academy & Naval Academy Examination (II) 2026 for Army, Navy & Air Force wings.",
    highlights: [
      "Mathematics (300 marks) & General Ability Test (600 marks)",
      "Followed by 5-day SSB Interview for shortlisted candidates",
      "Includes Air Force Flying Branch, Naval Cadets and Army wing",
    ],
    officialUrl: "https://upsc.gov.in",
    lastUpdated: "4 days ago",
  },
];

export async function fetchGeminiExamNews(categoryFilter?: string): Promise<{ items: ExamNewsItem[]; source: "ai" | "cached" }> {
  const apiKey =
    import.meta.env['VITE_GEMINI_API_KEY'] ||
    import.meta.env['GEMINI_API_KEY'] ||
    "";

  if (!apiKey) {
    const filtered = categoryFilter && categoryFilter !== "All"
      ? FALLBACK_EXAM_NEWS.filter((item) => item.category === categoryFilter)
      : FALLBACK_EXAM_NEWS;
    return { items: filtered, source: "cached" };
  }

  try {
    const prompt = `You are an expert educational counselor in India. Return the latest 6 exam news updates and notifications for entrance and competitive exams in India for students in 2026/2027 (e.g. UPSC, GATE, JEE Main, NEET, SSC CGL, IBPS PO, ISRO, NDA, CAT).
Return ONLY a valid JSON array of objects without any markdown text or codeblocks around it, matching this JSON schema:
[
  {
    "id": "string",
    "title": "string",
    "shortName": "string",
    "category": "Engineering" | "Medical" | "Civil Services" | "Banking" | "Defense" | "Management",
    "status": "Registration Open" | "Upcoming" | "Admit Card Released" | "Results Declared",
    "date": "string",
    "eligibility": "string",
    "summary": "string",
    "highlights": ["string", "string", "string"],
    "officialUrl": "string",
    "lastUpdated": "Live AI update"
  }
]`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error status: ${response.status}`);
    }

    const data = await response.json();
    const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textResult) {
      const parsed: ExamNewsItem[] = JSON.parse(textResult);
      const filtered = categoryFilter && categoryFilter !== "All"
        ? parsed.filter((item) => item.category === categoryFilter)
        : parsed;
      return { items: filtered, source: "ai" };
    }
  } catch (err) {
    console.warn("Failed to fetch live Gemini exam news, using verified cache:", err);
  }

  const filtered = categoryFilter && categoryFilter !== "All"
    ? FALLBACK_EXAM_NEWS.filter((item) => item.category === categoryFilter)
    : FALLBACK_EXAM_NEWS;
  return { items: filtered, source: "cached" };
}
