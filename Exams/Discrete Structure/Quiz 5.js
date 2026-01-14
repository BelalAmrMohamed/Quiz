export const questions = [
  {
    q: "To show specifications are inconsistent, what must we show?",
    options: [
      "They lead to a contradiction",
      "They are all false",
      "They are all true",
      "They use different variables",
    ],
    correct: 0,
    explanation:
      "If specifications lead to a contradiction (a situation that cannot be true), they are logically inconsistent.",
  },
  {
    q: "What does the output of an OR gate equal when both inputs are 0?",
    options: ["0", "1", "Undefined", "Error"],
    correct: 0,
    explanation:
      "In an OR gate, the output is only 0 (False) if all inputs are 0.",
  },
  {
    q: "What does the output of a NAND gate equal when both inputs are 1?",
    options: ["0", "1", "Undefined", "Same as inputs"],
    correct: 0,
    explanation:
      "NAND is 'Not AND'. If inputs are 1 and 1, AND is 1, so NAND flips it to 0.",
  },
  {
    q: "What does the output of a NOR gate equal when both inputs are 0?",
    options: ["1", "0", "Undefined", "Error"],
    correct: 0,
    explanation:
      "NOR is 'Not OR'. If inputs are 0 and 0, OR is 0, so NOR flips it to 1.",
  },
  {
    q: "What is the bitwise AND of 1101 and 1011?",
    options: ["1001", "1111", "0110", "1101"],
    correct: 0,
    explanation:
      "Compare bit by bit: 1&1=1, 1&0=0, 0&1=0, 1&1=1. Result: 1001.",
  },
  {
    q: "What is the bitwise OR of 1100 and 0110?",
    options: ["1110", "0100", "1010", "0010"],
    correct: 0,
    explanation:
      "Compare bit by bit: 1|0=1, 1|1=1, 0|1=1, 0|0=0. Result: 1110.",
  },
  {
    q: "What is the bitwise XOR of 1111 and 0000?",
    options: ["1111", "0000", "1010", "0101"],
    correct: 0,
    explanation:
      "XOR results in 1 if bits are different. Here, every position differs (1 vs 0), so all result in 1.",
  },
  {
    q: "In predicate logic, what is a predicate?",
    options: [
      "A property that can be true or false for elements in a domain",
      "A true statement",
      "A quantifier",
      "A logical operator",
    ],
    correct: 0,
    explanation:
      "A predicate refers to a property that depends on variables (like 'x is greater than 5').",
  },
  {
    q: "What is the domain of discourse?",
    options: [
      "The set of all possible values for variables",
      "The set of all propositions",
      "The set of all quantifiers",
      "The set of all predicates",
    ],
    correct: 0,
    explanation:
      "The domain of discourse defines the specific set of values (like integers or real numbers) that a variable can represent.",
  },
  {
    q: "If P(x) is 'x > 5' and the domain is integers, is P(3) true?",
    options: ["False", "True", "Undefined", "Depends on context"],
    correct: 0,
    explanation: "Replacing x with 3 gives '3 > 5', which is False.",
  },
  {
    q: "To translate 'No students failed the exam' into predicate logic (domain: all students), which is correct?",
    options: ["¬∃x F(x) or ∀x ¬F(x)", "∃x ¬F(x)", "∀x F(x)", "∃x F(x)"],
    correct: 0,
    explanation:
      "'No student failed' is equivalent to saying 'It is not the case that there exists a student who failed' (¬∃x F(x)).",
  },
  {
    q: "How would you express 'At least two elements satisfy P(x)'?",
    options: [
      "∃x ∃y (x ≠ y ∧ P(x) ∧ P(y))",
      "∃x P(x)",
      "∀x ∀y P(x)",
      "∃x (P(x) ∧ P(x))",
    ],
    correct: 0,
    explanation:
      "You need to find two distinct variables (x ≠ y) where both satisfy the predicate P.",
  },
  {
    q: "What is the negation of ∀x ∃y (x + y = 0)?",
    options: [
      "∃x ∀y (x + y ≠ 0)",
      "∃x ∃y (x + y ≠ 0)",
      "∀x ∀y (x + y ≠ 0)",
      "∀x ∃y (x + y ≠ 0)",
    ],
    correct: 0,
    explanation:
      "By De Morgan's laws for quantifiers, you flip ∀ to ∃, ∃ to ∀, and negate the inner statement.",
  },
  {
    q: "Which statement correctly expresses 'The sum of two positive integers is always positive'?",
    options: [
      "∀x ∀y ((x > 0 ∧ y > 0) → (x + y > 0))",
      "∃x ∃y ((x > 0 ∧ y > 0) → (x + y > 0))",
      "∀x ∀y (x + y > 0)",
      "∃x ∀y ((x > 0 ∧ y > 0) → (x + y > 0))",
    ],
    correct: 0,
    explanation:
      "This uses universal quantifiers (always) and an implication (if x and y are positive, then sum is positive).",
  },
  {
    q: "What is the primary purpose of studying discrete structures in computer science?",
    options: [
      "To develop mathematical foundations for CS applications",
      "To learn programming languages",
      "To design hardware only",
      "To study continuous mathematics",
    ],
    correct: 0,
    explanation:
      "Discrete structures provide the essential logic, set theory, and graph theory used to build algorithms and data structures.",
  },
  {
    q: "Which of the following courses directly uses concepts from discrete structures?",
    options: [
      "Data Structures, Algorithms, and Databases",
      "Only programming courses",
      "Only hardware courses",
      "Physical education",
    ],
    correct: 0,
    explanation:
      "These core CS subjects rely on discrete math concepts like logic, graphs, and sets.",
  },
  {
    q: "What does the absorption law p ∧ (p ∨ q) simplify to?",
    options: ["p", "q", "p ∨ q", "p ∧ q"],
    correct: 0,
    explanation:
      "The Absorption Law states that p ∧ (p ∨ q) is logically equivalent to just p.",
  },
  {
    q: "If the domain is all real numbers and P(x) is 'x² ≥ 0', what is the truth value of ∀x P(x)?",
    options: ["True", "False", "Unknown", "Undefined"],
    correct: 0,
    explanation:
      "The square of any real number is always non-negative, so the statement is True.",
  },
  {
    q: "If the domain is integers and P(x) is 'x² = 2', what is the truth value of ∃x P(x)?",
    options: ["False", "True", "Unknown", "Undefined"],
    correct: 0,
    explanation:
      "There is no integer that, when squared, equals 2 (the root is irrational), so this is False.",
  },
  {
    q: "What is the result of applying the distributive law to p ∨ (q ∧ r)?",
    options: [
      "(p ∨ q) ∧ (p ∨ r)",
      "(p ∧ q) ∨ (p ∧ r)",
      "p ∧ q ∧ r",
      "p ∨ q ∨ r",
    ],
    correct: 0,
    explanation: "Distributing OR over AND results in (p OR q) AND (p OR r).",
  },
  {
    q: "In Boolean algebra, what is p ∧ T equivalent to?",
    options: ["p", "T", "F", "¬p"],
    correct: 0,
    explanation:
      "Identity Law: ANDing any value with True results in the original value.",
  },
  {
    q: "In Boolean algebra, what is p ∨ T equivalent to?",
    options: ["T", "p", "F", "¬p"],
    correct: 0,
    explanation:
      "Domination Law: ORing any value with True always results in True.",
  },
  {
    q: "What logical equivalence allows us to rewrite ¬(p → q)?",
    options: [
      "¬(p → q) ≡ p ∧ ¬q",
      "¬(p → q) ≡ ¬p ∨ q",
      "¬(p → q) ≡ p ∨ ¬q",
      "¬(p → q) ≡ ¬p ∧ q",
    ],
    correct: 0,
    explanation:
      "An implication is only false if the hypothesis (p) is true and the conclusion (q) is false.",
  },
  {
    q: "To prove a statement of the form ∃x ∀y P(x,y), what approach is most direct?",
    options: [
      "Find a specific value for x, then prove P(x,y) for all y",
      "Prove it for all x and y",
      "Find specific values for both x and y",
      "Use proof by contradiction",
    ],
    correct: 0,
    explanation:
      "You need to find one 'witness' x that works universally for every possible y.",
  },
  {
    q: "What is the negation of (p ∧ q) → r?",
    options: ["(p ∧ q) ∧ ¬r", "(p ∨ q) → ¬r", "¬(p ∧ q) ∨ r", "(p ∧ q) ∨ ¬r"],
    correct: 0,
    explanation:
      "The negation of A → B is A ∧ ¬B. Here, A is (p ∧ q) and B is r.",
  },
  {
    q: "Which statement about predicates is correct?",
    options: [
      "A predicate becomes a proposition when all variables are assigned values",
      "A predicate is always a proposition",
      "A predicate cannot contain variables",
      "A predicate has no truth value",
    ],
    correct: 0,
    explanation:
      "A predicate is a template; it only becomes a true/false proposition once specific values are plugged in.",
  },
  {
    q: "If P(x,y) is 'x + y = 10' with domain being positive integers, what is the truth value of ∃x ∃y P(x,y)?",
    options: ["True (e.g., x=3, y=7)", "False", "Unknown", "Depends on order"],
    correct: 0,
    explanation:
      "Since there exist integers (like 3 and 7) that sum to 10, the statement is True.",
  },
  {
    q: "What is the converse of 'If it snows, then school is cancelled'?",
    options: [
      "If school is cancelled, then it snows",
      "If it doesn't snow, then school is not cancelled",
      "If school is not cancelled, then it doesn't snow",
      "It snows and school is cancelled",
    ],
    correct: 0,
    explanation:
      "The converse swaps the hypothesis and the conclusion (q → p).",
  },
  {
    q: "What is the inverse of 'If you study, then you pass'?",
    options: [
      "If you don't study, then you don't pass",
      "If you pass, then you study",
      "If you don't pass, then you don't study",
      "You study and you pass",
    ],
    correct: 0,
    explanation:
      "The inverse negates both the hypothesis and the conclusion (¬p → ¬q).",
  },
  {
    q: "Which two forms of a conditional are logically equivalent?",
    options: [
      "A conditional and its contrapositive",
      "A conditional and its converse",
      "A conditional and its inverse",
      "Converse and inverse",
    ],
    correct: 0,
    explanation:
      "A statement (p → q) is always logically equivalent to its contrapositive (¬q → ¬p).",
  },
  {
    q: "Are the converse and inverse of a conditional logically equivalent?",
    options: [
      "Yes, they are equivalent to each other",
      "No, never",
      "Only sometimes",
      "Only when the original is true",
    ],
    correct: 0,
    explanation:
      "The inverse is the contrapositive of the converse, making them logically equivalent to each other.",
  },
  {
    q: "In a truth table with 3 propositional variables, how many rows are needed?",
    options: ["8", "6", "9", "3"],
    correct: 0,
    explanation: "The number of rows is 2^n. For n=3, 2^3 = 8.",
  },
  {
    q: "In a truth table with n propositional variables, how many rows are needed?",
    options: ["2^n", "n^2", "2n", "n!"],
    correct: 0,
    explanation:
      "Each variable has 2 states (T/F), so for n variables, there are 2^n combinations.",
  },
  {
    q: "What type of proof would you use to prove 'There exists an irrational number'?",
    options: [
      "Constructive existence proof (show an example like √2)",
      "Proof by contraposition",
      "Vacuous proof",
      "Trivial proof",
    ],
    correct: 0,
    explanation:
      "A constructive proof demonstrates existence by pointing to a specific example, such as the square root of 2.",
  },
  {
    q: "What does the statement ∀x ∀y (x + y = y + x) express?",
    options: [
      "Addition is commutative",
      "Addition is associative",
      "Addition has an identity",
      "Addition is distributive",
    ],
    correct: 0,
    explanation:
      "The commutative property states that the order of operands does not change the result.",
  },
  {
    q: "How would you translate 'Not all birds can fly' into predicate logic?",
    options: [
      "¬∀x F(x) or equivalently ∃x ¬F(x)",
      "∀x ¬F(x)",
      "¬∃x F(x)",
      "∃x F(x)",
    ],
    correct: 0,
    explanation:
      "'Not all' means it is false that every bird flies, which implies there exists at least one bird that does not fly.",
  },
  {
    q: "What is meant by a 'valid argument'?",
    options: [
      "If all premises are true, then the conclusion must be true",
      "The conclusion is always true",
      "All premises are true",
      "The argument looks reasonable",
    ],
    correct: 0,
    explanation:
      "Validity refers to the logical structure: if the starting points are true, the result is guaranteed to be true.",
  },
  {
    q: "Can a valid argument have a false conclusion?",
    options: [
      "Yes, if at least one premise is false",
      "No, never",
      "Only in propositional logic",
      "Only in predicate logic",
    ],
    correct: 0,
    explanation:
      "Yes. Validity only preserves truth. If you start with false premises (garbage in), you may get a false conclusion (garbage out).",
  },
  {
    q: "What is a sound argument?",
    options: [
      "A valid argument with all true premises",
      "Any valid argument",
      "An argument that sounds convincing",
      "An invalid argument",
    ],
    correct: 0,
    explanation:
      "Soundness is the 'gold standard': the logic is valid AND the starting premises are actually true.",
  },
  {
    q: "In the resolution rule, from (p ∨ q) and (¬p ∨ r), what can we conclude?",
    options: ["q ∨ r", "p ∨ r", "q ∧ r", "¬q ∨ r"],
    correct: 0,
    explanation:
      "The variable 'p' appears in positive and negative forms, essentially cancelling out, leaving 'q OR r'.",
  },
  {
    q: "What does the law of excluded middle state?",
    options: [
      "p ∨ ¬p is always true",
      "p ∧ ¬p is always false",
      "p → ¬p is false",
      "¬p → p is true",
    ],
    correct: 0,
    explanation:
      "This law states that a proposition must be either True or False; there is no middle ground.",
  },
  {
    q: "What is the law of non-contradiction?",
    options: [
      "p ∧ ¬p is always false",
      "p ∨ ¬p is always true",
      "p → p is true",
      "¬¬p ≡ p",
    ],
    correct: 0,
    explanation:
      "This law states that a proposition cannot be both True and False at the same time.",
  },
  {
    q: "If we want to prove 'For all even integers n, n² is even', which method is most straightforward?",
    options: [
      "Direct proof",
      "Proof by contraposition",
      "Proof by contradiction",
      "Vacuous proof",
    ],
    correct: 0,
    explanation:
      "A direct proof works best: assume n is even (n=2k), then square it to show the result is also a multiple of 2.",
  },
  {
    q: "To prove an 'if and only if' statement p ↔ q, what must we prove?",
    options: [
      "Both p → q and q → p",
      "Only p → q",
      "Only q → p",
      "Either p → q or q → p",
    ],
    correct: 0,
    explanation:
      "Biconditional statements require proving the implication in both directions.",
  },
  {
    q: "What is the scope of a quantifier?",
    options: [
      "The part of the logical expression where the quantifier applies",
      "The entire statement",
      "Just the variable",
      "The domain only",
    ],
    correct: 0,
    explanation:
      "The scope is the specific section of the formula that the quantifier binds or controls.",
  },
  {
    q: "In ∀x (P(x) → Q(x)), what is the scope of ∀x?",
    options: ["(P(x) → Q(x))", "P(x) only", "Q(x) only", "The entire universe"],
    correct: 0,
    explanation:
      "The parentheses indicate that the quantifier applies to the entire implication P(x) → Q(x).",
  },
  {
    q: "What does a bound variable mean?",
    options: [
      "A variable that appears within the scope of a quantifier",
      "A variable with no quantifier",
      "A constant",
      "A proposition",
    ],
    correct: 0,
    explanation:
      "A variable is 'bound' if it is attached to a quantifier like ∀ or ∃.",
  },
  {
    q: "What does a free variable mean?",
    options: [
      "A variable not bound by any quantifier",
      "A variable bound by ∀",
      "A variable bound by ∃",
      "Any variable",
    ],
    correct: 0,
    explanation:
      "A variable is 'free' if it is not restricted or defined by a quantifier in the expression.",
  },
  {
    q: "In the expression ∀x P(x,y), which variable is free?",
    options: ["y", "x", "Both x and y", "Neither"],
    correct: 0,
    explanation:
      "x is bound by the quantifier ∀x, leaving y as the free variable.",
  },
  {
    q: "In the expression ∃x ∀y P(x,y,z), which variable(s) is/are free?",
    options: ["z only", "x and y", "x only", "All variables"],
    correct: 0,
    explanation:
      "x and y are bound by quantifiers, leaving z as the only free variable.",
  },
  {
    q: "What does it mean for specifications to be complete?",
    options: [
      "They specify all necessary system requirements",
      "They are consistent",
      "They contain no contradictions",
      "They use all variables",
    ],
    correct: 0,
    explanation:
      "Completeness means the specifications cover all required aspects of the system without leaving anything undefined.",
  },
  {
    q: "In logic circuits, what is a combinatorial circuit?",
    options: [
      "A circuit whose output depends only on current inputs",
      "A circuit with memory",
      "A circuit with feedback",
      "A sequential circuit",
    ],
    correct: 0,
    explanation:
      "Combinatorial circuits have no memory; their output is determined purely by the current state of inputs.",
  },
  {
    q: "How many basic logic gates are mentioned in the course?",
    options: [
      "3 (NOT, AND, OR)",
      "2 (AND, OR)",
      "4 (NOT, AND, OR, XOR)",
      "5 (NOT, AND, OR, NAND, NOR)",
    ],
    correct: 0,
    explanation:
      "The fundamental building blocks are usually NOT, AND, and OR.",
  },
  {
    q: "What is the output of XOR gate when inputs are different?",
    options: ["1 (True)", "0 (False)", "Undefined", "Same as first input"],
    correct: 0,
    explanation:
      "XOR (Exclusive OR) outputs True only when the inputs differ from each other.",
  },
  {
    q: "What is the output of XOR gate when inputs are the same?",
    options: ["0 (False)", "1 (True)", "Undefined", "Error"],
    correct: 0,
    explanation:
      "If both inputs are the same (both 0 or both 1), XOR outputs False.",
  },
  {
    q: "In Boolean searches, what does the AND operator do?",
    options: [
      "Narrows the search (both terms must appear)",
      "Broadens the search",
      "Excludes results",
      "Finds exact matches",
    ],
    correct: 0,
    explanation:
      "AND requires all conditions to be met, which reduces the number of matching results.",
  },
  {
    q: "In Boolean searches, what does the OR operator do?",
    options: [
      "Broadens the search (either term can appear)",
      "Narrows the search",
      "Excludes results",
      "Finds exact phrases",
    ],
    correct: 0,
    explanation:
      "OR allows any of the conditions to be met, increasing the number of matching results.",
  },
  {
    q: "What is the purpose of using logical equivalences in proofs?",
    options: [
      "To simplify expressions and transform them into equivalent forms",
      "To make proofs longer",
      "To add complexity",
      "To avoid using truth tables",
    ],
    correct: 0,
    explanation:
      "Equivalences act like algebraic rules, allowing you to rewrite complex logic into simpler, easier-to-prove forms.",
  },
  {
    q: "Can we prove a tautology is true using a truth table?",
    options: [
      "Yes, by showing it's true for all truth value assignments",
      "No, never",
      "Only for simple tautologies",
      "Only with 2 variables",
    ],
    correct: 0,
    explanation:
      "A truth table exhausts all possible combinations; if the result is always True, it proves the statement is a tautology.",
  },
  {
    q: "What does ∀x (x² ≥ x) mean when the domain is real numbers?",
    options: [
      "For all real numbers x, x² is greater than or equal to x",
      "Some x satisfies x² ≥ x",
      "No x satisfies x² ≥ x",
      "x² is always greater than x",
    ],
    correct: 0,
    explanation:
      "The symbol ∀x means 'for all x', so it translates directly to 'For all real numbers x...'.",
  },
  {
    q: "Is the statement ∀x (x² ≥ x) true when the domain is real numbers?",
    options: [
      "False (counterexample: x = 0.5, since 0.25 < 0.5)",
      "True",
      "Unknown",
      "Undefined",
    ],
    correct: 0,
    explanation:
      "It is false because fractions between 0 and 1 get smaller when squared.",
  },
  {
    q: "What technique involves breaking a proof into several cases?",
    options: [
      "Proof by cases (case analysis)",
      "Direct proof",
      "Proof by contraposition",
      "Proof by contradiction",
    ],
    correct: 0,
    explanation:
      "Proof by cases involves splitting the problem into distinct categories (like positive vs. negative numbers) and proving each separately.",
  },
  {
    q: "When is proof by cases useful?",
    options: [
      "When the hypothesis naturally breaks into different scenarios",
      "Only for simple proofs",
      "Never",
      "Only for propositions",
    ],
    correct: 0,
    explanation:
      "It is useful when a single argument doesn't cover all possibilities, but breaking it down covers the whole domain.",
  },
  {
    q: "What is a constructive existence proof?",
    options: [
      "Proving existence by explicitly finding an example",
      "Proving existence without finding an example",
      "Disproving existence",
      "Assuming existence",
    ],
    correct: 0,
    explanation:
      "It proves something exists by actually producing or constructing the specific value that satisfies the condition.",
  },
];
