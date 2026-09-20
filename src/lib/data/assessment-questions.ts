export interface AssessmentQuestion {
  id: number;
  text: string;
  category:
    | "Technology"
    | "Science & Logic"
    | "Healthcare"
    | "Management"
    | "Business & Finance"
    | "Commerce"
    | "Arts & Creativity"
    | "Law & Governance"
    | "Communication"
    | "Leadership";
  trait: string;
  weight: number;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // 1-10 Technology & Logic
  { id: 1, text: "I enjoy writing code, building software, and exploring new digital tools.", category: "Technology", trait: "Tech Affinity", weight: 1.2 },
  { id: 2, text: "I find satisfaction in breaking down complex technical problems into structured step-by-step algorithms.", category: "Technology", trait: "Algorithmic Thinking", weight: 1.1 },
  { id: 3, text: "I am deeply curious about how artificial intelligence, neural networks, and automation work.", category: "Technology", trait: "AI Curiosity", weight: 1.2 },
  { id: 4, text: "I like fixing hardware, experimenting with cloud servers, or securing networks against cyber threats.", category: "Technology", trait: "Systems & Security", weight: 1.0 },
  { id: 5, text: "I enjoy designing modern websites, mobile applications, and interactive user interfaces.", category: "Technology", trait: "App Development", weight: 1.0 },
  { id: 6, text: "I get excited when analyzing mathematical formulas, probability distributions, and data patterns.", category: "Science & Logic", trait: "Mathematical Rigor", weight: 1.1 },
  { id: 7, text: "I like conducting scientific experiments, testing hypotheses, and reading research papers.", category: "Science & Logic", trait: "Research Mindset", weight: 1.0 },
  { id: 8, text: "I am fascinated by space exploration, astrophysics, rockets, and satellite systems.", category: "Science & Logic", trait: "Aerospace & Physics", weight: 1.0 },
  { id: 9, text: "I prefer working with data spreadsheets, statistical charts, and predictive models rather than subjective opinions.", category: "Science & Logic", trait: "Quantitative Analysis", weight: 1.1 },
  { id: 10, text: "When solving a puzzle, I systematically test every scenario until I find the most optimal solution.", category: "Science & Logic", trait: "Logical Problem Solving", weight: 1.0 },

  // 11-18 Healthcare & Biology
  { id: 11, text: "I feel a strong sense of purpose when caring for sick individuals and improving human health.", category: "Healthcare", trait: "Empathy & Care", weight: 1.2 },
  { id: 12, text: "I find human anatomy, physiology, genetics, and how medicines interact with the body fascinating.", category: "Healthcare", trait: "Medical Science", weight: 1.2 },
  { id: 13, text: "I can stay calm, focused, and composed during medical or physical emergency situations.", category: "Healthcare", trait: "Crisis Composure", weight: 1.1 },
  { id: 14, text: "I am interested in mental health, understanding human psychological behavior, and counseling others.", category: "Healthcare", trait: "Psychology & Wellness", weight: 1.0 },
  { id: 15, text: "I am intrigued by biotechnological advancements, gene editing, and laboratory diagnostics.", category: "Healthcare", trait: "Biotechnology", weight: 1.0 },
  { id: 16, text: "I would love to work in a clinical hospital, surgical theater, or diagnostic healthcare facility.", category: "Healthcare", trait: "Clinical Environment", weight: 1.1 },
  { id: 17, text: "I take interest in nutrition, fitness science, and holistic public health wellness.", category: "Healthcare", trait: "Preventative Health", weight: 0.9 },
  { id: 18, text: "I am willing to dedicate extensive years of rigorous medical study to achieve clinical excellence.", category: "Healthcare", trait: "Academic Resilience", weight: 1.1 },

  // 19-26 Business, Finance & Commerce
  { id: 19, text: "I enjoy tracking the stock market, understanding corporate earnings, and studying financial investments.", category: "Business & Finance", trait: "Capital Markets", weight: 1.2 },
  { id: 20, text: "I like calculating profit margins, return on investment (ROI), and managing budgets.", category: "Business & Finance", trait: "Financial Literacy", weight: 1.1 },
  { id: 21, text: "I am interested in starting my own business venture, launching innovative products, and bootstrapping.", category: "Business & Finance", trait: "Entrepreneurial Spirit", weight: 1.2 },
  { id: 22, text: "I enjoy auditing financial statements, calculating taxes, and ensuring regulatory accounting compliance.", category: "Commerce", trait: "Auditing & Accounting", weight: 1.1 },
  { id: 23, text: "I understand the mechanics of supply chains, international trade, and commercial logistics.", category: "Commerce", trait: "Trade & Operations", weight: 1.0 },
  { id: 24, text: "I like analyzing consumer purchasing habits, pricing strategies, and product market positioning.", category: "Business & Finance", trait: "Market Strategy", weight: 1.0 },
  { id: 25, text: "I would thrive in high-stakes negotiations, venture capital fundraising, and corporate M&A deals.", category: "Business & Finance", trait: "Deal Structuring", weight: 1.1 },
  { id: 26, text: "I am comfortable working with economic indicators like inflation, GDP growth, and monetary policy.", category: "Commerce", trait: "Macroeconomics", weight: 1.0 },

  // 27-34 Leadership, Management & Communication
  { id: 27, text: "I naturally take charge when working in a group project and help organize tasks for everyone.", category: "Leadership", trait: "Team Leadership", weight: 1.2 },
  { id: 28, text: "I am confident when speaking in public, delivering presentations, and persuading an audience.", category: "Communication", trait: "Public Speaking", weight: 1.2 },
  { id: 29, text: "I enjoy resolving interpersonal conflicts, motivating peers, and building collaborative team cultures.", category: "Management", trait: "People Management", weight: 1.1 },
  { id: 30, text: "I can translate high-level executive business goals into actionable daily project sprint tasks.", category: "Management", trait: "Execution Planning", weight: 1.1 },
  { id: 31, text: "I enjoy writing compelling essays, marketing copy, and persuasive written arguments.", category: "Communication", trait: "Written Persuasion", weight: 1.0 },
  { id: 32, text: "I prefer strategic long-term planning over short-term impulsive decision making.", category: "Management", trait: "Strategic Thinking", weight: 1.0 },
  { id: 33, text: "I adapt quickly when organizational priorities change and can lead under ambiguity.", category: "Leadership", trait: "Adaptive Leadership", weight: 1.1 },
  { id: 34, text: "I enjoy mentoring younger students or colleagues and guiding their professional growth.", category: "Leadership", trait: "Mentorship", weight: 0.9 },

  // 35-42 Law, Policy & Governance
  { id: 35, text: "I have a deep desire to serve the nation and work within public administrative institutions.", category: "Law & Governance", trait: "Public Service", weight: 1.2 },
  { id: 36, text: "I follow national current affairs, constitutional debates, and parliamentary legislative bills.", category: "Law & Governance", trait: "Policy Awareness", weight: 1.1 },
  { id: 37, text: "I enjoy analyzing legal contracts, statutory acts, and spotting loopholes or compliance clauses.", category: "Law & Governance", trait: "Legal Analysis", weight: 1.2 },
  { id: 38, text: "I believe strongly in fighting for social justice, human rights, and ethical governance.", category: "Law & Governance", trait: "Social Ethics", weight: 1.1 },
  { id: 39, text: "I am drawn toward the discipline, physical courage, and national defense leadership of the Armed Forces.", category: "Law & Governance", trait: "Defense Aspirations", weight: 1.2 },
  { id: 40, text: "I can logically debate both sides of a controversial social or political issue objectively.", category: "Law & Governance", trait: "Objective Debate", weight: 1.0 },
  { id: 41, text: "I am interested in diplomatic foreign relations, geopolitics, and international treaties.", category: "Law & Governance", trait: "Geopolitics", weight: 1.0 },
  { id: 42, text: "I have the patience and stamina for rigorous law school case readings and bar examination study.", category: "Law & Governance", trait: "Legal Endurance", weight: 1.0 },

  // 43-50 Arts, Design & Innovation
  { id: 43, text: "I love sketching, digital graphic art, color palettes, and creating visual aesthetics.", category: "Arts & Creativity", trait: "Visual Arts", weight: 1.2 },
  { id: 44, text: "I notice bad design in everyday apps, physical objects, and always think about how to improve them.", category: "Arts & Creativity", trait: "Design Thinking", weight: 1.1 },
  { id: 45, text: "I am fascinated by 3D animation, video editing, game mechanics, and visual storytelling.", category: "Arts & Creativity", trait: "Multimedia & Game Design", weight: 1.1 },
  { id: 46, text: "I enjoy creative creative writing, poetry, scriptwriting, and building imaginary story worlds.", category: "Arts & Creativity", trait: "Creative Writing", weight: 1.0 },
  { id: 47, text: "I am passionate about architecture, spatial planning, and interior environment design.", category: "Arts & Creativity", trait: "Spatial Design", weight: 1.0 },
  { id: 48, text: "I express my ideas best through visual diagrams, prototypes, and mind-maps rather than plain text.", category: "Arts & Creativity", trait: "Visual Communication", weight: 1.0 },
  { id: 49, text: "I am excited by music production, sound design, and acoustic audio engineering.", category: "Arts & Creativity", trait: "Audio Creativity", weight: 0.9 },
  { id: 50, text: "I prioritize originality, creative expression, and aesthetic beauty in my daily work.", category: "Arts & Creativity", trait: "Creative Identity", weight: 1.1 },
];

