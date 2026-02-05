export const questions = [
  // Question 1
  {
    q: 'Let P(x,y) be the propositional function "x borrowed y\'s textbook", and let M(x) be the propositional function "x is enrolled in a calculus class". Let S be the set of students and L denote the set of library books—all at Riverside College. The domain of discourse of P is S x L, and the domain ofdiscourse of M is S. Write this proposition symbolically: Sarah borrowed someone\'s book from the library.',
    options: ["∃yP(Sarah,y)"],
    correct: 0,
    explanation:
      'Sarah is a specific student in the set S. y represents an element in the set L (library books) [Prompt]. P(Sarah,y) represents the propositional function "Sarah borrowed book y" [Prompt].',
  },
  {
    q: 'Let P(x,y) be the propositional function "x borrowed y\'s textbook", and let M(x) be the propositional function "x is enrolled in a calculus class". Let S be the set of students and L denote the set of library books—all at Riverside College. The domain of discourse of P is S x L, and the domain ofdiscourse of M is S. Write this proposition symbolically: No one borrowed the Advanced Algebra textbook.',
    options: [
      "∀x¬P(x,Advanced Algebra textbook) or ¬∃xP(x,Advanced Algebra textbook)",
    ],
    correct: 0,
    explanation:
      'No one: This indicates a negation of the existential quantifier or a universal quantification of a negation. The domain for "no one" (students) is the set S [Prompt]. The Advanced Algebra textbook: This refers to a specific element within the set of library books L [Prompt].',
  },
  {
    q: 'Let P(x,y) be the propositional function "x borrowed y\'s textbook", and let M(x) be the propositional function "x is enrolled in a calculus class". Let S be the set of students and L denote the set of library books—all at Riverside College. The domain of discourse of P is S x L, and the domain ofdiscourse of M is S. Write this proposition symbolically: Every calculus student borrowed someone\'s book from the library.',
    options: ["∀x(M(x)→∃yP(x,y))"],
    correct: 0,
    explanation:
      '∀x: Denotes "Every student" within the domain S [Prompt, 13]. M(x)→: Restricts the statement to those enrolled in calculus. ∃yP(x,y): Expresses that there exists at least one book y in the library set L that the student borrowed [Prompt, 13, 134].',
  },
  {
    q: 'Let P(x,y) be the propositional function "x borrowed y\'s textbook", and let M(x) be the propositional function "x is enrolled in a calculus class". Let S be the set of students and L denote the set of library books—all at Riverside College. The domain of discourse of P is S x L, and the domain ofdiscourse of M is S. Write this proposition symbolically: Every library book was borrowed by at least one student.',
    options: ["∀y∃xP(x,y)"],
    correct: 0,
    explanation:
      '∀y: Represents "Every library book" within the domain L. ∃x: Represents "at least one student" within the domain S. P(x,y): The propositional function indicating that student x borrowed book y. Structure: This nested quantification expresses that for every book in the library, there is at least one student who borrowed it',
  },
  {
    q: "Prove by Contraposition that if n is an integer and n³ + 5 is odd, then n is even.",
    options: [
      "Assume n is odd (not even). Then n = 2k + 1 for some integer k. n³ = (2k + 1)³ = 8k³ + 12k² + 6k + 1 = even + 1 = odd. Then n³ + 5 = odd + odd = even. Thus, if n is odd, n³ + 5 is even (not odd). This is the contrapositive.",
    ],
    correct: 0,
    explanation:
      "The contrapositive of 'if P then Q' is 'if not Q then not P'. Here P: n³ + 5 odd, Q: n even. Contrapositive: if n odd, then n³ + 5 even. Shown by direct proof.",
  },
  {
    q: "Show that the following compound propositions are logically equivalent using the Rules: ((p ∨ q) → ¬a) ≡ (a → (¬q ∧ ¬p))",
    options: [
      "Left side: (p ∨ q) → ¬a = ¬(p ∨ q) ∨ ¬a (implication equivalence) = (¬p ∧ ¬q) ∨ ¬a (De Morgan). Right side: a → (¬q ∧ ¬p) = ¬a ∨ (¬q ∧ ¬p) (implication) = ¬a ∨ (¬p ∧ ¬q) (commutative). Both sides equal.",
    ],
    correct: 0,
    explanation:
      "Using logical equivalences like implication law and De Morgan's laws.",
  },

  // Question 2
  {
    q: 'Show that the premises: i. "If Jo has a bacterial infection, she will take antibiotics." ii. "Jo gets a stomach ache when and only when she takes antibiotics and doesn\'t eat yogurt." iii. "Jo has a bacterial infection." iv. "Jo doesn\'t eat yogurt." Using rules of inference and logical equivalence to conclude "Jo gets a stomach ache.".',
    options: [
      "Let B: Jo has bacterial infection, A: takes antibiotics, S: gets stomach ache, Y: eats yogurt. Premises: B → A, S ↔ (A ∧ ¬Y), B, ¬Y. From B and B → A: A (modus ponens). From A and ¬Y: A ∧ ¬Y (conjunction). From A ∧ ¬Y and S ↔ (A ∧ ¬Y): S (biconditional elimination).",
    ],
    correct: 0,
    explanation: "Step-by-step application of rules of inference.",
  },
  {
    q: "∅ ∈ {∅}",
    options: ["True", "False"],
    correct: 0,
    explanation: "The set {∅} contains the empty set as its only element.",
  },
  {
    q: "{∅} ⊂ ∅",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "The empty set has no elements, so {∅} (which has one element) is not a subset.",
  },
  {
    q: "∅ ∈ {∅}",
    options: ["True", "False"],
    correct: 0,
    explanation: "Same as statement 1; the empty set is an element of {∅}.",
  },
  {
    q: "{∅} ⊂ {∅, {∅}}",
    options: ["True", "False"],
    correct: 0,
    explanation: "Every element of {∅} (which is ∅) is in {∅, {∅}}.",
  },
  {
    q: "{x} ⊆ {x}",
    options: ["True", "False"],
    correct: 0,
    explanation: "Every set is a subset of itself.",
  },

  // Question 3
  {
    q: "Determine whether the following function is a bijection from ℝ to ℝ: f(x) = (x² + 1)/(x² + 2)",
    options: ["No"],
    correct: 0,
    explanation:
      "Not injective: f(x) = f(-x) for all x, but x ≠ -x for x ≠ 0. Not surjective: range is [1/2, 1), not all ℝ.",
  },
  {
    q: "Question 3 B. What is the set A if 𝒫(A) = {∅, {∅}, {∅, {∅}}}",
    options: ["A = {∅, {∅}}"],
    correct: 0,
    explanation:
      "The power set has subsets ∅, {∅}, {{∅}}, {∅, {∅}}, where {{∅}} is the same as {∅, {∅}} in notation consistency.",
  },
];
