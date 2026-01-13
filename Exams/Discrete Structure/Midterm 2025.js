export const questions = [
  {
    q: "Show that the following compound propositions are logically equivalent using Rules: (p → q) ∧ (p → r) and p → (q ∧ r)",
    options: [
      "To show (p → q) ∧ (p → r) ≡ p → (q ∧ r):\n1. p → (q ∧ r) ≡ ¬p ∨ (q ∧ r)\n2. (¬p ∨ q) ∧ (¬p ∨ r) ≡ ¬p ∨ (q ∧ r) (Distributive Law)\n3. (p → q) ∧ (p → r) ≡ p → (q ∧ r)",
    ],
    correct: 0,
    explanation:
      "Used the Distributive property of logical OR over AND to show the equivalence.",
  },
  {
    q: "Given the premises: 'If I study, I will pass the exam' (S → P) and 'If I pass the exam, I will graduate' (P → G). If I did not graduate (¬G), what can we conclude using rules of inference?",
    options: [
      "Conclusion: I did not study (¬S).\n1. From S → P and P → G, we get S → G (Hypothetical Syllogism).\n2. From S → G and ¬G, we get ¬S (Modus Tollens).",
    ],
    correct: 0,
    explanation:
      "Hypothetical Syllogism establishes the chain, and Modus Tollens confirms the conclusion from the fact that I did not graduate.",
  },
  {
    q: "When proving 'If n² is odd, then n is odd' by contradiction, we start by assuming n² is odd and n is even.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Contradiction assumes the premise is true and the conclusion is false.",
  },
  {
    q: "The contrapositive of 'If n is even, then n² is even' is: 'If n² is odd, then n is odd'.",
    options: ["True", "False"],
    correct: 0,
    explanation: "The contrapositive of p → q is ¬q → ¬p.",
  },
  {
    q: "For f(x) = x² where f: ℝ → ℝ, f is neither injective nor surjective.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "It is not injective (e.g., f(1) = f(-1)) and not surjective (negative numbers are not reached).",
  },
  {
    q: "Translate into logical expressions (Domain 1: students in class; Domain 2: all people): 'Someone in your class can speak Hindi.'",
    options: ["1. ∃x H(x)\n2. ∃x (S(x) ∧ H(x))"],
    correct: 0,
    explanation: "The existential quantifier ∃ is used for 'someone'.",
  },
  {
    q: "Translate into logical expressions (Domain 1: students in class; Domain 2: all people): 'Everyone in your class is friendly.'",
    options: ["1. ∀x F(x)\n2. ∀x (S(x) → F(x))"],
    correct: 0,
    explanation: "The universal quantifier ∀ is used for 'everyone'.",
  },
  {
    q: "Translate into logical expressions (Domain 1: students in class; Domain 2: all people): 'There is a person in your class who was not born in California.'",
    options: ["1. ∃x ¬B(x)\n2. ∃x (S(x) ∧ ¬B(x))"],
    correct: 0,
    explanation: "Negation ¬ is used to indicate 'not born in'.",
  },
  {
    q: "Translate into logical expressions (Domain 1: students in class; Domain 2: all people): 'A student in your class has been in a movie.'",
    options: ["1. ∃x M(x)\n2. ∃x (S(x) ∧ M(x))"],
    correct: 0,
    explanation: "A student implies 'there exists at least one'.",
  },
  {
    q: "Translate into logical expressions (Domain 1: students in class; Domain 2: all people): 'No student in your class has taken a course in logic programming.'",
    options: [
      "1. ¬∃x L(x) (or ∀x ¬L(x))\n2. ¬∃x (S(x) ∧ L(x)) (or ∀x (S(x) → ¬L(x)))",
    ],
    correct: 0,
    explanation:
      "No student can be represented by negating the existential quantifier.",
  },
  {
    q: "If f(x) = x² + 1 and g(x) = x + 2, find (f ∘ g)(1) and (g ∘ f)(1).",
    options: ["(f ∘ g)(1) = 10 and (g ∘ f)(1) = 4"],
    correct: 0,
    explanation: "f(g(1)) = f(3) = 3² + 1 = 10; g(f(1)) = g(2) = 2 + 2 = 4.",
  },
  {
    q: "Find the inverse function of f(x) = x³ + 1.",
    options: ["f⁻¹(x) = ∛(x - 1)"],
    correct: 0,
    explanation: "The inverse is found by switching x and y and solving for y.",
  },
];
