export type AIProvider = "auto" | "gemini" | "groq" | "openai" | "knowledge";

export interface AIConfig {
  provider: AIProvider;
  geminiKey?: string;
  groqKey?: string;
  openaiKey?: string;
  openaiEndpoint?: string;
  modelName?: string;
}

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          options?: { model?: string }
        ) => Promise<{ message?: { content?: string } } | string>;
      };
    };
  }
}

const SYSTEM_PROMPT = `You are CareerSetu AI, an expert, encouraging, and highly knowledgeable AI career counselor, education advisor, and mentor for students and professionals in India and globally.
Provide clear, actionable, well-structured answers using bold headings, bullet points, clean numbers, and real-world examples.
Explain complex concepts (like LPA, CTC, exam patterns, top colleges, software career roadmaps, college selection) simply and thoroughly.`;

export async function askCareerSetuAI(
  userQuery: string,
  config?: Partial<AIConfig>
): Promise<{ text: string; source: string }> {
  const query = userQuery.trim();
  if (!query) return { text: "Please provide a question.", source: "system" };

  const storedGeminiKey =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("careersetu_gemini_api_key") || ""
      : "";
  const storedGroqKey =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("careersetu_groq_api_key") || ""
      : "";
  const storedOpenAIKey =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("careersetu_openai_api_key") || ""
      : "";
  const activeProvider =
    config?.provider ||
    (typeof localStorage !== "undefined"
      ? (localStorage.getItem("careersetu_ai_provider") as AIProvider) || "auto"
      : "auto");

  // 1. If user configured Google Gemini Key or env key
  const geminiApiKey =
    config?.geminiKey ||
    storedGeminiKey ||
    import.meta.env["VITE_GEMINI_API_KEY"] ||
    import.meta.env["GEMINI_API_KEY"] ||
    "";

  if (activeProvider === "gemini" || (geminiApiKey && activeProvider === "auto")) {
    if (geminiApiKey) {
      try {
        const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];
        for (const model of models) {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `${SYSTEM_PROMPT}\n\nUser Question: ${query}`,
                      },
                    ],
                  },
                ],
              }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return { text: reply, source: `Google Gemini (${model})` };
            }
          }
        }
      } catch (e) {
        console.warn("Gemini API call failed, falling back:", e);
      }
    }
  }

  // 2. If user configured Groq API Key
  const groqApiKey = config?.groqKey || storedGroqKey;
  if (activeProvider === "groq" || (groqApiKey && activeProvider === "auto")) {
    if (groqApiKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: config?.modelName || "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: query },
            ],
            temperature: 0.7,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) {
            return { text: reply, source: "Groq (Llama 3.3 70B)" };
          }
        }
      } catch (e) {
        console.warn("Groq API call failed:", e);
      }
    }
  }

  // 3. If user configured OpenAI / OpenRouter
  const openaiApiKey = config?.openaiKey || storedOpenAIKey;
  if (openaiApiKey) {
    try {
      const endpoint =
        config?.openaiEndpoint ||
        (typeof localStorage !== "undefined"
          ? localStorage.getItem("careersetu_openai_endpoint") || "https://api.openai.com/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: config?.modelName || "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: query },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) {
          return { text: reply, source: "OpenAI / Custom LLM" };
        }
      }
    } catch (e) {
      console.warn("Custom OpenAI API failed:", e);
    }
  }

  // 4. Try Puter.js in-browser AI
  if (typeof window !== "undefined" && window.puter?.ai) {
    try {
      const puterRes = await window.puter.ai.chat(
        `${SYSTEM_PROMPT}\n\nQuestion: ${query}`,
        { model: "gpt-4o-mini" }
      );

      let textOutput = "";
      if (typeof puterRes === "string") {
        textOutput = puterRes;
      } else if (puterRes?.message?.content) {
        textOutput = puterRes.message.content;
      }

      if (textOutput && textOutput.length > 20) {
        return { text: textOutput, source: "CareerSetu Neural AI" };
      }
    } catch (err) {
      console.info("Puter AI unavailable, fallback to knowledge engine:", err);
    }
  }

  // 5. Intelligent Multi-Domain Career & Educational Knowledge Engine
  const knowledgeAnswer = await getSmartDomainResponse(query);
  return { text: knowledgeAnswer, source: "CareerSetu Knowledge Engine" };
}

