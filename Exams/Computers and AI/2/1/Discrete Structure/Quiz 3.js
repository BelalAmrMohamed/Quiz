export const questions = [
  // Level 1: Basic Propositional Logic
  {
    q: "A proposition is a declarative sentence that is:",
    options: [
      "A question or a command",
      "Always true",
      "Either true or false, but not both",
      "Sometimes true and sometimes false",
    ],
    correct: 2,
    explanation:
      "By definition, a proposition must have a definite truth value (True or False) and cannot be ambiguous, a question, or a command.",
  },
  {
    q: "Which of the following is a proposition?",
    options: [
      "What time is it?",
      "Read this carefully",
      "2 + 3 = 5",
      "x + 3 = 7",
    ],
    correct: 2,
    explanation:
      "A is a question, B is a command, and D is an open sentence (variable x). C is a declarative statement with a definitive truth value (True).",
  },
  {
    q: "Which of the following is NOT a proposition?",
    options: [
      "2 + 3 = 5",
      "What time is it?",
      "Cairo is the capital of Egypt",
      "5 - 2 = 1",
    ],
    correct: 1,
    explanation:
      "Questions do not assert a fact that can be judged as true or false.",
  },
  {
    q: 'The truth value of the proposition "5 - 2 = 1" is:',
    options: ["True (T)", "False (F)", "Undefined", "Not a proposition"],
    correct: 1,
    explanation:
      "5 - 2 equals 3, not 1. Therefore, the statement is valid but False.",
  },
  {
    q: "The truth value of a proposition is denoted by:",
    options: ["V or X", "T or F", "1 or 2", "p or q"],
    correct: 1,
    explanation: "T and F are the standard symbols for True and False.",
  },
  {
    q: 'The negation of the proposition "Michael\'s PC runs Linux" is:',
    options: [
      "Michael's PC runs Windows",
      "It is not the case that Michael's PC runs Linux",
      "Michael's PC runs Linux and Unix",
      "Michael's PC might run Linux",
    ],
    correct: 1,
    explanation:
      "Negation simply denies the statement. 'Runs Windows' is too specific; he could run macOS.",
  },
  {
    q: "The negation of a proposition p is denoted by:",
    options: ["¬p", "p ∧ q", "p → q", "p ∨ q"],
    correct: 0,
    explanation: "The symbol ¬ represents the logical NOT operator.",
  },
  {
    q: "The negation (¬p) is true when:",
    options: [
      "p is true",
      "p is false",
      "Both p and ¬p are true",
      "p is a variable",
    ],
    correct: 1,
    explanation: "If a statement is False, its negation must be True.",
  },
  {
    q: "If p is True, then the truth value of ¬p is:",
    options: ["True", "False", "T or F", "None of the above"],
    correct: 1,
    explanation: "Negation inverts the truth value.",
  },
  {
    q: "The conjunction (p ∧ q) is true when:",
    options: [
      "Both p and q are true",
      "At least one of p or q is true",
      "Both p and q are false",
      "p is true and q is false",
    ],
    correct: 0,
    explanation: "Conjunction (AND) requires all operands to be true.",
  },
  {
    q: "The conjunction (p ∧ q) is true only when:",
    options: [
      "Both p and q are true",
      "p is true and q is false",
      "p is false and q is true",
      "Both are false",
    ],
    correct: 0,
    explanation:
      "Same as above; AND is only satisfied if both conditions are met.",
  },
  {
    q: "The disjunction (p ∨ q) is false only when:",
    options: [
      "Both p and q are true",
      "One is true and the other is false",
      "Both p and q are false",
      "p is false",
    ],
    correct: 2,
    explanation:
      "Disjunction (OR) is true if at least one input is true. It is false only if all inputs are false.",
  },
  {
    q: "The disjunction (p ∨ q) is false only when:",
    options: [
      "At least one is true",
      "p is true",
      "q is true",
      "Both p and q are false",
    ],
    correct: 3,
    explanation: "Repetition of the rule: False OR False = False.",
  },
  {
    q: "The exclusive or (p ⊕ q) is true when:",
    options: [
      "Both p and q are true",
      "Both p and q are false",
      "Exactly one of p and q is true",
      "At least one is true",
    ],
    correct: 2,
    explanation:
      "XOR (Exclusive OR) checks for inequality. It is true if inputs are different (one True, one False).",
  },
  {
    q: "The exclusive or (p ⊕ q) is true when:",
    options: [
      "Both are true",
      "Exactly one of p or q is true",
      "Both are false",
      "At least one is true",
    ],
    correct: 1,
    explanation:
      "XOR is distinct from inclusive OR because it evaluates to False if both inputs are True.",
  },
  {
    q: "In the conditional statement p → q, the proposition p is called the:",
    options: [
      "Conclusion",
      "Hypothesis (or premise)",
      "Consequence",
      "Contrapositive",
    ],
    correct: 1,
    explanation:
      "The 'if' part of the statement is the hypothesis or antecedent.",
  },
  {
    q: "In the conditional statement p → q, the proposition q is called:",
    options: [
      "Hypothesis",
      "Premise",
      "Conclusion (or consequence)",
      "Antecedent",
    ],
    correct: 2,
    explanation:
      "The 'then' part of the statement is the conclusion or consequence.",
  },
  {
    q: "The statement p → q is false only in which case?",
    options: [
      "p is false and q is true",
      "p is false and q is false",
      "p is true and q is false",
      "Both are true",
    ],
    correct: 2,
    explanation:
      "An implication is broken (False) only when a true promise (hypothesis) leads to a false result (conclusion).",
  },
  {
    q: "The conditional statement p → q is false when:",
    options: [
      "p is false",
      "p is true and q is false",
      "q is true",
      "Both are false",
    ],
    correct: 1,
    explanation: "This is the unique definition of a false implication.",
  },
  {
    q: "A truth table for a compound statement with 3 variables will have how many rows?",
    options: ["4", "6", "8 (Calculated as 2^n where n=3)", "9"],
    correct: 2,
    explanation:
      "The number of rows is 2 raised to the power of the number of variables (2³ = 8).",
  },

  // Level 2: Advanced Conditionals and Bit Operations
  {
    q: "The converse of the statement p → q is:",
    options: ["¬q → ¬p", "q → p", "¬p → ¬q", "p ↔ q"],
    correct: 1,
    explanation: "The converse swaps the hypothesis and the conclusion.",
  },
  {
    q: "The converse of p → q is:",
    options: ["¬p → ¬q", "¬q → ¬p", "q → p", "p ↔ q"],
    correct: 2,
    explanation: "Same as above; q implies p.",
  },
  {
    q: "Which statement is logically equivalent to the conditional p → q?",
    options: [
      "The converse (q → p)",
      "The inverse (¬p → ¬q)",
      "The contrapositive (¬q → ¬p)",
      "The conjunction (p ∧ q)",
    ],
    correct: 2,
    explanation:
      "An implication and its contrapositive always share the same truth value.",
  },
  {
    q: "The contrapositive of p → q is:",
    options: ["q → p", "¬q → ¬p", "¬p → ¬q", "p ∧ ¬q"],
    correct: 1,
    explanation: "Contrapositive swaps and negates both sides.",
  },
  {
    q: "The contrapositive of p → q is:",
    options: ["¬q → ¬p", "q → p", "¬p → ¬q", "p ∨ ¬q"],
    correct: 0,
    explanation: "Contrapositive: If not q, then not p.",
  },
  {
    q: "Which statement is logically equivalent to p → q?",
    options: ["Converse", "Inverse", "Contrapositive", "Conjunction"],
    correct: 2,
    explanation:
      "This is a fundamental rule in logic; proofs often rely on proving the contrapositive instead of the direct statement.",
  },
  {
    q: "The inverse of p → q is:",
    options: ["q → p", "¬q → ¬p", "¬p → ¬q", "p ∧ q"],
    correct: 2,
    explanation:
      "The inverse negates both sides but keeps the order: If not p, then not q.",
  },
  {
    q: "The inverse of p → q is:",
    options: ["¬p → ¬q", "q → p", "¬q → ¬p", "p → ¬q"],
    correct: 0,
    explanation: "Same as above; negation without swapping.",
  },
  {
    q: "A biconditional statement p ↔ q is true when:",
    options: [
      "p and q have different truth values",
      "p and q have the same truth values",
      "p is true regardless of q",
      "q is false",
    ],
    correct: 1,
    explanation:
      "Biconditional (if and only if) requires both sides to match (either both True or both False).",
  },
  {
    q: "The biconditional statement p ↔ q is true when:",
    options: [
      "p is true and q is false",
      "p and q have different truth values",
      "p and q have the same truth values",
      "p is false",
    ],
    correct: 2,
    explanation: "It represents equivalence; they must stand or fall together.",
  },
  {
    q: "The statement p ↔ q is true when:",
    options: [
      "p and q have different truth values",
      "p and q have the same truth values",
      "p is true regardless of q",
      "q is false regardless of p",
    ],
    correct: 1,
    explanation: "Equivalent to (p → q) ∧ (q → p).",
  },
  {
    q: "Which operator has the highest precedence?",
    options: [
      "Negation (¬)",
      "Conjunction (∧)",
      "Disjunction (∨)",
      "Conditional (→)",
    ],
    correct: 0,
    explanation:
      "Negation applies to the immediate variable next to it before any other operations are performed.",
  },
  {
    q: "The highest precedence among logical operators belongs to:",
    options: [
      "Negation (¬)",
      "Conjunction (∧)",
      "Disjunction (∨)",
      "Conditional (→)",
    ],
    correct: 0,
    explanation: "Standard order: ¬, then ∧, then ∨, then →, then ↔.",
  },
  {
    q: "Which operator has the lowest precedence among these?",
    options: ["∧", "∨", "¬", "↔"],
    correct: 3,
    explanation: "The biconditional (↔) is usually evaluated last.",
  },
  {
    q: "In computer bit operations, the bit '0' usually represents:",
    options: ["True", "False", "Error", "Null"],
    correct: 1,
    explanation: "0 maps to False (OFF).",
  },
  {
    q: "In computer bit operations, the bit '1' represents:",
    options: ["True", "False", "Error", "Null"],
    correct: 0,
    explanation: "1 maps to True (ON).",
  },
  {
    q: "In computer logic, a bit value of '0' represents:",
    options: ["True", "False", "Undefined", "Positive"],
    correct: 1,
    explanation: "Standard binary logic convention.",
  },
  {
    q: 'The length of the bit string "101010011" is:',
    options: ["Eight", "Nine", "Ten", "Seven"],
    correct: 1,
    explanation: "Count the digits: there are 9 bits.",
  },
  {
    q: "The bit string 101010011 has a length of:",
    options: ["Eight", "Nine", "Ten", "Seven"],
    correct: 1,
    explanation: "Count of bits = 9.",
  },
  {
    q: "What is the bitwise AND of strings 01 and 11?",
    options: ["11", "10", "01", "00"],
    correct: 2,
    explanation: "First bit: 0&1=0. Second bit: 1&1=1. Result: 01.",
  },

  // Level 3: Logic Gates, Systems, and Classifications
  {
    q: "What is the bitwise AND of 01 and 11?",
    options: ["11", "10", "01", "00"],
    correct: 2,
    explanation: "0 AND 1 is 0. 1 AND 1 is 1. Result: 01.",
  },
  {
    q: "What is the bitwise OR of 10 and 01?",
    options: ["11", "10", "01", "00"],
    correct: 0,
    explanation: "1 OR 0 is 1. 0 OR 1 is 1. Result: 11.",
  },
  {
    q: "The result of Bitwise XOR of bit strings (1010) and (1100) is:",
    options: ["1110", "1000", "0110", "0011"],
    correct: 2,
    explanation: "1⊕1=0, 0⊕1=1, 1⊕0=1, 0⊕0=0. Result: 0110.",
  },
  {
    q: "Which logic gate produces the negation of a signal?",
    options: ["Inverter", "OR gate", "AND gate", "XOR gate"],
    correct: 0,
    explanation: "An inverter (NOT gate) flips the bit.",
  },
  {
    q: "A logic gate that produces the negation (¬p) is called:",
    options: ["Inverter", "OR gate", "AND gate", "XOR gate"],
    correct: 0,
    explanation: "Also known as a NOT gate.",
  },
  {
    q: "The gate that produces ¬p as output is the:",
    options: ["Inverter", "OR gate", "AND gate", "XOR gate"],
    correct: 0,
    explanation: "Input 1 -> Output 0; Input 0 -> Output 1.",
  },
  {
    q: "In logic circuits, the component that gives output 1 only when input is 0 is:",
    options: ["OR gate", "AND gate", "Inverter", "XOR gate"],
    correct: 2,
    explanation: "This describes the behavior of a NOT gate (Inverter).",
  },
  {
    q: "The output of an XOR gate is 1 when:",
    options: [
      "Both inputs are 1",
      "Both inputs are 0",
      "One input is 1 and the other is 0",
      "The first input is always 0",
    ],
    correct: 2,
    explanation:
      "XOR (Exclusive OR) outputs True (1) only when the inputs differ.",
  },
  {
    q: "Logic gates are used to build:",
    options: [
      "Only simple propositions",
      "Digital circuits",
      "Only truth tables",
      "Truth values",
    ],
    correct: 1,
    explanation:
      "Logic gates are the physical building blocks of digital electronic circuits (like CPUs).",
  },
  {
    q: "The combinatorial circuit representing the expression (p ∧ ¬q) ∨ ¬r consists of:",
    options: [
      "Only one AND gate",
      "Only one OR gate",
      "Two Inverters, one AND gate, and one OR gate",
      "Three AND gates",
    ],
    correct: 2,
    explanation:
      "You need Inverters for ¬q and ¬r, an AND gate for the conjunction, and an OR gate for the disjunction.",
  },
];