export interface AssessmentResultData {
  categoryScores: Record<string, number>;
  radarData: Array<{ area: string; score: number }>;
  topTraits: string[];
  personalitySummary: string;
  learningStyle: string;
  strengths: string[];
  growthAreas: string[];
  recommendedCareerIds: string[];
  completedAt: string;
}

export function calculateAssessmentResults(answers: Record<number, number>): AssessmentResultData {
  const categoryTotals: Record<string, { sum: number; count: number }> = {
    Technology: { sum: 0, count: 0 },
    "Science & Logic": { sum: 0, count: 0 },
    Healthcare: { sum: 0, count: 0 },
    Management: { sum: 0, count: 0 },
    "Business & Finance": { sum: 0, count: 0 },
    Commerce: { sum: 0, count: 0 },
    "Arts & Creativity": { sum: 0, count: 0 },
    "Law & Governance": { sum: 0, count: 0 },
    Communication: { sum: 0, count: 0 },
    Leadership: { sum: 0, count: 0 },
  };

  const traitScores: Array<{ trait: string; score: number }> = [];

  ASSESSMENT_QUESTIONS.forEach((q) => {
    const rawVal = answers[q.id] ?? 3; // 1 to 5 Likert scale, default neutral 3
    const weightedScore = rawVal * q.weight;
    if (categoryTotals[q.category]) {
      categoryTotals[q.category]!.sum += weightedScore;
      categoryTotals[q.category]!.count += q.weight;
    }
    traitScores.push({ trait: q.trait, score: weightedScore });
  });

  const categoryPercentScores: Record<string, number> = {};
  Object.keys(categoryTotals).forEach((cat) => {
    const item = categoryTotals[cat]!;
    // Scale 1-5 to percentage (1 -> 20%, 5 -> 100%)
    const avg = item.count > 0 ? item.sum / item.count : 3;
    const pct = Math.round(((avg - 1) / 4) * 100);
    categoryPercentScores[cat] = Math.max(10, Math.min(100, pct));
  });

  // Top 6 areas for radar chart
  const radarData = [
    { area: "Technology", score: categoryPercentScores["Technology"] ?? 75 },
    { area: "Science", score: categoryPercentScores["Science & Logic"] ?? 65 },
    { area: "Management", score: categoryPercentScores["Management"] ?? 70 },
    { area: "Finance", score: categoryPercentScores["Business & Finance"] ?? 60 },
    { area: "Creativity", score: categoryPercentScores["Arts & Creativity"] ?? 65 },
    { area: "Governance", score: categoryPercentScores["Law & Governance"] ?? 60 },
  ];

  // Top traits
  traitScores.sort((a, b) => b.score - a.score);
  const topTraits = traitScores.slice(0, 5).map((t) => t.trait);

  // Determine top careers based on highest category scores
  const sortedCategories = Object.entries(categoryPercentScores).sort((a, b) => b[1] - a[1]);
  const primaryCategory = sortedCategories[0]?.[0] ?? "Technology";
  const secondaryCategory = sortedCategories[1]?.[0] ?? "Science & Logic";

  let recommendedCareerIds = ["ai-ml-engineer", "full-stack-developer", "data-scientist", "ias-officer", "product-manager"];

  if (primaryCategory === "Technology" || secondaryCategory === "Technology") {
    recommendedCareerIds = ["ai-ml-engineer", "full-stack-developer", "cloud-architect", "cyber-security-analyst", "data-scientist"];
  } else if (primaryCategory === "Healthcare" || secondaryCategory === "Healthcare") {
    recommendedCareerIds = ["doctor-mbbs-md", "biomedical-engineer", "clinical-psychologist", "data-scientist", "ias-officer"];
  } else if (primaryCategory === "Business & Finance" || primaryCategory === "Commerce") {
    recommendedCareerIds = ["investment-banker", "chartered-accountant", "management-consultant", "rbi-grade-b-officer", "product-manager"];
  } else if (primaryCategory === "Law & Governance") {
    recommendedCareerIds = ["ias-officer", "corporate-lawyer", "ssc-cgl-officer", "defense-officer-army-navy-airforce", "rbi-grade-b-officer"];
  } else if (primaryCategory === "Arts & Creativity") {
    recommendedCareerIds = ["ui-ux-product-designer", "game-developer", "product-manager", "full-stack-developer", "management-consultant"];
  }

  return {
    categoryScores: categoryPercentScores,
    radarData,
    topTraits,
    personalitySummary: `Analytical problem solver with strong ${primaryCategory.toLowerCase()} aptitude and ${secondaryCategory.toLowerCase()} orientation. You demonstrate high structured thinking, systematic execution, and disciplined focus.`,
    learningStyle: "Visual & Hands-on Practical (Applies concepts immediately through building real-world projects, solving previous-year problems, and analyzing system architectures).",
    strengths: [
      `High affinity for ${primaryCategory} domains and technical problem solving`,
      `Strong grasp of logical frameworks and pattern recognition`,
      "Consistent execution capability and high academic stamina",
      "Strategic aptitude for competitive examination benchmarks",
    ],
    growthAreas: [
      "Broaden exposure to cross-functional industry tools and live collaborative projects",
      "Enhance speed and accuracy under strict timed mock examination conditions",
      "Regularly practice expressive long-form structured articulation",
    ],
    recommendedCareerIds,
    completedAt: new Date().toISOString(),
  };
}
