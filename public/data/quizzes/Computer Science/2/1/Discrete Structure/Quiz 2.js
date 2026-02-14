export const questions = [
  {
    q: "What is the contrapositive of 'If it rains, then the grass is wet'?",
    options: [
      "If the grass is wet, then it rains",
      "If it doesn't rain, then the grass is not wet",
      "If the grass is not wet, then it doesn't rain",
      "If it rains, then the grass is not wet",
    ],
    correct: 2,
    explanation:
      "The contrapositive of 'if p then q' is 'if not q then not p'. Therefore, 'If the grass is not wet, then it does not rain'.",
  },
  {
    q: "What is the negation of the statement 'All cats are black'?",
    options: [
      "No cats are black",
      "Some cats are black",
      "Some cats are not black",
      "All cats are not black",
    ],
    correct: 2,
    explanation:
      "The negation of a universal statement (All) is an existential statement (Some ... not).",
  },
  {
    q: "Let P(x) be 'x is a prime number' and Q(x) be 'x is odd.' Which statement represents 'All prime numbers except 2 are odd'?",
    options: [
      "For all x(P(x) implies Q(x))",
      "For all x(P(x) and Q(x))",
      "For all x(P(x) implies Q(x)) or x=2",
      "For all x((P(x) and x is not 2) implies Q(x))",
    ],
    correct: 3,
    explanation:
      "The expression targets all x that are both prime and not equal to 2.",
  },
  {
    q: "Which of these statements about logical equivalences is FALSE?",
    options: [
      "p implies q is equivalent to not p or q",
      "not(p implies q) is equivalent to p and not q",
      "p implies q is equivalent to not q implies not p",
      "p implies (q implies r) is equivalent to (p implies q) implies r",
    ],
    correct: 3,
    explanation:
      "Implication is not associative; changing the grouping changes the meaning of the statement.",
  },
  {
    q: "If P(x) means 'x is a dog' and Q(x) means 'x has four legs', which statement means 'All dogs have four legs'?",
    options: [
      "There exists an x such that (P(x) and Q(x))",
      "For all x(P(x) and Q(x))",
      "For all x(P(x) implies Q(x))",
      "There exists an x such that (P(x) implies Q(x))",
    ],
    correct: 2,
    explanation:
      "Universal statements regarding properties are represented as 'For all x, if x is P, then x is Q'.",
  },
  {
    q: "If P(x) means 'x is a student' and Q(x) means 'x studies hard', what does 'There exists an x such that (P(x) and Q(x))' mean in English?",
    options: [
      "All students study hard",
      "Some students study hard",
      "No students study hard",
      "All students don't study hard",
    ],
    correct: 1,
    explanation:
      "The existential quantifier translates to 'There exists' or 'Some'.",
  },
  {
    q: "Let P(x,y) mean 'x is greater than y'. What is the meaning of 'For all x, there exists a y such that P(x,y)'?",
    options: [
      "For every x, there is some y that is greater than x",
      "For every x, there is some y that x is greater than",
      "There exists an x that is greater than all y",
      "There exists a y that is greater than all x",
    ],
    correct: 1,
    explanation:
      "This means that for every chosen x, you can find at least one y that is smaller than it.",
  },
  {
    q: "The contrapositive of 'If n is even, then n squared is even' is:",
    options: [
      "If n is odd, then n squared is odd",
      "If n squared is odd, then n is odd",
      "If n is not even, then n squared is not even",
      "If n squared is not even, then n is not even",
    ],
    correct: 3,
    explanation:
      "We negate and swap both sides: 'If n squared is not even, then n is not even'.",
  },
  {
    q: "What is the symbolic form of 'Not all doctors work in hospitals'?",
    options: [
      "For all x(Doctor(x) implies not Hospital(x))",
      "There exists an x such that (Doctor(x) and not Hospital(x))",
      "It is not the case that for all x(Doctor(x) implies Hospital(x))",
      "Both B and C",
    ],
    correct: 3,
    explanation:
      "Saying 'Not all' is logically the same as saying 'There is at least one that is not'.",
  },
  {
    q: "If C(x) means 'x is a car' and F(x) means 'x is fast', which symbolizes 'Only fast vehicles are cars'?",
    options: [
      "For all x(Car(x) implies Fast(x))",
      "For all x(Fast(x) implies Car(x))",
      "For all x(Car(x) if and only if Fast(x))",
      "There exists an x such that (Car(x) and Fast(x))",
    ],
    correct: 0,
    explanation:
      "The phrase 'Only B are A' means that if something is an A, it must be a B.",
  },
  {
    q: "If f(x) = x cubed minus 3x and g(x) = x + 2, then (f composed with g)(1) equals:",
    options: ["0", "3", "6", "18"],
    correct: 3,
    explanation:
      "First find g(1) = 3. Then find f(3) = 3 cubed (27) minus 3 times 3 (9), which equals 18.",
  },
  {
    q: "For which function is the inverse of f equal to f?",
    options: ["f(x) = x + 1", "f(x) = x squared", "f(x) = x", "f(x) = 1/x"],
    correct: 3,
    explanation:
      "A function that is its own inverse is an involution. For f(x)=1/x, f(f(x)) = 1/(1/x) = x.",
  },
  {
    q: "The power set of {a, b} contains:",
    options: ["2 elements", "3 elements", "4 elements", "5 elements"],
    correct: 2,
    explanation:
      "The number of elements in a power set is 2 raised to the power of the number of elements in the set. 2 squared is 4.",
  },
  {
    q: "Let A = {1, 2, 3} and B = {2, 3, 4}. What is (A minus B) union (B minus A)?",
    options: ["{1, 2, 3, 4}", "{1, 4}", "{2, 3}", "Empty Set"],
    correct: 1,
    explanation:
      "A minus B leaves {1}. B minus A leaves {4}. Combining them gives {1, 4}.",
  },
];
