# Quiz

**Interactive Mastery Quiz**

Welcome to the inaugural release of **Quiz**, a sophisticated, beginner-friendly web application designed to elevate your understanding, interactive quiz experience. This release marks the foundation of an educational tool tailored for aspiring web developers, students, and programming enthusiasts. Built with modern web technologies, it combines intuitive design with robust functionality to foster learning in a fun, progressive manner.

**Live Demo:** [Quiz](https://belalamrmohamed.github.io/Quiz/)

---

## Key Features

- **Comprehensive Question Bank**
  40 meticulously curated multiple-choice questions covering core HTML concepts, from basic tags and structure to advanced attributes and semantics. Supports variable option counts (2 or 4 choices) for flexible quiz design.

- **State Persistence**
  Utilizes local storage to save progress, including answered questions, selections, scores, and elapsed time—ensuring seamless resumption even after browser closure or refresh.

- **Intuitive Navigation & UI**
  Single-question view with previous/next buttons, a dynamic progress bar, real-time timer, and score tracking. Beginner-oriented styling with encouraging feedback like _"Great job – you're learning fast!"_ to build confidence.

- **Summary & Review Mode**
  Detailed post-quiz summary with total time, scores, and per-question breakdowns (correct/wrong/unanswered), including your answers and correct solutions for self-reflection.

- **Modular Architecture**
  Questions are isolated in the `Exams` directory for easy customization or expansion. Leveraging ES6 modules ensures maintainability and scalability.

- **Responsive & Accessible Design**
  Fully responsive layout with soft gradients, rounded aesthetics, and high-contrast elements for an inclusive experience across devices.

- **Advanced Quiz Mechanics**
  Inspired by Quizlet and Kahoot, includes retry options per question, visual feedback animations, and a "Finish Quiz" button unlocked only after full engagement.

---

## Live Link

Access the hosted version:
[https://belalamrmohamed.github.io/Quiz/](https://belalamrmohamed.github.io/Quiz/)

**Customization:**

- **Questions:** Edit the `Exams` directory to add or modify Quizzes.

---

## Project structure

```
Quiz Website/
├── index.html
├── quiz.html
├── summary.html
│
├── CSS/
│   ├── styles.css
│   ├── quiz.css
│   └── summary.css
│
├── script/
│   ├── index.js
│   ├── quiz.js
│   ├── summary.js
│   └── examManifest.js
│
├── tools/
│   └── generateExamManifest.js
│
└── Exams/
    ├── Categorie-1/
    │   ├── quiz_1.js
    │   ├── quiz_2.js
    │   └── quiz_3.js
    │
    ├── Categorie-2/
    │   ├── quiz_1.js
    │   ├── quiz_2.js
    │   └── quiz_3.js
    │
    └── categorie-3/...
```

## How quizzes are formatted

Each quiz is smartly formatted in their own javascript file

```js
export const questions = [
  {
    // The question can have 2, 3, 4 or more options.
    q: "`MCQ` or `true and false` question text here?",
    options: ["Option A", "Option B", "Option C", "Option D", "Option E"],
    correct: 0,
    explanation: "Explanation goes here. Or it can be empty",
  },
  {
    q: "Essay type question text here?",
    options: ["The answer to the essay question goes here as a single option."],
    correct: 0, // Always 0 since the first option is the only one option
    explanation: "Explanation goes here. Or it can be empty",
  },
  // ... rest of the questions
];
```

## Changelog

**v1.0.0 – Initial Release**

- **New:** Full implementation of quiz logic, UI/UX enhancements, and state management.
- **Fixed:** N/A

---

## Future Roadmap

- Expand to additional programming topics (CSS, JavaScript quizzes).
- Multi-user support with leaderboards.
- Timed modes and difficulty levels.
- Exportable results for educational tracking.

---

## Getting Started

### Clone Repository

```bash
git clone https://github.com/belalamrmohamed/Quiz.git
cd Quiz
```

### Serve Locally

1. Install a local server if needed (e.g., via npm: `npm install -g http-server`).
2. Run `http-server` in the project directory.
3. Open [http://localhost:8080](http://localhost:8080) in your browser.

### Customize

- Modify questions in the `Exams` directory.
- Adjust UI styles in the `CSS` directory.

---

## Contributing

We welcome contributions!

- Fork the repository.
- Submit a pull request.
- For major changes, open an issue first to discuss.

---

## License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with vanilla HTML, CSS, and JavaScript.
- Inspired by top educational quiz platforms for an optimal learning experience.

Start your HTML mastery journey today! 🚀
