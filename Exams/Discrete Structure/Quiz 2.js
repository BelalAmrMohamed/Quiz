export const questions = [
  {
    q: "Which expression represents: 'There is a computer on the network that has not received a virus from any other computer'?",
    options: [
      "∃x (C(x) ∧ ∀y (¬V(x, y)))",
      "∃x (C(x) → ∀y (¬V(x, y)))",
      "∀x (C(x) ∧ ∃y (¬V(x, y)))",
      "∃x ∀y (C(x) ∧ ¬V(x, y))",
    ],
    correct: 0,
    explanation:
      "We need a computer x that is connected to the network AND has not received a virus from any computer y. This is correctly expressed using ∃x with C(x) ∧ ∀y ¬V(x,y).",
  },
  {
    q: "What does the statement ∃x (L(x, Logic) ∧ ∀y ((y ≠ x) → ¬L(y, Logic))) mean?",
    options: [
      "Everyone loves Logic except one person.",
      "Someone loves Logic and Logic loves no one.",
      "Exactly one person loves Logic.",
      "There is a person who loves only Logic.",
    ],
    correct: 2,
    explanation:
      "The statement says there exists one person x who loves Logic, and no one else does. This is the definition of exactly one.",
  },
  {
    q: "Express 'The sum of two positive integers is always positive' using quantifiers over ℤ.",
    options: [
      "∀x ∀y (x > 0 ∧ y > 0 ∧ (x + y > 0))",
      "∃x ∃y ((x > 0 ∧ y > 0) → (x + y > 0))",
      "∀x ∀y ((x > 0 ∧ y > 0) → (x + y > 0))",
      "∀x ∃y ((x > 0 ∧ y > 0) → (x + y > 0))",
    ],
    correct: 2,
    explanation:
      "The statement must hold for all integers x and y, and positivity of the sum is conditional on both being positive.",
  },
  {
    q: "Which statement is logically equivalent to ¬∃x ∀y (P(x) ∨ P(y))?",
    options: [
      "∀x ∃y (¬P(x) ∨ ¬P(y))",
      "∀x ∃y (¬P(x) ∧ ¬P(y))",
      "∃x ∀y (¬P(x) ∧ ¬P(y))",
      "∀x ∀y (¬P(x) ∧ ¬P(y))",
    ],
    correct: 0,
    explanation:
      "Negating ∃x∀y applies De Morgan’s laws, resulting in ∀x∃y with negation of the inner disjunction.",
  },
  {
    q: "Translate: 'No one works for every company.'",
    options: [
      "∀x ∀y ¬W(x, y)",
      "¬∃x ∀y W(x, y)",
      "∀y ∃x ¬W(x, y)",
      "∀x ∃y W(x, y)",
    ],
    correct: 1,
    explanation:
      "The statement means there does not exist a person who works for all companies.",
  },
  {
    q: "Which rule of inference derives q ∨ r from p ∨ q and ¬p ∨ r?",
    options: [
      "Disjunctive Syllogism",
      "Hypothetical Syllogism",
      "Resolution",
      "Modus Ponens",
    ],
    correct: 2,
    explanation:
      "Resolution combines two disjunctions by eliminating complementary literals (p and ¬p).",
  },
  {
    q: "Given ∀x(P(x) → Q(x)) and P(c), which rule justifies Q(c)?",
    options: [
      "Universal Generalization",
      "Universal Instantiation followed by Modus Ponens",
      "Existential Instantiation",
      "Hypothetical Syllogism",
    ],
    correct: 1,
    explanation:
      "First instantiate the universal statement for c, then apply Modus Ponens.",
  },
  {
    q: "What valid conclusion follows from (p ∧ q) → r and ¬r?",
    options: ["¬p", "¬q", "¬p ∧ ¬q", "¬p ∨ ¬q"],
    correct: 3,
    explanation:
      "By Modus Tollens on a conjunction, at least one of p or q must be false.",
  },
  {
    q: "Identify Rule X and Rule Y in the logical steps provided.",
    options: [
      "X: Universal Generalization, Y: Modus Ponens",
      "X: Universal Instantiation, Y: Modus Tollens",
      "X: Existential Instantiation, Y: Modus Tollens",
      "X: Universal Instantiation, Y: Disjunctive Syllogism",
    ],
    correct: 1,
    explanation:
      "The universal statement is instantiated for a, then Modus Tollens is applied.",
  },
  {
    q: "Which rule of inference is used in the detective's reasoning?",
    options: [
      "Modus Ponens",
      "Modus Tollens",
      "Disjunctive Syllogism",
      "Hypothetical Syllogism",
    ],
    correct: 1,
    explanation:
      "The argument denies the consequent to deny the antecedent, which is Modus Tollens.",
  },
  {
    q: "When proving by contraposition that if n² is odd then n is odd, what is the correct initial assumption?",
    options: [
      "Assume n is odd",
      "Assume n² is even",
      "Assume n is even",
      "Assume n is odd and n² is even",
    ],
    correct: 1,
    explanation:
      "Contraposition starts by assuming the negation of the conclusion: n² is even.",
  },
  {
    q: "What is the logical structure of the proof attempt for (P ∧ Q) → R?",
    options: [
      "Direct Proof",
      "Proof by Contraposition",
      "Proof by Contradiction",
      "Proof by Cases",
    ],
    correct: 1,
    explanation:
      "The proof assumes ¬R and derives ¬P ∨ ¬Q, which is the contrapositive.",
  },
  {
    q: "What is the negation of: 'There is a student who has taken every course offered'?",
    options: [
      "Every student has taken every course.",
      "There is a student who has not taken any course.",
      "For every student, there is a course they have not taken.",
      "No student has taken any course.",
    ],
    correct: 2,
    explanation: "Negating ∃x∀y becomes ∀x∃y with negation of the predicate.",
  },
  {
    q: "Which symbolizes 'Only fast vehicles are cars'?",
    options: [
      "∀x(C(x) → F(x))",
      "∀x(F(x) → C(x))",
      "∀x(C(x) ↔ F(x))",
      "∃x(C(x) ∧ F(x))",
    ],
    correct: 0,
    explanation:
      "'Only fast vehicles are cars' means if something is a car, then it is fast.",
  },
  {
    q: "What is the symbolic form of 'Not all doctors work in hospitals'?",
    options: [
      "∀x(D(x) → ¬H(x))",
      "∃x(D(x) ∧ ¬H(x))",
      "¬∀x(D(x) → H(x))",
      "Both b and c",
    ],
    correct: 3,
    explanation:
      "Both expressions correctly negate 'all doctors work in hospitals'.",
  },
  {
    q: "What does ∃x(P(x) ∧ Q(x)) mean in English?",
    options: [
      "All students study hard",
      "Some students study hard",
      "No students study hard",
      "All students don't study hard",
    ],
    correct: 1,
    explanation:
      "The existential quantifier means at least one student studies hard.",
  },
  {
    q: "What is the meaning of ∀x∃y P(x,y)?",
    options: [
      "For every x, there is some y that is greater than x",
      "For every x, there is some y that x is greater than",
      "There exists an x greater than all y",
      "There exists a y greater than all x",
    ],
    correct: 1,
    explanation: "The statement says each x has some y such that x > y.",
  },
  {
    q: "Which represents 'All prime numbers except 2 are odd'?",
    options: [
      "∀x(P(x) → Q(x))",
      "∀x(P(x) ∧ Q(x))",
      "∀x(P(x) → Q(x)) ∨ x = 2",
      "∀x((P(x) ∧ x ≠ 2) → Q(x))",
    ],
    correct: 3,
    explanation: "The condition explicitly excludes 2 from the implication.",
  },
  {
    q: "What is the logical equivalent of ¬∀x(P(x) → Q(x))?",
    options: [
      "Everyone speaks French and knows Python.",
      "There is someone who speaks French but does not know Python.",
      "There is someone who does not speak French and knows Python.",
      "Everyone who knows Python does not speak French.",
    ],
    correct: 1,
    explanation:
      "Negating a universal implication results in an existential with true antecedent and false consequent.",
  },
  {
    q: "Translating 'Unless you work hard, you will not succeed' into logic gives:",
    options: ["¬W → ¬S", "W → S", "¬S → ¬W", "¬W ∧ ¬S"],
    correct: 1,
    explanation:
      "The phrase 'unless' translates to an implication: if you work hard, you succeed.",
  },
];
