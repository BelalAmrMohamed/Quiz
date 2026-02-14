// Sinai University - Final Exam of Artificial Intelligence (CSW 351)
// Academic Year: 2020/2021 - Fall 2020

export const questions = [
  // Question 1 - Part A
  {
    q: "Represent the following English sentences using a semantic network: A giraffe is an ungulate that has long legs, long neck, tawny color, and dark spots. An ungulate is a mammal that chews cud. A mammal is an animal that has hair.",
    options: [
      "Create a semantic network with nodes for 'giraffe', 'ungulate', 'mammal', and 'animal' using 'is-a' and property links.",
    ],
    correct: 0,
    explanation:
      "The network should show hierarchical relationships (is-a) and attribute links (has-part/color).",
  },

  // Question 1 - Part B
  {
    q: "Determine whether the following sentence is valid, satisfiable, or unsatisfiable using truth tables: $(P\\rightarrow(Q\\rightarrow R))\\rightarrow((P\\rightarrow Q)\\rightarrow(P\\rightarrow R))$ ",
    options: ["Valid", "Satisfiable", "Unsatisfiable"],
    correct: 0,
    explanation:
      "This is a distributive law in propositional logic and is a tautology (valid).",
  },

  // Question 1 - Part C
  {
    q: "Use the Unify Function to find the substitutions that unify the following two expressions: parents(X, father(X), mother(jane)) and parents(bill, father(Y), mother(Y)).",
    options: [
      "{X/bill, Y/jane}",
      "{X/jane, Y/bill}",
      "{X/bill, Y/bill}",
      "Fail",
    ],
    correct: 0,
    explanation:
      "X unifies with bill; then father(bill) unifies with father(Y) making Y/bill; finally mother(jane) must unify with mother(bill), which fails unless jane = bill.",
  },

  // Question 2 - Part A
  {
    q: "Translate into predicate calculus and prove Sam is happy: 1. All children like sweetie. 2. Chocolate is sweetie. 3. If a child eats the food that he likes he is happy. 4. Chocolate is food. 5. Sam is a child. 6. Sam eats chocolate.",
    options: ["Prove: happy(sam)"],
    correct: 0,
    explanation:
      "Use Universal Instantiation and Modus Ponens to link child(sam), likes(sam, chocolate), and eats(sam, chocolate) to happy(sam).",
  },

  // Question 2 - Part B
  {
    q: "Consider the figure showing distances between four cities (A, B, C, D). Assuming the home city is A, find the shortest path for the salesman to travel and return home.",
    image: "./assets/quiz-media/salesman-graph.png",
    options: [
      "Shortest path using Exhaustive Search",
      "Shortest path using Nearest Neighbor Algorithm",
    ],
    correct: 0,
  },

  // Question 3 - Part A
  {
    q: "Investment strategy depends on income adequacy: $minincome(Y) = 15000 + 6000 * Y$ (where Y is dependents). If an individual has 3 dependents and earns $22,000, translate to predicate calculus and determine the strategy.",
    options: ["Invest in a savings account", "Invest in the stock market"],
    correct: 0,
    explanation:
      "For Y=3, minincome = 33,000. Since $22,000 < $33,000, income is inadequate.",
  },

  // Question 3 - Part B
  {
    q: "Apply the backtrack search algorithm on the provided graph where the start state is A and the desired goal state is K.",
    image: "./assets/quiz-media/backtrack-graph.png",
    options: ["Show successive values of SL, NSL, DE, and CS"],
    correct: 0,
  },

  // Question 4 - Part A
  {
    q: "Based on library access rules, draw the and/or graph representation and determine if 'karen' has access: 1. parent(sarah, sam). 2. parent(karen, todd). 3. parent(diane, karen). 4. professor(diane). 5. ∀X [student(X) → has_access(X, library)]. 6. ∀X [professor(X) → has_access(X, library)]. 7. ∀X ∀Y [parent(Y, X) ∧ has_access(Y, library) → has_access(X, library)].",
    options: ["True (has_access)", "False (no access)"],
    correct: 0,
    explanation:
      "Diane is a professor (has access). Diane is parent of Karen. Therefore, Karen has access.",
  },

  // Question 4 - Part B
  {
    q: "Parse the following sentence by drawing its parse tree: 'the bird saw the sweet apple on the tree.'",
    options: [
      "Generate parse tree using provided grammar rules (NP, VP, PP, etc.)",
    ],
    correct: 0,
  },
];
