export const questions = [
  {
    // Question based on basic concepts of Data and Information
    q: "Which of the following describes 'Data' according to the information concepts hierarchy?",
    options: [
      "Processed data with contextual meaning",
      "Knowledge that has an evaluative component",
      "Raw facts with no contextual meaning",
      "Collective information gained through expertise",
    ],
    correct: 2,
    explanation:
      "According to the sources, **Data** represents raw facts, while **Information** is processed data with contextual meaning that tells us 'who', 'what', 'where', and 'when'.",
  },
  {
    // Question regarding the characteristics of valuable information
    q: "The 'economical' characteristic of valuable information means it is expensive to produce.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "Information being **economical** means it should be **cost-effective to produce**, meaning its value should exceed the cost of producing it, rather than simply being expensive.",
  },
  {
    // Question on the SDLC phases
    q: "During which phase of the Software Development Life Cycle (SDLC) is logical work converted into physical designs such as database and UI/UX designs?",
    options: [
      "Requirement Gathering & Analysis",
      "Design",
      "Implementation",
      "Maintenance",
    ],
    correct: 1,
    explanation:
      "In the **Design** phase, architects and designers map requirements to architecture, database, UI/UX, and API designs, converting the **logical into the physical**.",
  },
  {
    // Question regarding Agile values
    q: "According to Agile values, what is prioritized over 'following a plan'?",
    options: [
      "Contract negotiation",
      "Processes and tools",
      "Comprehensive documentation",
      "Responding to change",
    ],
    correct: 3,
    explanation:
      "The Agile manifesto prioritizes **responding to change** over following a plan, as well as prioritizing individuals/interactions, working software, and customer collaboration over their traditional counterparts.",
  },
  {
    // Question on Valuing Information Systems
    q: "Which method of valuing Information Systems involves doing things 'better' by transforming raw data into meaningful insights for decision-making?",
    options: ["Automating", "Informating", "Strategizing", "Processing"],
    correct: 1,
    explanation:
      "**Informating** refers to generating and publishing information throughout the organization to provide insights, whereas **Automating** focuses on doing things faster and **Strategizing** focuses on doing things smarter.",
  },
  {
    // Question on E-commerce vs. E-business
    q: "E-business is narrower in scope than E-commerce because it only focuses on online transactions.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. **E-business** is broader because it encompasses all business activities conducted online, including **internal operations** like CRM and ERP, whereas **E-commerce** specifically focuses on digitally enabled commercial transactions between organizations and individuals.",
  },
  {
    // Question on Security Threats
    q: "Which security threat involves a hacker trying to guess a password by automatically trying every possible combination until one works?",
    options: [
      "Phishing",
      "Man-in-the-Middle (MITM)",
      "Brute Force Attack",
      "SQL Injection",
    ],
    correct: 2,
    explanation:
      "A **Brute Force Attack** occurs when a hacker uses automated tools to guess a password or encryption key by trying every possible combination.",
  },
  {
    // Question on Process Modeling/DFDs
    q: "A Context Diagram, the highest level of a Data Flow Diagram (DFD), should always show the internal Data Stores of the system.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. A **Context Diagram** defines system scope and boundary; it typically shows only one process and external entities, but **does not show Data Stores**, which are considered internal to the system.",
  },
  {
    // Question on Database Architecture
    q: "In the Three-Schema Architecture, which layer describes 'what' data is stored in the database and the relationships among that data while hiding physical storage details?",
    options: [
      "Internal (Physical) Level",
      "Conceptual (Logical) Level",
      "External (View) Level",
      "Data Manipulation Level",
    ],
    correct: 1,
    explanation:
      "The **Conceptual Layer** describes the community view of the database (entities and relationships), while the **Internal Layer** handles physical storage and the **External Layer** provides specific views for different users.",
  },
  {
    // Question on ERD Cardinality
    q: "Which cardinality ratio describes a relationship where an entity in A is associated with any number of entities in B, but an entity in B is associated with at most one entity in A?",
    options: [
      "One-to-One (1:1)",
      "Many-to-Many (M:N)",
      "One-to-Many (1:N)",
      "Unary Relationship",
    ],
    correct: 2,
    explanation:
      "This describes a **One-to-Many (1:N)** relationship. An example provided in the sources is a Department having multiple Employees.",
  },
];
