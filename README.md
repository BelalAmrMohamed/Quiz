# Programming_2_Quiz

**Interactive HTML Mastery Quiz**


Welcome to the inaugural release of **HTML Knowledge Quiz**, a sophisticated, beginner-friendly web application designed to elevate your understanding of HTML fundamentals through an engaging, interactive quiz experience. This release marks the foundation of an educational tool tailored for aspiring web developers, students, and programming enthusiasts. Built with modern web technologies, it combines intuitive design with robust functionality to foster learning in a fun, progressive manner.


**Live Demo:** [Programming 2 Quiz](https://belalamrmohamed.github.io/Programming_2_Quiz/)


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
Questions are isolated in `Script/questions.js` for easy customization or expansion. Leveraging ES6 modules ensures maintainability and scalability.


- **Responsive & Accessible Design**
Fully responsive layout with soft gradients, rounded aesthetics, and high-contrast elements for an inclusive experience across devices.


- **Advanced Quiz Mechanics**
Inspired by Quizlet and Kahoot, includes retry options per question, visual feedback animations, and a "Finish Quiz" button unlocked only after full engagement.


---


## Live Link


Access the hosted version:
[https://belalamrmohamed.github.io/Programming_2_Quiz/](https://belalamrmohamed.github.io/Programming_2_Quiz/)


**Customization:**


- **Questions:** Edit `Script/questions.js` to add or modify questions by updating the exported array objects containing `q`, `options`, and `correct`.
- **Styles:** Adjust `CSS/styles.css` for personalized theming.


---


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
git clone https://github.com/belalamrmohamed/Programming_2_Quiz.git
cd Programming_2_Quiz
```


### Serve Locally
1. Install a local server if needed (e.g., via npm: `npm install -g http-server`).
2. Run `http-server` in the project directory.
3. Open [http://localhost:8080](http://localhost:8080) in your browser.


### Customize
- Modify questions in `Script/questions.js`.
- Adjust UI styles in `CSS/styles.css`.


---


## Project Structure


```
index.html # Main HTML file
CSS/styles.css # Stylesheet for quiz UI
Script/script.js # Core JavaScript logic
Script/questions.js # Exportable question bank
```


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