// -------------------------------------------------------------
// COMPREHENSIVE DOMAIN KNOWLEDGE & LIVE SEARCH ENGINE
// -------------------------------------------------------------
export async function getSmartDomainResponse(rawQuery: string): Promise<string> {
  const q = rawQuery.toLowerCase().trim();

  // --- 1. TOP COLLEGES FOR BSC IT ---
  if (
    q.includes("bsc it") ||
    q.includes("bsc information technology") ||
    (q.includes("bsc") && q.includes("it") && (q.includes("college") || q.includes("top") || q.includes("best")))
  ) {
    return `### Top 10 Colleges for B.Sc. IT (Information Technology) in India

B.Sc. IT (Bachelor of Science in Information Technology) is a popular 3-year undergraduate program focusing on software development, database management, networking, and web applications.

---

### 🏛️ Top 10 B.Sc. IT Colleges in India (Ranked):

| Rank | College / University | Location | Admission Criteria | Approx. Annual Fee |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **St. Xavier's College** | Mumbai, Maharashtra | Merit / Entrance (12th PCM) | ₹35,000 - ₹50,000 |
| **2** | **Loyola College** | Chennai, Tamil Nadu | Merit Based (12th Marks) | ₹40,000 - ₹60,000 |
| **3** | **Christ University** (Central Campus) | Bangalore, Karnataka | CUET / Skill Assessment | ₹1,20,000 - ₹1,60,000 |
| **4** | **Fergusson College** | Pune, Maharashtra | Merit / SPPU Norms | ₹45,000 - ₹70,000 |
| **5** | **Madras Christian College (MCC)** | Chennai, Tamil Nadu | Merit Based | ₹35,000 - ₹55,000 |
| **6** | **Mithibai College** (SVKM) | Mumbai, Maharashtra | Merit / Mumbai University | ₹40,000 - ₹65,000 |
| **7** | **Jai Hind College** | Mumbai, Maharashtra | Common Entrance Test (CET) | ₹45,000 - ₹70,000 |
| **8** | **Stella Maris College** | Chennai, Tamil Nadu | Merit Based | ₹30,000 - ₹50,000 |
| **9** | **Mount Carmel College** | Bangalore, Karnataka | Merit + Interview | ₹80,000 - ₹1,20,000 |
| **10**| **PSG College of Arts and Science** | Coimbatore, Tamil Nadu| Merit Based | ₹35,000 - ₹55,000 |

---

### 📋 Eligibility Criteria:
- Passed **Class 12 (Higher Secondary)** from a recognized board (CBSE/ISC/State Board).
- **Mandatory Subject:** Mathematics or Statistics with minimum 45-50% aggregate marks.

---

### 💼 Career Opportunities & Salary Packages:
- **Top Job Roles:** Software Developer, Cloud Associate, Database Administrator, Web Developer, IT Analyst, Quality Assurance (QA) Engineer.
- **Top Recruiters:** TCS, Infosys, Wipro, Cognizant, Deloitte, Accenture, Capgemini, Tech Mahindra.
- **Starting Salary:** **₹3.5 LPA - ₹6.5 LPA** (Can scale to ₹15+ LPA after MCA, MSc IT, or with DSA skills).

---

### 🚀 Recommended Higher Study Paths:
1. **MCA (Master of Computer Applications):** Upgrades your profile to equivalent of B.Tech CSE for Tier 1 product companies.
2. **M.Sc. in Data Science / AI / IT:** For specialized research, machine learning, and analytics careers.
3. **MBA in IT / Systems:** For Product Management, Business Analysis, and IT Consulting.`;
  }

  // --- 2. TOP COLLEGES FOR BCA ---
  if (
    q.includes("bca") &&
    (q.includes("college") || q.includes("top") || q.includes("best") || q.includes("admission"))
  ) {
    return `### Top 10 BCA (Bachelor of Computer Applications) Colleges in India

BCA is a premier 3-year professional course focused on computer applications, software engineering, and programming languages.

---

### 🏛️ Top 10 BCA Colleges in India:

| Rank | College / Institute | City | Admission Process | Approx. Fees / Year |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Christ University** | Bangalore | Entrance Test + PI | ₹1,50,000 |
| **2** | **Symbiosis Institute of Computer Studies (SICSR)** | Pune | SET Entrance Exam | ₹1,95,000 |
| **3** | **Loyola College** | Chennai | 12th Merit | ₹55,000 |
| **4** | **St. Joseph's University** | Bangalore | Merit + Interview | ₹90,000 |
| **5** | **Madras Christian College (MCC)** | Chennai | 12th Merit | ₹45,000 |
| **6** | **Stella Maris College** | Chennai | 12th Merit | ₹40,000 |
| **7** | **Presidency College** | Bangalore | Merit / Interview | ₹85,000 |
| **8** | **Vellore Institute of Technology (VIT)** | Vellore | 12th Merit Based | ₹1,40,000 |
| **9** | **IMS Noida** | Noida (NCR) | JET Entrance Exam | ₹1,30,000 |
| **10**| **Maharaja Surajmal Institute (MSI - IPU)** | New Delhi | IPU CET / CUET | ₹95,000 |

---

### 💡 Career Prospects:
- **Average Starting Salary:** ₹3.6 LPA - ₹7.0 LPA.
- **Top Pathways:** Full Stack Web Development, Software Engineering, MCA, or Cloud Engineering.`;
  }

  // --- 3. TOP COLLEGES FOR B.TECH / ENGINEERING ---
  if (
    (q.includes("engineering") || q.includes("btech") || q.includes("b.tech") || q.includes("iit") || q.includes("nit")) &&
    (q.includes("college") || q.includes("top") || q.includes("best"))
  ) {
    return `### Top 10 Engineering (B.Tech) Colleges in India (NIRF Ranked)

---

### 🏛️ Premier Engineering Institutions:

| Rank | College / Institute | Location | Key Entrance Exam | Median Placement Package |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **IIT Madras** | Chennai, TN | JEE Advanced | ₹21.5 LPA |
| **2** | **IIT Delhi** | New Delhi | JEE Advanced | ₹22.0 LPA |
| **3** | **IIT Bombay** | Mumbai, MH | JEE Advanced | ₹23.5 LPA |
| **4** | **IIT Kanpur** | Kanpur, UP | JEE Advanced | ₹20.0 LPA |
| **5** | **IIT Kharagpur** | Kharagpur, WB | JEE Advanced | ₹19.5 LPA |
| **6** | **IIT Roorkee** | Roorkee, UK | JEE Advanced | ₹18.5 LPA |
| **7** | **IIT Guwahati** | Guwahati, AS | JEE Advanced | ₹18.0 LPA |
| **8** | **BITS Pilani** (Pilani/Goa/Hyd) | Pilani, RJ | BITSAT | ₹19.0 LPA |
| **9** | **NIT Trichy** | Tiruchirappalli, TN | JEE Main | ₹15.5 LPA |
| **10**| **IIIT Hyderabad** | Hyderabad, TS | JEE Main / UGEE | ₹30.0+ LPA (CSE) |

---

### 🎯 Key Branches in High Demand:
1. **Computer Science & Engineering (CSE) / AI & Data Science:** Highest packages (₹18 - ₹55+ LPA).
2. **Electronics & Communication (ECE):** Semiconductor & VLSI design boom.
3. **Mechanical / Electrical:** EV industry and robotics automation.`;
  }

  // --- 4. TOP COLLEGES FOR MBA ---
  if (
    (q.includes("mba") || q.includes("iim") || q.includes("management")) &&
    (q.includes("college") || q.includes("top") || q.includes("best"))
  ) {
    return `### Top 10 MBA / Management Colleges in India

---

### 🏛️ Top Business Schools:

| Rank | B-School | Location | Primary Exam | Average Salary Package |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **IIM Ahmedabad** | Ahmedabad, Gujarat | CAT | **₹34.5 LPA** |
| **2** | **IIM Bangalore** | Bangalore, Karnataka | CAT | **₹35.3 LPA** |
| **3** | **IIM Calcutta** | Kolkata, West Bengal | CAT | **₹35.0 LPA** |
| **4** | **FMS Delhi** (Faculty of Mgmt Studies) | New Delhi | CAT (ROI King! Fee: ₹2L) | **₹34.1 LPA** |
| **5** | **XLRI Jamshedpur** | Jamshedpur, Jharkhand | XAT | **₹32.7 LPA** |
| **6** | **IIM Lucknow** | Lucknow, UP | CAT | **₹32.2 LPA** |
| **7** | **IIM Kozhikode** | Kozhikode, Kerala | CAT | **₹31.0 LPA** |
| **8** | **SPJIMR** | Mumbai, Maharashtra | CAT / XAT | **₹33.0 LPA** |
| **9** | **IIM Indore** | Indore, MP | CAT | **₹30.2 LPA** |
| **10**| **JBIMS** (Jamnalal Bajaj) | Mumbai, Maharashtra | MAH CET / CAT | **₹28.0 LPA** |`;
  }

  // --- 5. TOP COLLEGES FOR MEDICAL / MBBS ---
  if (
    (q.includes("mbbs") || q.includes("medical") || q.includes("doctor")) &&
    (q.includes("college") || q.includes("top") || q.includes("best"))
  ) {
    return `### Top 10 Medical Colleges (MBBS) in India (NIRF Rankings)

---

### 🏛️ Top Medical Colleges:

| Rank | Institute | Location | Entrance Exam | Total MBBS Seats |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **AIIMS New Delhi** | New Delhi | NEET UG (AIR 1-50) | 125 |
| **2** | **Post Graduate Institute (PGIMER)** | Chandigarh | NEET PG / INI-CET | Post-Grad |
| **3** | **Christian Medical College (CMC)** | Vellore, TN | NEET UG | 100 |
| **4** | **National Institute of Mental Health (NIMHANS)** | Bangalore, KA | INI-CET | Specialized |
| **5** | **JIPMER** | Puducherry | NEET UG | 200 |
| **6** | **King George's Medical University (KGMU)** | Lucknow, UP | NEET UG | 250 |
| **7** | **Madras Medical College (MMC)** | Chennai, TN | NEET UG | 250 |
| **8** | **Armed Forces Medical College (AFMC)** | Pune, MH | NEET UG + ToLR + Interview | 150 |
| **9** | **Kasturba Medical College (KMC)** | Manipal, KA | NEET UG | 250 |
| **10**| **Maulana Azad Medical College (MAMC)** | New Delhi | NEET UG | 250 |`;
  }

  // --- 6. LPA & SALARY CONCEPTS ---
  if (
    q.includes("what is lpa") ||
    q.includes("lpa meaning") ||
    q.includes("lpa stands for") ||
    q.includes("lpa in salary") ||
    q === "lpa" ||
    q.includes("l.p.a") ||
    q.includes("ctc vs lpa") ||
    q.includes("how much is lpa")
  ) {
    return `### What is LPA in Salary? Complete Explanation & Calculation

**LPA** stands for **Lakhs Per Annum** (*1 Lakh = 100,000 Indian Rupees (INR)*). In India, it is the standard metric used by companies and universities to describe an annual salary package or **CTC (Cost to Company)**.

---

### 1. Monthly Breakdown of Common LPA Packages:

| LPA Package | Annual Salary (Gross) | Monthly Gross Salary | Approx. Monthly In-Hand (After PF & Tax)* |
| :--- | :--- | :--- | :--- |
| **₹3.5 LPA** | ₹3,50,000 | ₹29,166 | **~₹24,000 - ₹26,000** |
| **₹6.0 LPA** | ₹6,00,000 | ₹50,000 | **~₹42,000 - ₹45,000** |
| **₹10.0 LPA**| ₹10,00,000 | ₹83,333 | **~₹68,000 - ₹73,000** |
| **₹15.0 LPA**| ₹15,00,000 | ₹1,25,000 | **~₹95,000 - ₹1,03,000** |
| **₹24.0 LPA**| ₹24,00,000 | ₹2,00,000 | **~₹1,45,000 - ₹1,58,000** |
| **₹50.0 LPA**| ₹50,00,000 | ₹4,16,666 | **~₹2,75,000 - ₹3,10,000** |

*\*Note: In-hand depends on basic pay percentage, standard deduction (₹75,000), PF contribution (12%), professional tax, and tax regime.*

---

### 2. Difference Between CTC, Gross, and In-Hand:

1. **CTC (Cost to Company):** Total amount the company spends on you per year (Basic + HRA + Allowances + PF + Gratuity + Insurance + Bonuses + Stocks).
2. **Gross Salary:** CTC minus Employer PF, Gratuity, and non-cash perks.
3. **In-Hand / Take-Home Salary:** Liquid cash credited to your bank account every month after Employee PF, Professional Tax, and Income Tax (TDS).

---

### 3. Key Components of an Indian Offer Letter:
- **Basic Pay (40-50% of CTC):** 100% taxable, baseline for PF & Gratuity.
- **House Rent Allowance (HRA):** Tax-exempt partially if living in rented accommodation.
- **Provident Fund (EPF):** 12% of basic pay contributed by employee + 12% by employer.
- **Variable Bonus (10-20%):** Paid quarterly or annually based on performance metrics.
- **Stocks / RSUs / ESOPs:** Vested over 3-4 years in tech companies and startups.`;
  }

  // --- 7. CTC VS IN-HAND SALARY ---
  if (q.includes("ctc vs in hand") || q.includes("difference between ctc") || q.includes("in hand salary")) {
    return `### CTC vs In-Hand Salary: Clear Breakdown

### What is CTC?
**CTC (Cost to Company)** is the total financial expenditure a company incurs on an employee annually. It represents the "on-paper" package.

### What is In-Hand Salary?
**In-Hand (Take-Home) Salary** is the actual liquid cash deposited into your bank account on the 1st of every month.

---

### Why is In-Hand Lower Than CTC?
If your offer letter states **₹12 LPA CTC**, your monthly in-hand is not ₹1,00,000. Here is why:
1. **Provident Fund (EPF):** ₹1,800 to 12% of Basic Pay is deducted for retirement savings.
2. **Income Tax (TDS):** Deducted monthly as per income tax slabs.
3. **Gratuity:** ~4.81% of Basic Pay held by employer (payable after 5 years).
4. **Variable Pay / Performance Bonus:** 10-20% paid only at year-end based on targets.
5. **Non-Cash Perks:** Medical insurance, cab facilities, food coupons included in CTC.

---

### Quick Formula:
\`\`\`
Monthly In-Hand ≈ (Fixed Base CTC - Annual PF - Taxes - Gratuity) ÷ 12
\`\`\`
For a standard ₹12 LPA package, monthly take-home is usually **₹75,000 - ₹82,000**.`;
  }

  // --- 8. JEE (MAIN & ADVANCED) ---
  if (q.includes("jee") || (q.includes("iit") && !q.includes("college"))) {
    return `### JEE (Joint Entrance Examination) Comprehensive Guide

**JEE** is India's most prestigious national entrance examination for admission into premier engineering colleges.

---

### 1. Two-Tier Examination Structure:
1. **JEE Main (Conducted by NTA):**
   - **Frequency:** 2 Sessions (January & April).
   - **Colleges:** 32 NITs, 26 IIITs, 38 GFTIs, and state universities.
   - **Eligibility:** Class 12 with Physics, Chemistry, and Mathematics (min 75% aggregate or top 20 percentile).
   - **Format:** Computer Based Test (CBT) | 300 Marks | 3 Hours | 90 Questions (30 each in PCM).
2. **JEE Advanced (Conducted by IITs):**
   - **Eligibility:** Top 2,50,000 rank holders of JEE Main.
   - **Colleges:** 23 Indian Institutes of Technology (IITs).
   - **Format:** 2 Compulsory Papers (Paper 1 & Paper 2, 3 hours each on the same day).

---

### 2. High-Yield Preparation Roadmap:
- **Physics:** Focus on Mechanics, Electromagnetism, Modern Physics, and Thermodynamics. Books: *HC Verma Concepts of Physics*, *DC Pandey*.
- **Chemistry:** 100% mastery of **NCERT line-by-line** (Inorganic & Organic). Physical Chemistry: *RC Mukherjee* or *N. Awasthi*.
- **Mathematics:** Strong problem-solving in Calculus, Vectors & 3D, Coordinate Geometry. Books: *Cengage Series* by G. Tewani.
- **Test Strategy:** Complete at least 40 full-length mock tests and solve 15 years of Chapterwise Previous Year Questions (PYQs).`;
  }

  // --- 9. NEET (UG) ---
  if (q.includes("neet") || (q.includes("mbbs") && !q.includes("college"))) {
    return `### NEET UG (National Eligibility cum Entrance Test) Guide

**NEET UG** is the single national entrance exam for admission to MBBS, BDS, BAMS, BHMS, and AIIMS in India.

---

### 1. Exam Pattern & Marking:
- **Total Marks:** 720 Marks (180 questions to attempt out of 200).
- **Subject Weightage:**
  - **Biology (Botany + Zoology):** 360 Marks (90 questions) — *50% of total score!*
  - **Chemistry:** 180 Marks (45 questions).
  - **Physics:** 180 Marks (45 questions).
- **Marking Scheme:** +4 for correct answer, -1 for wrong answer.
- **Duration:** 3 hours 20 minutes (Pen & Paper OMR format).

---

### 2. Proven Blueprint for 650+ Score:
1. **Biology (Target: 340+):** NCERT is mandatory. Memorize diagrams, scientist biographies, and tables. Solve 10,000+ MCQs from *MTG NCERT at your Fingertips*.
2. **Chemistry (Target: 155+):** Master named reactions in Organic, periodic trends in Inorganic, and formula application in Physical.
3. **Physics (Target: 140+):** Keep a dedicated formula notebook. Practice 50 numericals daily with a timer.
4. **Mock Tests:** Attempt at least 35 full-syllabus OMR-based tests to eliminate negative marking and bubble filling errors.`;
  }

  // --- 10. UPSC CIVIL SERVICES (IAS, IPS, IFS) ---
  if (q.includes("upsc") || q.includes("ias") || q.includes("ips") || q.includes("civil services")) {
    return `### UPSC Civil Services Examination (CSE) Master Guide

The UPSC CSE is India's premier examination for recruitment into **IAS, IPS, IFS, IRS**, and other Central Group A services.

---

### 1. Three-Stage Examination Architecture:
1. **Stage 1: Preliminary Exam (Objective):**
   - **GS Paper 1 (200 Marks):** Cut-off determining (History, Geography, Polity, Economy, Environment, Current Affairs).
   - **CSAT Paper 2 (200 Marks):** Qualifying only (requires min 33% = 66 marks).
2. **Stage 2: Mains Exam (Subjective/Descriptive):**
   - 9 Papers (Total: 1,750 Marks): Essay (250), GS 1 to GS 4 (1,000 marks), Optional Subject Paper 1 & 2 (500 marks), plus 2 qualifying language papers.
3. **Stage 3: Personality Test / Interview (275 Marks):**
   - Conducted at Dholpur House, New Delhi. Total final ranking is based on **2,025 Marks** (Mains + Interview).

---

### 2. Essential Foundation Booklist:
- **Polity:** *Indian Polity* by M. Laxmikanth.
- **Modern History:** *A Brief History of Modern India* by Spectrum (Rajiv Ahir).
- **Geography:** NCERTs (Class 11 & 12) + *Certificate Physical and Human Geography* by GC Leong.
- **Economy:** *Indian Economy* by Sanjiv Verma or Nitin Singhania + Economic Survey & Budget.
- **Current Affairs:** Daily reading of *The Hindu* or *The Indian Express* + Monthly compilation magazines.`;
  }

  // --- 11. STARTUPS & BUSINESS ---
  if (q.includes("startup") || q.includes("start a company") || q.includes("entrepreneur") || q.includes("fundraising")) {
    return `### How to Build & Launch a Scalable Startup in India

---

### 1. Step-by-Step Launch Framework:
1. **Problem Discovery & Validation:**
   - Find a high-friction problem customers actively spend money or time trying to solve.
   - Interview 30-50 prospective users before writing code.
2. **Build a Minimum Viable Product (MVP):**
   - Build a core working version in 2-4 weeks using no-code tools (Webflow, FlutterFlow, Supabase) or lightweight full-stack.
   - Measure retention and customer engagement over vanity signups.
3. **Legal Entity & Government Schemes:**
   - **Incorporate:** Register as a **Private Limited (Pvt Ltd)** company on MCA for equity investments.
   - **Startup India (DPIIT):** Get DPIIT recognition at \`startupindia.gov.in\` for 3-year income tax exemption (Section 80-IAC) and capital gains exemptions.
   - **MSME Udyam Registration:** For collateral-free loans, priority bank credit, and government tenders.

---

### 2. Funding Channels:
- **Bootstrapping:** Grow via customer cash flow.
- **Government Grants:** Startup India Seed Fund Scheme (SISFS - up to ₹20 Lakhs grant, ₹50 Lakhs debt).
- **Angel Investors:** Indian Angel Network (IAN), LetsVenture, Mumbai Angels, Inflection Point Ventures.
- **Venture Capital:** Early-stage VCs (Peak XV, Blume Ventures, India Quotient, Elevation Capital).`;
  }

  // --- 12. DYNAMIC LIVE KNOWLEDGE LOOKUP FOR ANY RANDOM QUESTION ---
  try {
    const searchTerms = rawQuery
      .replace(/[?!.,]/g, "")
      .replace(/^(what is|who is|where is|tell me about|explain|how to|top 10|best|give me)\s+/i, "")
      .trim();

    const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      searchTerms || rawQuery
    )}&utf8=&format=json&origin=*`;

    const searchRes = await fetch(wikiSearchUrl);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const firstHit = searchData?.query?.search?.[0];

      if (firstHit && firstHit.title) {
        const pageTitle = firstHit.title;
        const pageSummaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
        const summaryRes = await fetch(pageSummaryUrl);

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          const extract = summaryData.extract || "";
          const description = summaryData.description || "";

          if (extract.length > 50) {
            return `### ${summaryData.title}${description ? ` — ${description}` : ""}

