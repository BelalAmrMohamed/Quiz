// Website Demo.js - Example questions with images and explanations
// This file demonstrates the 3 supported image scenarios:
// 1. Web URL image
// 2. Relative path image
// 3. No image (conditional rendering)
// And 2 supported explanation scenarios
// 1. Explanation
// 2. No explanation

export const questions = [
  // Question with Web URL image
  {
    q: "Based on the diagram below, identify the type of network topology shown.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d0/StarNetwork.svg",
    options: [
      "Bus Topology",
      "Star Topology",
      "Ring Topology",
      "Mesh Topology",
    ],
    correct: 1,
    explanation:
      "This is a Star Topology where all devices connect to a central hub or switch.",
  },

  // Question with relative path image
  {
    q: "Is this component a CPU?",
    image: "./Exam-assets/dashboard-thumbnail.jpg",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "The CPU is the brain of the computer, responsible for executing instructions.",
  },

  // Question WITHOUT image (tests conditional rendering)
  {
    q: "Which programming language is primarily used for server-side web development?",
    options: ["HTML", "CSS", "JavaScript", "PHP"],
    correct: 3,
    explanation:
      "PHP is a popular server-side scripting language designed for web development.",
  },
  // Question WITHOUT image nor explanation (tests conditional rendering for both)
  {
    q: "Which programming language is primarily used for Front-End Styling?",
    options: [
      "HTML",
      "CSS",
      "JavaScript",
      "PHP",
      "Python",
      "Java",
      "C++",
      "Ruby",
      "Swift",
      "Go",
    ],
    correct: 1,
  },

  // Essay question with an image
  {
    q: "Which programming language is primarily used for server-side web development?",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg",
    options: ["The programming language is PHP"],
    correct: 1,
    explanation:
      "PHP is a popular server-side scripting language designed for web development.",
  },
];
