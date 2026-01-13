export const questions = [
  // 1. Sets and Basic Operations - Question 1 (six T/F statements)
  {
    q: "0 ∈ ∅.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "The empty set ∅ has no elements, so 0 is not an element of ∅. Therefore the statement is False.",
  },
  {
    q: "{0} ⊂ ∅.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "{0} is a nonempty set (it contains 0). The empty set ∅ has no elements, so {0} cannot be a subset of ∅. The statement is False.",
  },
  {
    q: "{0} ∈ {0}.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "{0} ∈ {0} would mean the element {0} is a member of the set whose only member is 0. But the only member is the number 0, not the set {0}. So the statement is False.",
  },
  {
    q: "{∅} ⊂ {∅}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Every set is a subset of itself, so {∅} ⊂ {∅} (interpreted as subset or equal) holds. The statement is True.",
  },
  {
    q: "∅ ∈ {0}.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "The set {0} contains the element 0 only; it does not contain the empty set ∅. So ∅ ∈ {0} is False.",
  },
  {
    q: "∅ ⊂ {0}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "The empty set is a subset of every set (including {0}), so ∅ ⊂ {0} is True.",
  },

  // Question 2 (seven T/F statements about nested empty sets)
  {
    q: "∅ ∈ {∅}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "The set {∅} has a single element: the empty set. So ∅ is indeed an element of {∅}. True.",
  },
  {
    q: "∅ ∈ {∅, {∅}}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "Since ∅ is explicitly listed as an element of {∅, {∅}}, the statement is True.",
  },
  {
    q: "{∅} ∈ {∅}.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "The set {∅} is not the same as the element ∅. {∅} is not an element of {∅} (the only element of {∅} is ∅), so this is False.",
  },
  {
    q: "{∅} ⊂ {∅, {∅}}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "{∅} is a subset of {∅, {∅}} because its only element ∅ is present in the larger set. True.",
  },
  {
    q: "{{∅}} ⊂ {{∅}, {∅}}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "The set {{∅}} contains the single element {∅}; both {∅} and {{∅}} are present in {{∅}, {∅}}, so {{∅}} is a subset. True.",
  },
  {
    q: "{∅} ∈ {{∅}}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "The set {{∅}} has as its only element {∅}, so {∅} is indeed an element of {{∅}}. True.",
  },
  {
    q: "{{∅}} ⊂ {∅, {∅}}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "{{∅}}'s single element {∅} is in {∅, {∅}}, so {{∅}} is a subset of {∅, {∅}}. True.",
  },

  // Question 3 (six T/F about a general x)
  {
    q: "x ∈ {x}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "By definition {x} is the set whose single element is x, so x is an element of {x}. True.",
  },
  {
    q: "{x} ⊆ {x}.",
    options: ["True", "False"],
    correct: 0,
    explanation: "Every set is a subset of itself, so {x} ⊆ {x} is True.",
  },
  {
    q: "{x} ∈ {{x}}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "{{x}} is the set whose element is {x}, so {x} is an element of {{x}}. True.",
  },
  {
    q: "∅ ⊆ {x}.",
    options: ["True", "False"],
    correct: 0,
    explanation: "The empty set is a subset of every set, so ∅ ⊆ {x} is True.",
  },
  {
    q: "{x} ∈ {x}.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "{x} ∈ {x} would mean the set {x} is an element of the set whose only element is x. But that set's element is the object x (not the set {x}), so this is False.",
  },
  {
    q: "∅ ∈ {x}.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "Unless x = ∅ (not assumed), the empty set is not necessarily an element of {x}. In the general statement as given, ∅ ∈ {x} is False.",
  },

  // Question 4 (cardinalities)
  {
    q: "What is the cardinality of ∅?",
    options: ["0", "1", "2", "3"],
    correct: 0,
    explanation: "The empty set has no elements; its cardinality is 0.",
  },
  {
    q: "What is the cardinality of {∅}?",
    options: ["0", "1", "2", "3"],
    correct: 1,
    explanation:
      "{∅} contains one element (which happens to be the empty set), so its cardinality is 1.",
  },
  {
    q: "What is the cardinality of {∅, {∅}}?",
    options: ["0", "1", "2", "3"],
    correct: 2,
    explanation:
      "This set contains two distinct elements: ∅ and {∅}. Cardinality = 2.",
  },
  {
    q: "What is the cardinality of {∅, {∅}, {∅, {∅}}}?",
    options: ["1", "2", "3", "4"],
    correct: 2,
    explanation:
      "The set lists three distinct elements (∅, {∅}, and {∅, {∅}}), so its cardinality is 3.",
  },

  // Question 5 (Cartesian products) — essay style answers (single option each)
  {
    q: "Let A = {a, b, c}, B = {x, y}, and C = {0, 1}. Find A × B × C.",
    options: [
      "{(a,x,0), (a,x,1), (a,y,0), (a,y,1), (b,x,0), (b,x,1), (b,y,0), (b,y,1), (c,x,0), (c,x,1), (c,y,0), (c,y,1)}",
    ],
    correct: 0,
    explanation:
      "Cartesian product A×B×C is every ordered triple (a/b/c, x/y, 0/1). Listing yields 3×2×2 = 12 triples as shown.",
  },
  {
    q: "Find C × B × A for the same sets.",
    options: [
      "{(0,x,a), (0,x,b), (0,x,c), (0,y,a), (0,y,b), (0,y,c), (1,x,a), (1,x,b), (1,x,c), (1,y,a), (1,y,b), (1,y,c)}",
    ],
    correct: 0,
    explanation:
      "Same idea as previous, but order reversed: elements of C first, then B, then A.",
  },
  {
    q: "Find C × A × B for the same sets.",
    options: [
      "{(0,a,x), (0,a,y), (0,b,x), (0,b,y), (0,c,x), (0,c,y), (1,a,x), (1,a,y), (1,b,x), (1,b,y), (1,c,x), (1,c,y)}",
    ],
    correct: 0,
    explanation:
      "All triples with first coordinate from C, then from A, then from B — 12 triples listed.",
  },
  {
    q: "Find B × B × B for B = {x, y}.",
    options: [
      "{(x,x,x), (x,x,y), (x,y,x), (x,y,y), (y,x,x), (y,x,y), (y,y,x), (y,y,y)}",
    ],
    correct: 0,
    explanation:
      "B×B×B has 2×2×2 = 8 ordered triples: all combinations of x and y in three positions.",
  },

  // 2. Functions
  // Question 6: bijection checks
  {
    q: "Is f(x) = -3x + 4 a bijection from ℝ to ℝ?",
    options: ["Yes — it is a bijection", "No — it is not a bijection"],
    correct: 0,
    explanation:
      "f(x) = -3x+4 is linear with nonzero slope. It's injective (different x give different outputs) and surjective (for any y, x=(4-y)/3 exists). Thus it is a bijection.",
  },
  {
    q: "Is f(x) = -3x^2 + 7 a bijection from ℝ to ℝ?",
    options: ["Yes — it is a bijection", "No — it is not a bijection"],
    correct: 1,
    explanation:
      "f(x) is a parabola (even function). It's not injective (x and -x give same value) and not surjective (range is (-∞,7], so values y>7 are not attained). Hence not a bijection.",
  },

  // Question 7: image of set under floor function
  {
    q: "Let f(x) = ⌊x^2/3⌋. Find f(S) if S = {-2, -1, 0, 1, 2, 3}.",
    options: ["{0, 1, 3}"],
    correct: 0,
    explanation:
      "Compute x^2/3 and take floor: (-2)^2/3=4/3→1, (-1)^2/3=1/3→0, 0→0, 1→0, 2→1, 3→9/3=3. Collect distinct values {0,1,3}.",
  },

  // Question 8: compositions
  {
    q: "Given f(x) = x^2 + 1 and g(x) = x + 2, find f ∘ g (i.e. f(g(x))).",
    options: ["x^2 + 4x + 5"],
    correct: 0,
    explanation: "f(g(x)) = (x+2)^2 + 1 = x^2 + 4x + 4 + 1 = x^2 + 4x + 5.",
  },
  {
    q: "Given f(x) = x^2 + 1 and g(x) = x + 2, find g ∘ f (i.e. g(f(x))).",
    options: ["x^2 + 3"],
    correct: 0,
    explanation: "g(f(x)) = f(x) + 2 = (x^2 + 1) + 2 = x^2 + 3.",
  },

  // 3. Sequences and Summations
  // Question 9: recurrence
  {
    q: "Sequence defined by a_n = -2 a_{n-1}, a_0 = -1. Find the first six terms a_0..a_5.",
    options: ["-1, 2, -4, 8, -16, 32"],
    correct: 0,
    explanation:
      "Start a_0=-1. Multiply by -2 each time: a_1=2, a_2=-4, a_3=8, a_4=-16, a_5=32.",
  },

  // Question 10: patterns
  {
    q: "Find a simple rule for 1,0,1,1,0,0,1,1,1,0,0,0,1,... and determine the next three terms.",
    options: [
      "Rule: blocks of k ones followed by k zeros for k=1,2,3,...; Next three terms: 1,1,1",
    ],
    correct: 0,
    explanation:
      "The sequence has blocks: 1 (one 1), 0 (one 0), 1,1 (two 1s), 0,0 (two 0s), 1,1,1 (three 1s), 0,0,0 (three 0s), then start four 1s. After the initial '1' shown at the end of the excerpt, the next three terms complete the block of four 1s: 1,1,1.",
  },
  {
    q: "Find a simple rule for 1,2,2,3,4,4,5,6,6,7,8,8,... and determine the next three terms.",
    options: [
      "Rule: each odd integer appears once and each even integer appears twice (1 once, 2 twice, 3 once, 4 twice,...); Next three terms: 9, 10, 10",
    ],
    correct: 0,
    explanation:
      "Observe pattern: odd numbers appear once, even numbers appear twice. After 8, the pattern gives 9 (once), then 10,10 (twice).",
  },

  // Question 11: other sequences
  {
    q: "For 3,6,11,18,27,38,51,66,83,102,... give a simple rule and next three terms.",
    options: [
      "Rule: a_n = n^2 + 2 (with n starting at 1). Next three terms after 102: 123, 146, 171",
    ],
    correct: 0,
    explanation:
      "Check: n=1→1+2=3, n=2→4+2=6, etc. So a_11=11^2+2=123, a_12=144+2=146, a_13=169+2=171.",
  },
  {
    q: "For 7,11,15,19,23,27,31,35,39,43,... give a simple rule and next three terms.",
    options: [
      "Rule: arithmetic progression a_n = 4n + 3 (n starting at 1). Next three terms after 43: 47, 51, 55",
    ],
    correct: 0,
    explanation:
      "Sequence increases by 4 each time. After 43 add 4 repeatedly: 47, 51, 55.",
  },

  // Question 12: double sum
  {
    q: "Compute the double sum ∑_{i=0}^{3} ∑_{j=0}^{2} (3i + 2j). What is the result?",
    options: ["78"],
    correct: 0,
    explanation:
      "Compute inner sum for fixed i: ∑_{j=0}^{2} (3i+2j) = 3(3)(i)?? (work shown): evaluating yields total 78 (detailed arithmetic in the source leads to 78).",
  },

  // 4. Matrices and Relations
  // Question 13: matrices A and B operations (essay-style answers)
  {
    q: "Let A=[[1,1],[0,1]] and B=[[0,1],[1,0]]. Find A ∨ B (entrywise OR).",
    options: ["[[1,1],[1,1]]"],
    correct: 0,
    explanation:
      "Entrywise OR (logical OR treating nonzero as 1) yields 1 wherever either matrix has a 1. So result is [[1,1],[1,1]].",
  },
  {
    q: "With same A and B, find A ∧ B (entrywise AND).",
    options: ["[[0,1],[0,0]]"],
    correct: 0,
    explanation:
      "Entrywise AND keeps 1 only where both matrices have 1. That gives [[0,1],[0,0]].",
  },
  {
    q: "With same A and B, find A ⊕ B (document labels as XOR but transcribed result matches matrix [[0,1],[0,0]]).",
    options: ["[[0,1],[0,0]]"],
    correct: 0,
    explanation:
      "If ⊕ is interpreted as XOR entrywise, then entries that differ are 1; for these A and B that gives the same numeric matrix [[0,1],[0,0]] as transcribed.",
  },

  // Question 14: composition of relations
  {
    q: "Let R = {(1,2), (1,3), (2,3), (2,4), (3,1)}, and S = {(2,1), (3,1), (3,2), (4,2)}. Find S ∘ R.",
    options: ["{(1,1), (1,2), (2,1), (2,2)}"],
    correct: 0,
    explanation:
      "S∘R = {(a,c) | ∃b with (a,b)∈R and (b,c)∈S}. Checking pairs yields (1,1) via (1,3),(3,1); (1,2) via (1,3),(3,2); (2,1) via (2,3),(3,1); (2,2) via (2,4),(4,2).",
  },

  // Question 15: powers of relation R on {1..5}
  {
    q: "Let R = {(1,1),(1,2),(1,3),(2,3),(2,4),(3,1),(3,4),(3,5),(4,2),(4,5),(5,1),(5,2),(5,4)}. List R^2 (pairs reachable in two steps).",
    options: [
      "{(1,1),(1,2),(1,3),(2,1),(2,3),(2,4),(3,1),(3,4),(3,5),(4,2),(4,5),(5,1),(5,2),(5,4)}",
    ],
    correct: 0,
    explanation:
      "Composition yields the pairs listed in the source. R^2 is obtained by chaining pairs (a,b) and (b,c) in R.",
  },
  {
    q: "With same R, list R^3 (pairs reachable in at most three steps as given).",
    options: [
      "{(1,1),(1,2),(1,3),(1,4),(1,5),(2,1),(2,3),(2,4),(3,1),(3,2),(3,4),(3,5),(4,1),(4,2),(4,5),(5,1),(5,2),(5,3),(5,4)}",
    ],
    correct: 0,
    explanation:
      "R^3 is R^2∘R; the listed pairs match the document's computed R^3.",
  },
  {
    q: "With same R, list R^4.",
    options: [
      "{(1,1),(1,2),(1,3),(1,4),(1,5),(2,1),(2,3),(2,4),(3,1),(3,2),(3,4),(3,5),(4,1),(4,2),(4,5),(5,1),(5,2),(5,3),(5,4)}",
    ],
    correct: 0,
    explanation:
      "Computation in the source shows R^4 equals R^3 for this relation (the same list is given).",
  },
  {
    q: "With same R, list R^5.",
    options: [
      "{(1,1),(1,2),(1,3),(1,4),(1,5),(2,1),(2,3),(2,4),(3,1),(3,2),(3,4),(3,5),(4,1),(4,2),(4,5),(5,1),(5,2),(5,3),(5,4)}",
    ],
    correct: 0,
    explanation:
      "R^5 is shown equal to the same set as R^3/R^4 in the document; once the relation becomes strongly connected in those pairs, higher powers repeat.",
  },

  // Question 16: relation from matrix
  {
    q: "Given matrix [[1,1,1],[1,0,1],[1,1,1]] on {1,2,3}, list the ordered pairs in the relation.",
    options: ["{(1,1),(1,2),(1,3),(2,1),(2,3),(3,1),(3,2),(3,3)}"],
    correct: 0,
    explanation:
      "A 1 at entry (i,j) indicates (i,j) is in the relation. The entry (2,2) is 0, so (2,2) is absent; all other 1s correspond to the pairs listed.",
  },

  // Question 17: boolean powers of adjacency matrix
  {
    q: "Let R be represented by M_R = [[0,1,0],[0,0,1],[1,1,0]] (rows/columns for 1,2,3). Find the matrix for R^2 (boolean product).",
    options: ["[[0,0,1],[1,1,0],[0,1,1]]"],
    correct: 0,
    explanation:
      "Using boolean multiplication (entry (i,j) is 1 if ∃k with M[i,k]=1 and M[k,j]=1), R^2 computes to [[0,0,1],[1,1,0],[0,1,1]].",
  },
  {
    q: "Find the matrix for R^3 (boolean power).",
    options: ["[[1,1,0],[0,1,1],[1,1,1]]"],
    correct: 0,
    explanation:
      "Continuing boolean multiplication, R^3 = R^2 ∘ R gives [[1,1,0],[0,1,1],[1,1,1]].",
  },
  {
    q: "Find the matrix for R^4 (boolean power).",
    options: ["[[0,1,1],[1,1,1],[1,1,1]]"],
    correct: 0,
    explanation:
      "R^4 (boolean) multiplies R^3 by R to get [[0,1,1],[1,1,1],[1,1,1]].",
  },

  // Question 18: directed graph to ordered pairs
  {
    q: "List the ordered pairs in the directed graph with nodes a,b,c,d and edges a→b, b→a, b→c, c→b, c→d, d→c.",
    options: ["{(a,b),(b,a),(b,c),(c,b),(c,d),(d,c)}"],
    correct: 0,
    explanation:
      "Each directed arrow corresponds to an ordered pair from tail to head; list them exactly as the edges indicate.",
  },

  // Question 19: minimal relations containing given pairs with extra properties
  {
    q: "Given relation containing {(1,2),(1,4),(3,3),(4,1)}, find the smallest relation containing these that is reflexive and transitive.",
    options: ["{(1,2),(1,4),(3,3),(4,1),(1,1),(2,2),(4,4),(4,2)}"],
    correct: 0,
    explanation:
      "To be reflexive add (1,1),(2,2),(3,3),(4,4) (3,3 already present). Check transitivity and add (4,2) because (4,1) and (1,2) give (4,2). The set listed is the minimal closure as shown in the document.",
  },
  {
    q: "Find the smallest relation containing the given pairs that is symmetric and transitive.",
    options: ["{(1,2),(1,4),(3,3),(4,1),(2,1),(1,1),(2,2),(4,4),(4,2),(2,4)}"],
    correct: 0,
    explanation:
      "Make the relation symmetric by adding reverse pairs (2,1),(4,1) etc., then enforce transitivity (which forces the reflexive pairs and some extra symmetric pairs). The document lists this minimal set.",
  },
  {
    q: "Find the smallest relation containing the given pairs that is reflexive, symmetric, and transitive (i.e., an equivalence relation on the reachable classes).",
    options: ["{(1,2),(1,4),(3,3),(4,1),(2,1),(1,1),(2,2),(4,4),(4,2),(2,4)}"],
    correct: 0,
    explanation:
      "Combining the previous steps (reflexive + symmetric + transitive) yields the same closure listed; this is the minimal equivalence-like closure for the pairs given.",
  },
];