${extract}

---

### 🔍 Key Insights & Context:
- **Core Topic:** ${summaryData.title}
- **Overview Summary:** ${extract.slice(0, 300)}...
- **Practical Relevance:** Understanding this topic provides essential background for academic, professional, and general knowledge development.

💡 *Ask me any follow-up question or specify what you would like to explore further about ${summaryData.title}!*`;
          }
        }
      }
    }
  } catch (e) {
    console.info("Live knowledge lookup error, using default synthesizer:", e);
  }

  // --- 13. FINAL SYNTHESIZER ---
  const cleanedTitle = rawQuery
    .replace(/[?!.]/g, "")
    .replace(/^(what is|how to|explain|tell me about|guide for|why is)\s+/i, "")
    .trim();
  const formattedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);

  return `### Comprehensive Guide: ${formattedTitle || rawQuery}

---

### 1. Key Concept & Overview:
Understanding **${rawQuery}** requires analyzing its fundamental principles, practical applications, and strategic value in modern education and career development.

---

### 2. Actionable Roadmap & Key Steps:
1. **Foundational Understanding:** Establish your goals, prerequisites, and resource availability.
2. **Structured Execution:** Break your study or execution into measurable weekly milestones.
3. **Practical Application:** Spend 70% of your time on problem-solving, hands-on projects, or mock evaluations.
4. **Review & Optimization:** Seek feedback from mentors, track performance metrics, and adapt continuously.

💡 *Ask me any follow-up question! For example: "Give me a step-by-step 30-day roadmap" or "What are the best books and resources?"*`;
}
