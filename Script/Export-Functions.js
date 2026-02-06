let docx;

async function loadDocx() {
  if (!docx) {
    docx = await import("https://cdn.jsdelivr.net/npm/docx@8.5.0/+esm");
    window.docx = docx; // Make it globally available
  }
  return docx;
}

const isEssayQuestion = (q) => q.options && q.options.length === 1;
const currentName = localStorage.getItem("username") || "User";

// Image Helpers
const getDataUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        resolve(canvas.toDataURL("image/jpeg"));
      } catch (e) {
        console.warn("Failed to convert image to data URL", e);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn("Failed to load image for PDF export", url);
      resolve(null);
    };
    img.src = url;
  });
};

const isLocalPath = (url) => {
  if (!url) return false;
  // Check for relative paths (./, ../, or no protocol)
  if (url.startsWith("./") || url.startsWith("../") || url.startsWith("/")) {
    return true;
  }
  // Check if it lacks a protocol (http://, https://, data:)
  return !/^(https?:|data:)/i.test(url);
};

const convertImagesToBase64 = async (questions) => {
  const processedQuestions = [];

  for (const question of questions) {
    const processedQuestion = { ...question };

    if (question.image) {
      // If it's a local path or needs conversion
      if (isLocalPath(question.image)) {
        console.log(`Converting local image to base64: ${question.image}`);
        const base64 = await getDataUrl(question.image);
        if (base64) {
          processedQuestion.image = base64;
        } else {
          console.warn(`Failed to convert ${question.image}, keeping original`);
          // Keep original - will show alt text if broken
        }
      }
      // Remote URLs or already base64 - keep as is
    }

    processedQuestions.push(processedQuestion);
  }

  return processedQuestions;
};

export async function exportToQuiz(config, questions) {
  // Convert local images to base64
  const processedQuestions = await convertImagesToBase64(questions);
  const quizHTML = `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title || "Practice Quiz"}</title>
  <style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #e2e8f0;
    --text-primary: #2d3748;
    --text-secondary: #4a5568;
    --text-muted: #718096;
    --border-color: #e2e8f0;
    --card-bg: #f8f9fa;
    --card-answered: #f0f4ff;
    --gradient-start: #667eea;
    --gradient-end: #764ba2;
    --success: #48bb78;
    --error: #f56565;
    --info: #4299e1;
    --shadow: rgba(0, 0, 0, 0.1);
    --shadow-lg: rgba(0, 0, 0, 0.3);
  }
  
  [data-theme="dark"] {
    --bg-primary: #1a202c;
    --bg-secondary: #2d3748;
    --bg-tertiary: #4a5568;
    --text-primary: #f7fafc;
    --text-secondary: #e2e8f0;
    --text-muted: #a0aec0;
    --border-color: #4a5568;
    --card-bg: #2d3748;
    --card-answered: #3e4c63;
    --gradient-start: #667eea;
    --gradient-end: #764ba2;
    --success: #48bb78;
    --error: #f56565;
    --info: #4299e1;
    --shadow: rgba(0, 0, 0, 0.3);
    --shadow-lg: rgba(0, 0, 0, 0.5);
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    min-height: 100vh;
    padding: 20px;
    transition: background 0.3s ease;
  }
  
  /* Hamburger Menu Button */
  .menu-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1001;
    width: 50px;
    height: 50px;
    background: var(--gradient-start);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    box-shadow: 0 4px 12px var(--shadow-lg);
    transition: all 0.3s ease;
  }
  
  .menu-toggle:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px var(--shadow-lg);
  }
  
  .menu-toggle span {
    width: 24px;
    height: 3px;
    background: #fff;
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  
  .menu-toggle.active span {
    position: absolute;
    top: 50%; 
    left: 55%; 
    margin: -2px 0 0 -15px; 
  }
  
  .menu-toggle.active span:nth-child(1) {
    transform: rotate(45deg);
  }
  
  .menu-toggle.active span:nth-child(2) {
    opacity: 0;
  }
  
  .menu-toggle.active span:nth-child(3) {
    transform: rotate(-45deg);
  }
  /* Side Menu */
  .side-menu {
    position: fixed;
    top: 0;
    right: -320px;
    width: 320px;
    height: 100vh;
    background: var(--bg-primary);
    box-shadow: 4px 0 20px var(--shadow-lg);
    z-index: 1000;
    transition: right 0.3s ease;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  .side-menu.open {
    right: 0;
  }
  
  .side-menu-overlay {
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  
  .side-menu-overlay.show {
    opacity: 1;
    pointer-events: auto;
  }
  
  .side-menu-header {
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    color: #fff;
    padding: 25px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .side-menu-header h2 {
    font-size: 20px;
    margin-bottom: 5px;
  }
  
  .side-menu-header p {
    font-size: 13px;
    opacity: 0.9;
  }
  
  .side-menu-content {
    flex: 1;
    padding: 20px;
  }
  
  .menu-section {
    margin-bottom: 25px;
  }
  
  .menu-section h3 {
    font-size: 14px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    font-weight: 600;
  }
  
  /* Dark Mode Toggle */
  .dark-mode-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    background: var(--bg-secondary);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 15px;
  }
  
  .dark-mode-toggle:hover {
    background: var(--bg-tertiary);
  }
  
  .dark-mode-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    color: var(--text-primary);
    font-weight: 500;
  }
  
  .toggle-switch {
    position: relative;
    width: 50px;
    height: 26px;
    background: var(--border-color);
    border-radius: 13px;
    transition: background 0.3s ease;
  }
  
  .toggle-switch.active {
    background: var(--gradient-start);
  }
  
  .toggle-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px var(--shadow);
  }
  
  .toggle-switch.active .toggle-slider {
    transform: translateX(24px);
  }
  
  /* Question Navigator */
  .nav-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  
  .nav-btn {
    padding: 12px;
    border: 2px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    font-size: 14px;
    text-align: center;
  }
  
  .nav-btn:hover {
    border-color: var(--gradient-start);
    background: var(--card-answered);
    transform: scale(1.05);
  }
  
  .nav-btn.answered {
    background: var(--card-answered);
    border-color: var(--gradient-start);
    color: var(--gradient-start);
  }
  
  .nav-btn.current {
    background: var(--gradient-start);
    color: #fff;
    border-color: var(--gradient-start);
  }
  
  .container {
    max-width: 900px;
    margin: 0 auto;
    background: var(--bg-primary);
    border-radius: 20px;
    box-shadow: 0 20px 60px var(--shadow-lg);
    overflow: hidden;
    transition: background 0.3s ease;
  }
  
  .header {
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    color: #fff;
    padding: 30px;
    text-align: center;
  }
  
  .header h1 {
    font-size: 28px;
    margin-bottom: 10px;
  }
  
  .header p {
    opacity: 0.9;
    font-size: 14px;
  }
  
  /* Progress Bar */
  .progress-container {
    background: rgba(255, 255, 255, 0.2);
    height: 8px;
    width: 100%;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 15px;
  }
  
  .progress-bar {
    background: linear-gradient(90deg, #48bb78, #38a169);
    height: 100%;
    width: 0%;
    transition: width 0.3s ease;
    border-radius: 4px;
  }
  
  .progress-text {
    margin-top: 8px;
    font-size: 13px;
    opacity: 0.9;
  }
  
  .quiz-body {
    padding: 30px;
  }
  
  .question-card {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 25px;
    border: 2px solid var(--border-color);
    transition: all 0.3s ease;
  }
  
  .question-card.answered {
    border-color: var(--gradient-start);
    background: var(--card-answered);
  }
  
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .question-num {
    color: var(--gradient-start);
    font-weight: 700;
    font-size: 14px;
  }
  
  .question-badge {
    display: inline-block;
    padding: 4px 12px;
    background: #e8f5e9;
    color: #2e7d32;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }
  
  .question-badge.essay {
    background: #fff3e0;
    color: #e65100;
  }
  
  .question-text {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--text-primary);
    line-height: 1.6;
  }
  
  .options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .option-btn {
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 10px;
    padding: 15px 20px;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .option-btn:hover:not(.disabled) {
    border-color: var(--gradient-start);
    background: var(--card-answered);
    transform: translateX(5px);
  }
  
  .option-btn:focus {
    outline: 2px solid var(--gradient-start);
    outline-offset: 2px;
  }
  
  .option-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    font-weight: 700;
    flex-shrink: 0;
    transition: all 0.3s;
  }
  
  .option-btn.selected .option-letter {
    background: var(--gradient-start);
    color: #fff;
  }
  
  .option-btn.correct .option-letter {
    background: var(--success);
    color: #fff;
  }
  
  .option-btn.wrong .option-letter {
    background: var(--error);
    color: #fff;
  }
  
  .option-btn.selected {
    background: var(--card-answered);
    border-color: var(--gradient-start);
  }
  
  .option-btn.correct {
    background: #e8f5e9;
    border-color: var(--success);
  }
  
  .option-btn.wrong {
    background: #fee;
    border-color: var(--error);
  }
  
  .option-btn.disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
  
  .essay-input {
    width: 100%;
    min-height: 150px;
    padding: 15px;
    border: 2px solid var(--border-color);
    border-radius: 10px;
    font-family: inherit;
    font-size: 15px;
    resize: vertical;
    transition: all 0.3s;
    line-height: 1.6;
    background: var(--bg-primary);
    color: var(--text-primary);
  }
  
  .essay-input:focus {
    outline: none;
    border-color: var(--gradient-start);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .essay-input.disabled {
    cursor: not-allowed;
    opacity: 0.8;
    background: var(--bg-secondary);
  }
  
  .char-count {
    text-align: right;
    margin-top: 8px;
    font-size: 13px;
    color: var(--text-muted);
  }
  
  .controls {
    display: flex;
    gap: 15px;
    justify-content: center;
    padding: 20px;
    background: var(--bg-secondary);
    flex-wrap: wrap;
    border-top: 1px solid var(--border-color);
  }
  
  .btn {
    padding: 12px 30px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .btn:focus {
    outline: 2px solid var(--gradient-start);
    outline-offset: 2px;
  }
  
  .btn-primary {
    background: var(--gradient-start);
    color: #fff;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: #5a67d8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
  
  .btn-secondary:hover {
    background: var(--border-color);
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .results {
    padding: 30px;
    text-align: center;
    display: none;
  }
  
  .results.show {
    display: block;
  }
  
  .score-circle {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
    font-weight: 700;
    color: #fff;
    box-shadow: 0 8px 24px var(--shadow);
  }
  
  .score-circle.pass {
    background: linear-gradient(135deg, #48bb78, #38a169);
  }
  
  .score-circle.fail {
    background: linear-gradient(135deg, #f56565, #e53e3e);
  }
  
  .results h2 {
    font-size: 28px;
    color: var(--text-primary);
    margin-bottom: 10px;
  }
  
  .results-detail {
    margin-top: 20px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    display: inline-block;
  }
  
  .results-detail p {
    margin: 8px 0;
    font-size: 16px;
    color: var(--text-secondary);
  }
  
  .explanation {
    background: #ebf8ff;
    border-left: 4px solid var(--info);
    padding: 15px;
    margin-top: 15px;
    border-radius: 8px;
    font-size: 14px;
    color: #2c5282;
    line-height: 1.6;
    display: none;
  }
  
  [data-theme="dark"] .explanation {
    background: #1e3a5f;
    color: #90cdf4;
  }
  
  .explanation.show {
    display: block;
    animation: slideDown 0.3s ease;
  }
  
  .model-answer {
    background: #e8f5e9;
    border-left: 4px solid var(--success);
    padding: 15px;
    margin-top: 15px;
    border-radius: 8px;
    font-size: 14px;
    color: #1b5e20;
    line-height: 1.6;
    display: none;
  }
  
  [data-theme="dark"] .model-answer {
    background: #1e4620;
    color: #9ae6b4;
  }
  
  .model-answer.show {
    display: block;
    animation: slideDown 0.3s ease;
  }
  
  /* Confirmation Modal */
  .modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1100;
    align-items: center;
    justify-content: center;
  }
  
  .modal.show {
    display: flex;
  }
  
  .modal-content {
    background: var(--bg-primary);
    padding: 30px;
    border-radius: 16px;
    max-width: 400px;
    margin: 20px;
    box-shadow: 0 20px 60px var(--shadow-lg);
    animation: modalSlideIn 0.3s ease;
  }
  
  .modal-content h3 {
    margin-bottom: 15px;
    color: var(--text-primary);
    font-size: 20px;
  }
  
  .modal-content p {
    color: var(--text-secondary);
    margin-bottom: 20px;
    line-height: 1.6;
  }
  
  .modal-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @media (max-width: 600px) {
    .container {
      border-radius: 0;
    }
    
    .header {
      padding: 20px;
    }
    
    .header h1 {
      font-size: 24px;
    }
    
    .quiz-body {
      padding: 20px;
    }
    
    .question-card {
      padding: 20px;
    }
    
    .question-text {
      font-size: 16px;
    }
    
    .side-menu {
      width: 280px;
      left: -280px;
    }
    
    .nav-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .menu-toggle {
      width: 45px;
      height: 45px;
    }
  }
  /* Image Styles */
  .question-image-container {
    margin-bottom: 20px;
    text-align: center;
  }
  .question-image {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    border: 2px solid var(--border-color);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  </style>
  </head>
  <body>
  <!-- Hamburger Menu Button -->
  <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu">
    <span></span>
    <span></span>
    <span></span>
  </button>
  
  <!-- Side Menu Overlay -->
  <div class="side-menu-overlay" id="menuOverlay"></div>
  
  <!-- Side Menu -->
  <div class="side-menu" id="sideMenu">
    <div class="side-menu-header">
      <h2>Quiz Navigator</h2>
      <p>Jump to any question</p>
    </div>
    
    <div class="side-menu-content">
      <div class="menu-section">
        <h3>Settings</h3>
        <div class="dark-mode-toggle" id="darkModeToggle">
          <div class="dark-mode-label">
            <span id="themeIcon">🌙</span>
            <span>Dark Mode</span>
          </div>
          <div class="toggle-switch" id="toggleSwitch">
            <div class="toggle-slider"></div>
          </div>
        </div>
      </div>
      
      <div class="menu-section">
        <h3>Questions</h3>
        <div class="nav-grid" id="navGrid"></div>
      </div>
    </div>
  </div>
  
  <div class="container">
    <div class="header">
      <h1>${config.title || "Practice Quiz"}</h1>
      <p>Total Questions: ${questions.length} | Practice Mode</p>
      <div class="progress-container">
        <div class="progress-bar" id="progressBar"></div>
      </div>
      <div class="progress-text" id="progressText">0 of ${
        questions.length
      } answered</div>
    </div>
    
    <div id="quizBody" class="quiz-body"></div>
    
    <div class="controls">
      <button class="btn btn-secondary" onclick="quizApp.reset()" aria-label="Reset quiz">
        🔄 Reset Quiz
      </button>
      <button class="btn btn-primary" onclick="quizApp.submit()" id="submitBtn" aria-label="Submit quiz">
        ✓ Submit Quiz
      </button>
    </div>
    
    <div id="results" class="results"></div>
  </div>
  
  <!-- Confirmation Modal -->
  <div id="modal" class="modal" role="dialog" aria-modal="true">
    <div class="modal-content">
      <h3 id="modalTitle">Confirm Action</h3>
      <p id="modalMessage"></p>
      <div class="modal-buttons">
        <button class="btn btn-secondary" onclick="quizApp.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="modalConfirm">Confirm</button>
      </div>
    </div>
  </div>
  
  <script>
  const questions = ${JSON.stringify(processedQuestions)};
  
  const quizApp = {
    userAnswers: new Array(questions.length).fill(null),
    submitted: false,
    currentQuestion: 0,
    darkMode: false,
  
    init() {
      this.loadDarkModePreference();
      this.renderQuiz();
      this.renderNav();
      this.updateProgress();
      this.addKeyboardShortcuts();
      this.setupMenuToggle();
      this.setupDarkModeToggle();
    },
  
    loadDarkModePreference() {
      const savedTheme = localStorage.getItem('quizTheme');
      this.darkMode = savedTheme === 'dark';
      this.applyTheme();
    },
  
    applyTheme() {
      if (this.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeIcon').textContent = '☀️';
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeIcon').textContent = '🌙';
      }
      
      const toggleSwitch = document.getElementById('toggleSwitch');
      toggleSwitch.classList.toggle('active', this.darkMode);
    },
  
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('quizTheme', this.darkMode ? 'dark' : 'light');
      this.applyTheme();
    },
  
    setupDarkModeToggle() {
      const toggle = document.getElementById('darkModeToggle');
      toggle.addEventListener('click', () => this.toggleDarkMode());
    },
  
    setupMenuToggle() {
      const menuToggle = document.getElementById('menuToggle');
      const sideMenu = document.getElementById('sideMenu');
      const overlay = document.getElementById('menuOverlay');
  
      menuToggle.addEventListener('click', () => this.toggleMenu());
      overlay.addEventListener('click', () => this.closeMenu());
    },
  
    toggleMenu() {
      const menuToggle = document.getElementById('menuToggle');
      const sideMenu = document.getElementById('sideMenu');
      const overlay = document.getElementById('menuOverlay');
  
      menuToggle.classList.toggle('active');
      sideMenu.classList.toggle('open');
      overlay.classList.toggle('show');
    },
  
    closeMenu() {
      const menuToggle = document.getElementById('menuToggle');
      const sideMenu = document.getElementById('sideMenu');
      const overlay = document.getElementById('menuOverlay');
  
      menuToggle.classList.remove('active');
      sideMenu.classList.remove('open');
      overlay.classList.remove('show');
    },
  
    isEssayQuestion(question) {
      return question.options && question.options.length === 1;
    },

    renderQuestionImage(imageUrl) {
      if (!imageUrl) return "";
      return \`
        <div class="question-image-container">
          <img 
            src="\${this.escapeHTML(imageUrl)}" 
            alt="Question context image" 
            class="question-image"
            onerror="this.parentElement.style.display='none'"
          />
        </div>
      \`;
    },
  
    escapeHTML(str) {
      if (str == null) return "";
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    },
  
    renderNav() {
      const navGrid = document.getElementById("navGrid");
      const navHtml = questions.map((_, i) => 
        \`<button class="nav-btn" id="nav\${i}" onclick="quizApp.jumpToQuestion(\${i})" aria-label="Go to question \${i + 1}">
          \${i + 1}
        </button>\`
      ).join("");
      navGrid.innerHTML = navHtml;
    },
  
    renderQuiz() {
      const quizBody = document.getElementById("quizBody");
      const html = questions.map((q, i) => this.renderQuestion(q, i)).join("");
      quizBody.innerHTML = html;
    },
  
    renderQuestion(q, i) {
      const isEssay = this.isEssayQuestion(q);
      const badgeText = isEssay ? "Essay" : "Multiple Choice";
      const badgeClass = isEssay ? "essay" : "";
  
      let optionsHtml = "";
      if (isEssay) {
        const savedAnswer = this.userAnswers[i] || "";
        optionsHtml = \`
          <textarea 
            class="essay-input" 
            id="essay\${i}" 
            placeholder="Type your answer here..." 
            oninput="quizApp.saveEssayAnswer(\${i}, this.value)"
            aria-label="Essay answer for question \${i + 1}"
          >\${savedAnswer}</textarea>
          <div class="char-count" id="charCount\${i}">
            \${savedAnswer.length} characters
          </div>
          <div class="model-answer" id="modelAns\${i}">
            <strong>✓ Correct Answer / Model Answer:</strong><br>
            \${this.escapeHTML(q.options[0])}
          </div>
        \`;
      } else {
        optionsHtml = \`<div class="options">\${
          q.options.map((opt, j) => {
            const letter = String.fromCharCode(65 + j);
            return \`
              <button 
                class="option-btn" 
                id="btn\${i}_\${j}" 
                onclick="quizApp.selectAnswer(\${i}, \${j})"
                aria-label="Option \${letter}: \${this.escapeHTML(opt)}"
              >
                <span class="option-letter">\${letter}</span>
                <span>\${this.escapeHTML(opt)}</span>
              </button>
            \`;
          }).join("")
        }</div>\`;
      }
  
      const explanationHtml = q.explanation ? 
        \`<div class="explanation" id="exp\${i}">
          <strong>💡 Explanation:</strong> \${this.escapeHTML(q.explanation)}
        </div>\` : "";
  
      return \`
        <div class="question-card" id="q\${i}">
          <div class="question-header">
            <div class="question-num">Question \${i + 1}</div>
            <div class="question-badge \${badgeClass}">\${badgeText}</div>
          </div>
          
          \${this.renderQuestionImage(q.image)}
          <div class="question-text">\${this.escapeHTML(q.q)}</div>
          \${optionsHtml}
          \${explanationHtml}
        </div>
      \`;
    },
  
    selectAnswer(qIndex, optIndex) {
      if (this.submitted) return;
  
      this.userAnswers[qIndex] = optIndex;
      const card = document.getElementById(\`q\${qIndex}\`);
      card.classList.add("answered");
  
      const buttons = card.querySelectorAll(".option-btn");
      buttons.forEach((btn, i) => {
        btn.classList.toggle("selected", i === optIndex);
      });
  
      this.updateProgress();
      this.updateNavButton(qIndex);
    },
  
    saveEssayAnswer(qIndex, value) {
      const trimmed = value.trim();
      this.userAnswers[qIndex] = trimmed || null;
      
      const card = document.getElementById(\`q\${qIndex}\`);
      card.classList.toggle("answered", !!trimmed);
      
      const charCount = document.getElementById(\`charCount\${qIndex}\`);
      if (charCount) {
        charCount.textContent = \`\${value.length} characters\`;
      }
  
      this.updateProgress();
      this.updateNavButton(qIndex);
    },
  
    updateProgress() {
      const answered = this.userAnswers.filter(a => a !== null).length;
      const total = questions.length;
      const percent = (answered / total) * 100;
  
      const progressBar = document.getElementById("progressBar");
      const progressText = document.getElementById("progressText");
      
      progressBar.style.width = \`\${percent}%\`;
      progressText.textContent = \`\${answered} of \${total} answered\`;
    },
  
    updateNavButton(qIndex) {
      const navBtn = document.getElementById(\`nav\${qIndex}\`);
      if (navBtn) {
        navBtn.classList.toggle("answered", this.userAnswers[qIndex] !== null);
      }
    },
  
    jumpToQuestion(qIndex) {
      const card = document.getElementById(\`q\${qIndex}\`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        this.currentQuestion = qIndex;
        this.closeMenu();
      }
    },
  
    submit() {
      if (this.submitted) return;
  
      const unanswered = this.userAnswers.filter(a => a === null).length;
      if (unanswered > 0) {
        this.showModal(
          "Incomplete Quiz",
          \`You have \${unanswered} unanswered question(s). Do you want to submit anyway?\`,
          () => this.performSubmit()
        );
      } else {
        this.performSubmit();
      }
    },
  
    performSubmit() {
      this.closeModal();
      this.submitted = true;
  
      let correct = 0;
      let totalScorable = 0;
  
      questions.forEach((q, i) => {
        if (this.isEssayQuestion(q)) {
          this.handleEssaySubmission(i);
        } else {
          totalScorable++;
          const isCorrect = this.handleMCQSubmission(q, i);
          if (isCorrect) correct++;
        }
  
        const exp = document.getElementById(\`exp\${i}\`);
        if (exp) exp.classList.add("show");
      });
  
      this.showResults(correct, totalScorable);
      document.getElementById("submitBtn").disabled = true;
    },
  
    handleEssaySubmission(qIndex) {
      const essayEl = document.getElementById(\`essay\${qIndex}\`);
      if (essayEl) {
        essayEl.readOnly = true;
        essayEl.classList.add("disabled");
      }
  
      const modelEl = document.getElementById(\`modelAns\${qIndex}\`);
      if (modelEl) modelEl.classList.add("show");
    },
  
    handleMCQSubmission(q, qIndex) {
      const userAns = this.userAnswers[qIndex];
      const isCorrect = userAns === q.correct;
  
      const card = document.getElementById(\`q\${qIndex}\`);
      const buttons = card.querySelectorAll(".option-btn");
      
      buttons.forEach((btn, k) => {
        btn.classList.add("disabled");
        if (k === q.correct) {
          btn.classList.add("correct");
        } else if (k === userAns && !isCorrect) {
          btn.classList.add("wrong");
        }
      });
  
      return isCorrect;
    },
  
    showResults(correct, totalScorable) {
      const percent = totalScorable > 0 ? Math.round((correct / totalScorable) * 100) : 0;
      const passed = percent >= 70;
      
      const resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = \`
        <div class="score-circle \${passed ? "pass" : "fail"}">
          \${percent}%
        </div>
        <h2>\${passed ? "🎉 Great Job!" : "📚 Keep Practicing!"}</h2>
        <div class="results-detail">
          <p><strong>Score:</strong> \${correct} / \${totalScorable} correct</p>
          <p><strong>Percentage:</strong> \${percent}%</p>
          <p><strong>Status:</strong> \${passed ? "✓ Passed" : "✗ Not Passed"}</p>
        </div>
        <p style="margin-top:20px;color:var(--text-muted)">Scroll up to review explanations and answers</p>
      \`;
      
      resultsDiv.classList.add("show");
      setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    },
  
    reset() {
      this.showModal(
        "Reset Quiz",
        "Are you sure you want to reset the quiz? All your answers will be lost.",
        () => this.performReset()
      );
    },
  
    performReset() {
      this.closeModal();
      this.submitted = false;
      this.userAnswers = new Array(questions.length).fill(null);
      this.currentQuestion = 0;
  
      document.getElementById("results").classList.remove("show");
      document.getElementById("submitBtn").disabled = false;
      
      this.renderQuiz();
      this.renderNav();
      this.updateProgress();
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  
    showModal(title, message, onConfirm) {
      const modal = document.getElementById("modal");
      document.getElementById("modalTitle").textContent = title;
      document.getElementById("modalMessage").textContent = message;
      
      const confirmBtn = document.getElementById("modalConfirm");
      confirmBtn.onclick = onConfirm;
      
      modal.classList.add("show");
    },
  
    closeModal() {
      document.getElementById("modal").classList.remove("show");
    },
  
    addKeyboardShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Close modal with Escape
        if (e.key === "Escape") {
          this.closeModal();
          this.closeMenu();
        }
        
        // Toggle menu with 'M' key
        if (e.key === 'm' || e.key === 'M') {
          if (!document.getElementById("modal").classList.contains("show")) {
            this.toggleMenu();
          }
        }
      });
  
      // Close modal when clicking outside
      document.getElementById("modal").addEventListener("click", (e) => {
        if (e.target.id === "modal") {
          this.closeModal();
        }
      });
    }
  };
  
  // Initialize the quiz when the page loads
  quizApp.init();
  </script>
  </body>
  </html>`;

  const blob = new Blob([quizHTML], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${config.title || "practice_quiz"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportToPdf(config, questions, userAnswers = []) {
  try {
    // ===========================
    // VALIDATION
    // ===========================
    if (!config || !questions || !Array.isArray(questions)) {
      throw new Error(
        "Invalid parameters: config and questions array required",
      );
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("jsPDF library not loaded");
    }

    // ===========================
    // INITIALIZATION
    // ===========================
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // CRITICAL FIX: Set font immediately and use only standard fonts
    doc.setFont("helvetica");

    // ===========================
    // GAMIFICATION COLORS
    // ===========================
    const COLORS = Object.freeze({
      // Primary gamification palette
      primary: [106, 90, 205], // Slate Blue
      secondary: [255, 215, 0], // Gold
      accent: [255, 105, 180], // Hot Pink

      // Status colors
      success: [46, 213, 115], // Bright Green
      error: [255, 71, 87], // Bright Red
      warning: [255, 168, 1], // Amber
      info: [52, 172, 224], // Sky Blue

      // UI colors
      cardBg: [255, 255, 255], // White
      cardBorder: [106, 90, 205], // Matches primary
      pageBg: [248, 250, 252], // Light Gray

      // Text colors
      textDark: [30, 41, 59], // Dark Slate
      textLight: [100, 116, 139], // Light Slate
      textWhite: [255, 255, 255], // White

      // Button colors
      buttonCorrect: [16, 185, 129], // Emerald
      buttonWrong: [239, 68, 68], // Red
      buttonNeutral: [203, 213, 225], // Slate 300

      // Special effects
      progressBarBg: [226, 232, 240], // Light gray
      progressBarFill: [255, 215, 0], // Gold
      trophy: [255, 215, 0], // Gold
    });

    // ===========================
    // OPTIMIZED SIZES (2 questions per page)
    // ===========================
    const SIZES = Object.freeze({
      // Headers & footers
      headerHeight: 18,
      footerHeight: 12,
      progressBarHeight: 6,

      // Cards - REDUCED for 2 per page
      cardPadding: 8,
      cardMargin: 6,
      cardCornerRadius: 3,
      cardShadowOffset: 0.8,

      // Typography
      titleFont: 24,
      headingFont: 16,
      questionFont: 11,
      optionFont: 10,
      labelFont: 9,
      footerFont: 8,

      // Buttons
      buttonHeight: 10,
      buttonPadding: 3,
      buttonRadius: 2,

      // Spacing
      sectionSpacing: 8,
      questionSpacing: 12,
      optionSpacing: 4,
    });

    const MARGINS = Object.freeze({
      top: 22,
      right: 12,
      bottom: 18,
      left: 12,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - MARGINS.left - MARGINS.right;

    // **CRITICAL: Maximum dimensions for images in PDF**
    const MAX_IMAGE_HEIGHT = 50; // mm - prevents page overflow
    const MAX_IMAGE_WIDTH = contentWidth - SIZES.cardPadding * 2 - 6;

    let currentY = MARGINS.top;
    let currentLevel = 1;

    // ===========================
    // IMAGE HANDLING UTILITIES
    // ===========================

    /**
     * Convert image URL to base64 data URL
     */
    const getDataUrl = async (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });
    };

    /**
     * Convert SVG to base64 PNG for jsPDF compatibility
     */
    const svgToDataUrl = async (svgString) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width || 800;
          canvas.height = img.height || 600;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL("image/png"));
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to convert SVG"));
        };

        img.src = url;
      });
    };

    /**
     * Get constrained dimensions that fit within max bounds while maintaining aspect ratio
     * and filling the width when possible
     */
    const getConstrainedDimensions = (
      imgWidth,
      imgHeight,
      maxWidth,
      maxHeight,
    ) => {
      const aspectRatio = imgWidth / imgHeight;

      // Start by filling the width
      let width = maxWidth;
      let height = width / aspectRatio;

      // If height exceeds max, scale down to fit height instead
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      return { width, height };
    };

    /**
     * Process image and return constrained dimensions and data URL
     */
    const processImage = async (imageSource) => {
      try {
        let imageData = imageSource;

        // Check if it's an SVG
        const isSvg =
          imageSource.includes("<svg") ||
          imageSource.includes("data:image/svg+xml");

        if (isSvg) {
          // Handle SVG conversion
          if (imageSource.startsWith("data:image/svg+xml")) {
            const svgString = decodeURIComponent(imageSource.split(",")[1]);
            imageData = await svgToDataUrl(svgString);
          } else if (imageSource.includes("<svg")) {
            imageData = await svgToDataUrl(imageSource);
          }
        } else if (!imageSource.startsWith("data:")) {
          // Convert regular image URL to base64
          imageData = await getDataUrl(imageSource);
        }

        // Load image to get dimensions
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageData;
        });

        // Calculate constrained dimensions in pixels
        const { width: constrainedWidth, height: constrainedHeight } =
          getConstrainedDimensions(
            img.width,
            img.height,
            MAX_IMAGE_WIDTH * 3.78, // Convert mm to pixels (approx)
            MAX_IMAGE_HEIGHT * 3.78,
          );

        // Convert back to mm for jsPDF
        const widthMM = constrainedWidth / 3.78;
        const heightMM = constrainedHeight / 3.78;

        return {
          data: imageData,
          width: widthMM,
          height: heightMM,
          success: true,
        };
      } catch (err) {
        console.warn("Failed to process image:", err);
        return { success: false };
      }
    };

    // ===========================
    // ENHANCED DECORATIVE HELPERS
    // ===========================

    /**
     * Enhanced background with multiple patterns
     */
    const drawBackgroundPattern = () => {
      // Base color
      doc.setFillColor(...COLORS.pageBg);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Pattern 1: Diagonal lines
      doc.setDrawColor(220, 220, 230);
      doc.setLineWidth(0.15);
      for (let i = -pageHeight; i < pageWidth + pageHeight; i += 12) {
        doc.line(i, 0, i + pageHeight, pageHeight);
      }

      // Pattern 2: Dots pattern (sparse)
      doc.setFillColor(215, 215, 225);
      for (let x = 10; x < pageWidth; x += 15) {
        for (let y = 10; y < pageHeight; y += 15) {
          doc.circle(x, y, 0.3, "F");
        }
      }

      // Pattern 3: Corner decorations
      doc.setFillColor(230, 230, 240);
      // Top-left corner decoration
      doc.triangle(0, 0, 15, 0, 0, 15, "F");
      // Top-right corner decoration
      doc.triangle(pageWidth, 0, pageWidth - 15, 0, pageWidth, 15, "F");
      // Bottom-left corner decoration
      doc.triangle(0, pageHeight, 15, pageHeight, 0, pageHeight - 15, "F");
      // Bottom-right corner decoration
      doc.triangle(
        pageWidth,
        pageHeight,
        pageWidth - 15,
        pageHeight,
        pageWidth,
        pageHeight - 15,
        "F",
      );
    };

    /**
     * Draws a card container with shadow and border
     */
    const drawCard = (x, y, width, height) => {
      // Shadow
      doc.setFillColor(200, 200, 210);
      doc.roundedRect(
        x + SIZES.cardShadowOffset,
        y + SIZES.cardShadowOffset,
        width,
        height,
        SIZES.cardCornerRadius,
        SIZES.cardCornerRadius,
        "F",
      );

      // Card background
      doc.setFillColor(...COLORS.cardBg);
      doc.roundedRect(
        x,
        y,
        width,
        height,
        SIZES.cardCornerRadius,
        SIZES.cardCornerRadius,
        "F",
      );

      // Card border
      doc.setDrawColor(...COLORS.cardBorder);
      doc.setLineWidth(0.4);
      doc.roundedRect(
        x,
        y,
        width,
        height,
        SIZES.cardCornerRadius,
        SIZES.cardCornerRadius,
        "S",
      );
    };

    /**
     * Draws a button-style option
     */
    const drawButton = (x, y, width, height, isCorrect, isWrong) => {
      let bgColor = COLORS.buttonNeutral;
      let borderColor = COLORS.buttonNeutral;
      let textColor = COLORS.textDark;

      if (isCorrect) {
        bgColor = COLORS.buttonCorrect;
        borderColor = COLORS.buttonCorrect;
        textColor = COLORS.textWhite;
      } else if (isWrong) {
        bgColor = COLORS.buttonWrong;
        borderColor = COLORS.buttonWrong;
        textColor = COLORS.textWhite;
      }

      // Button shadow
      doc.setFillColor(180, 180, 190);
      doc.roundedRect(
        x + 0.4,
        y + 0.4,
        width,
        height,
        SIZES.buttonRadius,
        SIZES.buttonRadius,
        "F",
      );

      // Button background
      doc.setFillColor(...bgColor);
      doc.roundedRect(
        x,
        y,
        width,
        height,
        SIZES.buttonRadius,
        SIZES.buttonRadius,
        "F",
      );

      // Button border
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.6);
      doc.roundedRect(
        x,
        y,
        width,
        height,
        SIZES.buttonRadius,
        SIZES.buttonRadius,
        "S",
      );

      return textColor;
    };

    /**
     * Draws a progress bar
     */
    const drawProgressBar = (x, y, width, height, percentage) => {
      // Background
      doc.setFillColor(...COLORS.progressBarBg);
      doc.roundedRect(x, y, width, height, 1.5, 1.5, "F");

      // Fill
      const fillWidth = (width * percentage) / 100;
      if (fillWidth > 0) {
        doc.setFillColor(...COLORS.progressBarFill);
        doc.roundedRect(x, y, fillWidth, height, 1.5, 1.5, "F");
      }

      // Border
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y, width, height, 1.5, 1.5, "S");
    };

    /**
     * Sanitizes text - SAFE ASCII only
     */
    const sanitizeText = (text) => {
      if (!text) return "";
      let cleaned = String(text).trim();
      // Remove ALL non-standard characters to prevent encoding issues
      cleaned = cleaned.replace(/[^\x20-\x7E\n\r\t]/g, "");
      return cleaned.trim();
    };

    const isEssayQuestion = (q) => q.options && q.options.length === 1;

    // ===========================
    // HEADER & FOOTER
    // ===========================

    const addGameHeader = () => {
      drawBackgroundPattern();

      // Gradient-style header (simulated with solid color)
      doc.setFillColor(...COLORS.primary);
      doc.rect(0, 0, pageWidth, SIZES.headerHeight, "F");

      // Decorative border
      doc.setDrawColor(...COLORS.secondary);
      doc.setLineWidth(1.5);
      doc.line(0, SIZES.headerHeight - 1, pageWidth, SIZES.headerHeight - 1);

      // Title - SAFE FONT
      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(SIZES.headingFont);
      doc.setFont("helvetica", "bold");
      const headerText = sanitizeText(config.title || "Quiz Quest");
      doc.text(headerText, MARGINS.left, 11);

      // Trophy text instead of emoji for safety
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      const nameWidth = doc.getTextWidth(currentName);
      const xPos = pageWidth - MARGINS.right - nameWidth;
      doc.text(`${currentName}`, xPos, 11);

      currentY = SIZES.headerHeight + 6;
    };

    const addGameFooter = (isLastPage = false) => {
      const footerY = pageHeight - SIZES.footerHeight;

      // Footer background
      doc.setFillColor(240, 242, 245);
      doc.rect(0, footerY - 2, pageWidth, SIZES.footerHeight + 2, "F");

      // Decorative top border
      doc.setDrawColor(...COLORS.secondary);
      doc.setLineWidth(0.8);
      doc.line(0, footerY - 2, pageWidth, footerY - 2);

      // Level indicator (left)
      doc.setFontSize(SIZES.footerFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(`Page ${currentLevel}`, MARGINS.left, footerY + 4);

      // Branding (right)
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textLight);
      doc.text("Crafted by Belal Amr", pageWidth - MARGINS.right, footerY + 4, {
        align: "right",
      });

      if (!isLastPage) {
        // Progress dots (center)
        const dotY = footerY + 3.5;
        const dotSpacing = 3.5;
        const totalDots = 5;
        const startX = pageWidth / 2 - (totalDots * dotSpacing) / 2;

        for (let i = 0; i < totalDots; i++) {
          if (i < currentLevel) {
            doc.setFillColor(...COLORS.primary);
          } else {
            doc.setFillColor(...COLORS.progressBarBg);
          }
          doc.circle(startX + i * dotSpacing, dotY, 0.7, "F");
        }
      }
    };

    const checkPageBreak = (requiredHeight) => {
      if (
        currentY + requiredHeight >
        pageHeight - MARGINS.bottom - SIZES.footerHeight
      ) {
        addGameFooter();
        doc.addPage();
        currentLevel++;
        addGameHeader();
        return true;
      }
      return false;
    };

    // ===========================
    // SCORE CALCULATION
    // ===========================

    const calculateScore = () => {
      let correct = 0,
        wrong = 0,
        skipped = 0,
        essayCount = 0,
        totalScorable = 0;

      questions.forEach((q, i) => {
        const userAns = userAnswers[i];
        if (isEssayQuestion(q)) {
          essayCount++;
        } else {
          totalScorable++;
          if (userAns === undefined || userAns === null) {
            skipped++;
          } else if (userAns === q.correct) {
            correct++;
          } else {
            wrong++;
          }
        }
      });

      const percentage =
        totalScorable > 0 ? Math.round((correct / totalScorable) * 100) : 0;
      const isPassing = percentage >= 70;

      return {
        correct,
        wrong,
        skipped,
        essayCount,
        totalScorable,
        percentage,
        isPassing,
      };
    };

    const scoreData = calculateScore();

    // ===========================
    // RENDER SCORE PAGE (GAMIFIED)
    // ===========================

    const renderScorePage = () => {
      addGameHeader();

      // Main achievement card
      const cardY = currentY;
      const cardHeight = 85;
      drawCard(MARGINS.left, cardY, contentWidth, cardHeight);

      // "QUEST COMPLETE!" banner
      currentY = cardY + 5;
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(
        MARGINS.left + 12,
        currentY,
        contentWidth - 24,
        12,
        2,
        2,
        "F",
      );
      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(SIZES.titleFont);
      doc.setFont("helvetica", "bold");
      doc.text("QUIZ COMPLETE!", pageWidth / 2, currentY + 9, {
        align: "center",
      });
      currentY += 22;

      // Achievement circle with score
      const circleY = currentY + 13;
      const radius = 18;

      // Outer ring
      doc.setFillColor(...COLORS.secondary);
      doc.circle(pageWidth / 2, circleY, radius + 1.5, "F");

      // Inner circle
      doc.setFillColor(
        ...(scoreData.isPassing ? COLORS.success : COLORS.warning),
      );
      doc.circle(pageWidth / 2, circleY, radius, "F");

      // Score text
      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(`${scoreData.percentage}%`, pageWidth / 2, circleY + 2, {
        align: "center",
      });

      currentY = circleY + radius + 10;

      // Motivational message
      doc.setFontSize(18);
      doc.setTextColor(...COLORS.primary);
      const message = scoreData.isPassing ? "LEGENDARY!" : "KEEP GRINDING!";
      doc.text(message, pageWidth / 2, currentY, { align: "center" });
      currentY += 9;

      // Stats row
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);
      doc.text(
        `Score: ${scoreData.correct} / ${scoreData.totalScorable}`,
        pageWidth / 2,
        currentY,
        { align: "center" },
      );
      currentY += 5;

      doc.setFontSize(SIZES.optionFont);
      doc.setTextColor(...COLORS.textLight);
      doc.text(
        `Correct: ${scoreData.correct}  Wrong: ${scoreData.wrong}  Skipped: ${scoreData.skipped}`,
        pageWidth / 2,
        currentY,
        { align: "center" },
      );

      currentY = cardY + cardHeight + 10;

      // Progress bar
      const progressY = currentY;
      drawProgressBar(
        MARGINS.left + 18,
        progressY,
        contentWidth - 36,
        SIZES.progressBarHeight,
        scoreData.percentage,
      );
      currentY = progressY + SIZES.progressBarHeight + 3;

      // Progress percentage
      doc.setFontSize(SIZES.labelFont);
      doc.setTextColor(...COLORS.textLight);
      doc.text(`${scoreData.percentage}% Complete`, pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += 10;

      // Section divider
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(1.2);
      doc.line(
        MARGINS.left + 25,
        currentY,
        pageWidth - MARGINS.right - 25,
        currentY,
      );
      currentY += 8;
    };

    // ===========================
    // Checks if no user answers were provided (function called from main page)
    // ===========================
    const isSummaryMode =
      userAnswers &&
      (Array.isArray(userAnswers)
        ? userAnswers.length > 0
        : Object.keys(userAnswers).length > 0);

    if (isSummaryMode) renderScorePage();
    else addGameHeader();

    // ===========================
    // RENDER QUESTIONS (OPTIMIZED)
    // ===========================

    const renderQuestion = async (question, index) => {
      const isEssay = isEssayQuestion(question);
      const userAns = userAnswers[index];
      const questionText = sanitizeText(question.q);

      // Process image first to get dimensions
      let imageInfo = null;
      if (question.image) {
        imageInfo = await processImage(question.image);
      }

      // Calculate card height needed
      let cardContentHeight = 0;

      // Header height
      cardContentHeight += 15; // Card header with question number

      // Image height (if exists)
      if (imageInfo && imageInfo.success) {
        cardContentHeight += imageInfo.height + 5; // Image + spacing
      }

      // Question text height
      doc.setFontSize(SIZES.questionFont);
      const qLines = doc.splitTextToSize(
        questionText,
        contentWidth - SIZES.cardPadding * 2 - 6,
      );
      const qHeight = qLines.length * 4.5;
      cardContentHeight += qHeight + 5;

      // Options height
      if (isEssay) {
        cardContentHeight += 38;
      } else {
        cardContentHeight +=
          question.options.length * (SIZES.buttonHeight + SIZES.optionSpacing) +
          6;
      }

      // Explanation height
      let expLines = [];
      if (question.explanation) {
        const expText = sanitizeText(question.explanation);
        doc.setFontSize(SIZES.optionFont);
        expLines = doc.splitTextToSize(
          expText,
          contentWidth - SIZES.cardPadding * 2 - 6,
        );
        cardContentHeight += expLines.length * 3.8 + 8;
      }

      const totalCardHeight = cardContentHeight + SIZES.cardPadding * 2;

      // **CRITICAL: Check if card is too tall for a single page**
      const maxCardHeight =
        pageHeight -
        MARGINS.top -
        MARGINS.bottom -
        SIZES.footerHeight -
        SIZES.headerHeight;

      if (totalCardHeight > maxCardHeight) {
        console.warn(
          `Question ${index + 1} card exceeds page height. Consider reducing image size or content.`,
        );
        // Force page break before this card
        if (currentY > MARGINS.top + SIZES.headerHeight) {
          checkPageBreak(totalCardHeight);
        }
      } else {
        // Normal page break check
        checkPageBreak(totalCardHeight + SIZES.cardMargin);
      }

      // Draw quest card
      const cardY = currentY;
      const cardStartY = cardY; // Save card start position
      drawCard(MARGINS.left, cardY, contentWidth, totalCardHeight);

      // Card header
      currentY = cardY + SIZES.cardPadding - 2;

      const headerY = currentY;
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding,
        headerY,
        contentWidth - SIZES.cardPadding * 2,
        8,
        2,
        2,
        "F",
      );

      // Quest number
      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Question #${index + 1}`,
        MARGINS.left + SIZES.cardPadding + 2.5,
        headerY + 5.5,
      );

      // Status badge
      const { statusText, statusColor } = getQuestionStatus(
        question,
        userAns,
        isEssay,
      );

      if (isSummaryMode) {
        doc.setTextColor(...COLORS.textWhite);
        doc.setFontSize(SIZES.optionFont);
        doc.text(
          statusText,
          pageWidth - MARGINS.right - SIZES.cardPadding - 2.5,
          headerY + 5.5,
          { align: "right" },
        );
      }
      currentY = headerY + 15;

      // **FIXED: Render image INSIDE card bounds**
      if (imageInfo && imageInfo.success) {
        // Center the image horizontally within the card
        const imageX =
          MARGINS.left +
          SIZES.cardPadding +
          3 +
          (contentWidth - SIZES.cardPadding * 2 - 6 - imageInfo.width) / 2;

        // Ensure we're rendering inside the card
        const imageY = currentY;

        try {
          doc.addImage(
            imageInfo.data,
            "PNG", // Use PNG for all processed images (including converted SVGs)
            imageX,
            imageY,
            imageInfo.width,
            imageInfo.height,
          );
          currentY += imageInfo.height + 5;
        } catch (e) {
          console.error("Failed to add image to PDF", e);
          // Continue without image
        }
      }

      // Question text
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);
      doc.text(qLines, MARGINS.left + SIZES.cardPadding + 3, currentY);
      currentY += qHeight + 5;

      // Render options
      if (isEssay) {
        renderEssayAnswer(question, userAns);
      } else {
        renderMultipleChoiceOptions(question, userAns);
      }

      // Render explanation
      if (expLines.length > 0) {
        renderExplanation(expLines);
      }

      currentY = cardY + totalCardHeight + SIZES.cardMargin;
    };

    const getQuestionStatus = (question, userAns, isEssay) => {
      if (isEssay) {
        return { statusText: "ESSAY", statusColor: COLORS.warning };
      }

      const isSkipped = userAns === undefined || userAns === null;
      if (isSkipped) {
        return { statusText: "SKIPPED", statusColor: COLORS.textLight };
      }

      const isCorrect = userAns === question.correct;
      return isCorrect
        ? { statusText: "CORRECT", statusColor: COLORS.success }
        : { statusText: "WRONG", statusColor: COLORS.error };
    };

    const renderEssayAnswer = (question, userAns) => {
      const userText = sanitizeText(userAns || "Not answered");
      const formalAnswer = sanitizeText(question.options[0]);
      const boxWidth = contentWidth - SIZES.cardPadding * 2 - 6;

      // User answer box
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding + 3,
        currentY,
        boxWidth,
        15,
        1.5,
        1.5,
        "F",
      );
      doc.setFontSize(SIZES.labelFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(
        "YOUR ANSWER:",
        MARGINS.left + SIZES.cardPadding + 4.5,
        currentY + 4,
      );
      doc.setFontSize(SIZES.optionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);
      doc.text(userText, MARGINS.left + SIZES.cardPadding + 4.5, currentY + 8, {
        maxWidth: boxWidth - 6,
      });
      currentY += 17;

      // Formal answer box
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding + 3,
        currentY,
        boxWidth,
        15,
        1.5,
        1.5,
        "F",
      );
      doc.setFontSize(SIZES.labelFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.success);
      doc.text(
        "CORRECT ANSWER:",
        MARGINS.left + SIZES.cardPadding + 4.5,
        currentY + 4,
      );
      doc.setFontSize(SIZES.optionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);
      doc.text(
        formalAnswer,
        MARGINS.left + SIZES.cardPadding + 4.5,
        currentY + 8,
        {
          maxWidth: boxWidth - 6,
        },
      );
      currentY += 18;
    };

    const renderMultipleChoiceOptions = (question, userAns) => {
      const buttonWidth = contentWidth - SIZES.cardPadding * 2 - 6;

      question.options.forEach((opt, optIndex) => {
        const isUserAns = optIndex === userAns;
        const isCorrectAns = optIndex === question.correct;
        const sanitizedOption = sanitizeText(opt);

        const buttonX = MARGINS.left + SIZES.cardPadding + 3;
        const buttonY = currentY;

        // Draw button
        const textColor = drawButton(
          buttonX,
          buttonY,
          buttonWidth,
          SIZES.buttonHeight,
          isCorrectAns,
          isUserAns && !isCorrectAns,
        );

        // Button label
        const prefix = String.fromCharCode(65 + optIndex);
        let marker = "";
        if (isCorrectAns) marker = "> ";
        else if (isUserAns) marker = "X ";

        doc.setFontSize(SIZES.optionFont);
        doc.setFont("helvetica", isCorrectAns ? "bold" : "normal");
        doc.setTextColor(...textColor);

        const displayText = `${marker}${prefix}. ${sanitizedOption}`;

        doc.text(
          displayText,
          buttonX + SIZES.buttonPadding,
          buttonY + SIZES.buttonHeight / 2 + 1.2,
          { maxWidth: buttonWidth - SIZES.buttonPadding * 2 },
        );

        currentY += SIZES.buttonHeight + SIZES.optionSpacing;
      });

      currentY += 3;
    };

    const renderExplanation = (expLines) => {
      const boxWidth = contentWidth - SIZES.cardPadding * 2 - 6;
      const boxHeight = expLines.length * 3.8 + 8;

      // Explanation box
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding + 3,
        currentY,
        boxWidth,
        boxHeight,
        1.5,
        1.5,
        "F",
      );

      // Border
      doc.setDrawColor(...COLORS.warning);
      doc.setLineWidth(0.4);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding + 3,
        currentY,
        boxWidth,
        boxHeight,
        1.5,
        1.5,
        "S",
      );

      // Label
      doc.setFontSize(SIZES.labelFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.warning);
      doc.text(
        "EXPLANATION:",
        MARGINS.left + SIZES.cardPadding + 4.5,
        currentY + 4,
      );

      // Explanation text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);
      doc.text(
        expLines,
        MARGINS.left + SIZES.cardPadding + 4.5,
        currentY + 7.5,
      );

      currentY += boxHeight + 3;
    };

    // Render all questions
    for (const [index, question] of questions.entries()) {
      await renderQuestion(question, index);
    }

    // ===========================
    // FINAL CTA PAGE
    // ===========================

    const renderCTAPage = () => {
      addGameFooter();
      doc.addPage();
      currentLevel++;
      addGameHeader();

      // Large CTA card
      const cardHeight = 55;
      const cardY = currentY + 18;
      drawCard(MARGINS.left + 8, cardY, contentWidth - 16, cardHeight);

      currentY = cardY + 12;

      // Game icon text
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text("End", pageWidth / 2, currentY, { align: "center" });
      currentY += 14;

      // CTA heading
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text("READY FOR MORE?", pageWidth / 2, currentY, { align: "center" });
      currentY += 8;

      // CTA subtext
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textLight);
      doc.text(
        "Continue your journey with more challenges!",
        pageWidth / 2,
        currentY,
        {
          align: "center",
        },
      );
      currentY += 10;

      // Link button
      const buttonWidth = contentWidth - 50;
      const buttonX = MARGINS.left + 25;
      const buttonY = currentY;

      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(buttonX, buttonY, buttonWidth, 12, 2.5, 2.5, "F");

      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "bold");
      doc.text("PLAY MORE QUIZZES", pageWidth / 2, buttonY + 7.5, {
        align: "center",
      });

      currentY += 25;

      // URL
      doc.setFontSize(SIZES.optionFont);
      doc.setTextColor(...COLORS.info);
      doc.setFont("helvetica", "bold");
      doc.text("https://divquizzes.vercel.app/", pageWidth / 2, currentY, {
        align: "center",
      });

      addGameFooter(true);
    };

    renderCTAPage();

    // ===========================
    // SAVE PDF
    // ===========================
    const filename = `${sanitizeText(config.title)}.pdf`;

    doc.save(filename);
    console.log(`Gamified PDF exported: ${filename}`);

    return { success: true, filename };
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert(`Failed to export PDF: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function exportToWord(config, questions, userAnswers = []) {
  try {
    // Load docx library if not already loaded
    await loadDocx();

    if (!window.docx) {
      throw new Error("docx library not loaded");
    }
    // ===========================
    // VALIDATION
    // ===========================
    if (!config || !questions || !Array.isArray(questions)) {
      throw new Error(
        "Invalid parameters: config and questions array required",
      );
    }

    const {
      Document,
      Packer,
      Paragraph,
      Table,
      TableRow,
      TableCell,
      TextRun,
      ImageRun,
      BorderStyle,
      AlignmentType,
      WidthType,
      ShadingType,
      PageBreak,
      HeadingLevel,
      UnderlineType,
      Header,
      Footer,
      PageNumber,
      convertInchesToTwip,
    } = window.docx;

    // ===========================
    // GAMIFICATION COLORS (RGB to HEX)
    // ===========================
    const COLORS = Object.freeze({
      primary: "6A5ACD", // Slate Blue
      secondary: "FFD700", // Gold
      accent: "FF69B4", // Hot Pink

      success: "2ED573", // Bright Green
      error: "FF4757", // Bright Red
      warning: "FFA801", // Amber
      info: "34ACE0", // Sky Blue

      cardBg: "F8FAFC", // Light Gray
      cardBorder: "6A5ACD", // Matches primary

      textDark: "1E293B", // Dark Slate
      textLight: "64748B", // Light Slate
      textWhite: "FFFFFF", // White

      buttonCorrect: "10B981", // Emerald
      buttonWrong: "EF4444", // Red
      buttonNeutral: "CBD5E1", // Slate 300

      progressBarBg: "E2E8F0", // Light gray
      progressBarFill: "FFD700", // Gold
    });

    // ===========================
    // UTILITY FUNCTIONS
    // ===========================

    const sanitizeText = (text) => {
      if (!text) return "";
      return String(text).trim();
    };

    const isEssayQuestion = (q) => q.options && q.options.length === 1;

    // ===========================
    // IMAGE PROCESSING
    // ===========================

    const processImageForWord = async (imageSource) => {
      try {
        let imageData = imageSource;

        // Convert SVG to PNG if needed
        if (
          imageSource.includes("<svg") ||
          imageSource.includes("data:image/svg+xml")
        ) {
          imageData = await svgToDataUrl(imageSource);
        } else if (!imageSource.startsWith("data:")) {
          imageData = await getDataUrl(imageSource);
        }

        // Fetch the image as blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        // Get dimensions
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageData;
        });

        // Calculate constrained dimensions (max width: 6 inches for Word)
        const maxWidthInches = 6;
        const maxHeightInches = 4;
        const { width, height } = getConstrainedDimensionsWord(
          img.width,
          img.height,
          maxWidthInches * 96, // Convert to pixels
          maxHeightInches * 96,
        );

        return {
          data: arrayBuffer,
          width: width,
          height: height,
          success: true,
        };
      } catch (err) {
        console.warn("Failed to process image for Word:", err);
        return { success: false };
      }
    };

    const getDataUrl = async (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });
    };

    const svgToDataUrl = async (svgString) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width || 800;
          canvas.height = img.height || 600;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL("image/png"));
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to convert SVG"));
        };

        img.src = url;
      });
    };

    const getConstrainedDimensionsWord = (
      imgWidth,
      imgHeight,
      maxWidth,
      maxHeight,
    ) => {
      const aspectRatio = imgWidth / imgHeight;
      let width = maxWidth;
      let height = width / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      return { width, height };
    };

    // ===========================
    // SCORE CALCULATION
    // ===========================

    const calculateScore = () => {
      let correct = 0,
        wrong = 0,
        skipped = 0,
        essayCount = 0,
        totalScorable = 0;

      questions.forEach((q, i) => {
        const userAns = userAnswers[i];
        if (isEssayQuestion(q)) {
          essayCount++;
        } else {
          totalScorable++;
          if (userAns === undefined || userAns === null) {
            skipped++;
          } else if (userAns === q.correct) {
            correct++;
          } else {
            wrong++;
          }
        }
      });

      const percentage =
        totalScorable > 0 ? Math.round((correct / totalScorable) * 100) : 0;
      const isPassing = percentage >= 70;

      return {
        correct,
        wrong,
        skipped,
        essayCount,
        totalScorable,
        percentage,
        isPassing,
      };
    };

    const scoreData = calculateScore();
    const isSummaryMode =
      userAnswers &&
      (Array.isArray(userAnswers)
        ? userAnswers.length > 0
        : Object.keys(userAnswers).length > 0);

    // ===========================
    // DOCUMENT SECTIONS
    // ===========================

    const sections = [];
    const children = [];

    // ===========================
    // TITLE PAGE / HEADER
    // ===========================

    // Main Title
    children.push(
      new Paragraph({
        text: sanitizeText(config.title || "Quiz Quest"),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
        style: "Title",
        children: [
          new TextRun({
            text: sanitizeText(config.title || "Quiz Quest"),
            bold: true,
            size: 48,
            color: COLORS.primary,
          }),
        ],
      }),
    );

    // Player Name
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({
            text: `Student: ${currentName}`,
            bold: true,
            size: 28,
            color: COLORS.secondary,
          }),
        ],
      }),
    );

    // Decorative Line
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 300 },
        border: {
          bottom: {
            color: COLORS.secondary,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 24,
          },
        },
      }),
    );

    // ===========================
    // SCORE PAGE (if summary mode)
    // ===========================

    if (isSummaryMode) {
      // "QUIZ COMPLETE!" Banner
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 200 },
          children: [
            new TextRun({
              text: "🎯 QUIZ COMPLETE! 🎯",
              bold: true,
              size: 40,
              color: COLORS.primary,
            }),
          ],
        }),
      );

      // Score Circle (simulated with text)
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: `${scoreData.percentage}%`,
              bold: true,
              size: 72,
              color: scoreData.isPassing ? COLORS.success : COLORS.warning,
            }),
          ],
        }),
      );

      // Motivational Message
      const message = scoreData.isPassing
        ? "🏆 LEGENDARY! 🏆"
        : "💪 KEEP GRINDING! 💪";
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: message,
              bold: true,
              size: 36,
              color: COLORS.primary,
            }),
          ],
        }),
      );

      // Stats Table
      const statsTable = new Table({
        width: { size: 80, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        borders: {
          top: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
          bottom: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
          left: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
          right: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: `Score: ${scoreData.correct} / ${scoreData.totalScorable}`,
                        bold: true,
                        size: 24,
                        color: COLORS.textDark,
                      }),
                    ],
                  }),
                ],
                shading: { fill: COLORS.cardBg, type: ShadingType.CLEAR },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: `✓ Correct: ${scoreData.correct}  ✗ Wrong: ${scoreData.wrong}  ⊝ Skipped: ${scoreData.skipped}`,
                        size: 20,
                        color: COLORS.textLight,
                      }),
                    ],
                  }),
                ],
                shading: { fill: COLORS.cardBg, type: ShadingType.CLEAR },
              }),
            ],
          }),
        ],
      });

      children.push(
        new Paragraph({
          spacing: { before: 200, after: 400 },
          children: [],
        }),
      );
      children.push(statsTable);

      // Section Divider
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
          border: {
            bottom: {
              color: COLORS.primary,
              space: 1,
              style: BorderStyle.DOUBLE,
              size: 12,
            },
          },
        }),
      );
    }

    // ===========================
    // RENDER QUESTIONS
    // ===========================

    for (const [index, question] of questions.entries()) {
      const isEssay = isEssayQuestion(question);
      const userAns = userAnswers[index];
      const questionText = sanitizeText(question.q);

      // Question Header Paragraph
      const questionHeaderChildren = [
        new TextRun({
          text: `Question #${index + 1}`,
          bold: true,
          size: 24,
          color: COLORS.primary,
        }),
      ];

      // Add status badge if in summary mode
      if (isSummaryMode) {
        const { statusText, statusColor } = getQuestionStatus(
          question,
          userAns,
          isEssay,
        );
        questionHeaderChildren.push(
          new TextRun({
            text: `       [${statusText}]`,
            bold: true,
            size: 20,
            color: statusColor,
          }),
        );
      }

      const questionHeader = new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 100, after: 100 },
        children: questionHeaderChildren,
      });

      // Question Text
      const questionParagraph = new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({
            text: questionText,
            size: 24,
            color: COLORS.textDark,
          }),
        ],
      });

      // Card Children (goes inside the table cell)
      const cardChildren = [questionHeader, questionParagraph];

      // Process and add image if exists
      if (question.image) {
        const imageInfo = await processImageForWord(question.image);
        if (imageInfo.success) {
          cardChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
              children: [
                new ImageRun({
                  data: imageInfo.data,
                  transformation: {
                    width: imageInfo.width,
                    height: imageInfo.height,
                  },
                }),
              ],
            }),
          );
        }
      }

      // Render options
      if (isEssay) {
        // Essay Answer
        const userText = sanitizeText(userAns || "Not answered");
        const formalAnswer = sanitizeText(question.options[0]);

        // User Answer Box
        cardChildren.push(
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "YOUR ANSWER:",
                bold: true,
                size: 20,
                color: COLORS.primary,
              }),
            ],
          }),
        );

        cardChildren.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: userText,
                size: 20,
                color: COLORS.textDark,
              }),
            ],
            shading: { fill: "F5F7FA", type: ShadingType.CLEAR },
            border: {
              top: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.textLight,
              },
              bottom: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.textLight,
              },
              left: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.textLight,
              },
              right: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.textLight,
              },
            },
          }),
        );

        // Formal Answer Box
        cardChildren.push(
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "CORRECT ANSWER:",
                bold: true,
                size: 20,
                color: COLORS.success,
              }),
            ],
          }),
        );

        cardChildren.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: formalAnswer,
                size: 20,
                color: COLORS.textDark,
              }),
            ],
            shading: { fill: "F0FDF4", type: ShadingType.CLEAR },
            border: {
              top: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.success,
              },
              bottom: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.success,
              },
              left: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.success,
              },
              right: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.success,
              },
            },
          }),
        );
      } else {
        // Multiple Choice Options
        question.options.forEach((opt, optIndex) => {
          const isUserAns = optIndex === userAns;
          const isCorrectAns = optIndex === question.correct;
          const sanitizedOption = sanitizeText(opt);

          const prefix = String.fromCharCode(65 + optIndex);
          let marker = "";
          let bgColor = COLORS.buttonNeutral;
          let textColor = COLORS.textDark;

          if (isCorrectAns) {
            marker = "✓ ";
            bgColor = COLORS.buttonCorrect;
            textColor = COLORS.textWhite;
          } else if (isUserAns) {
            marker = "✗ ";
            bgColor = COLORS.buttonWrong;
            textColor = COLORS.textWhite;
          }

          const displayText = `${marker}${prefix}. ${sanitizedOption}`;

          cardChildren.push(
            new Paragraph({
              spacing: { before: 100, after: 100 },
              children: [
                new TextRun({
                  text: displayText,
                  bold: isCorrectAns,
                  size: 22,
                  color: textColor,
                }),
              ],
              shading: { fill: bgColor, type: ShadingType.CLEAR },
              border: {
                top: { style: BorderStyle.SINGLE, size: 6, color: bgColor },
                bottom: { style: BorderStyle.SINGLE, size: 6, color: bgColor },
                left: { style: BorderStyle.SINGLE, size: 6, color: bgColor },
                right: { style: BorderStyle.SINGLE, size: 6, color: bgColor },
              },
            }),
          );
        });
      }

      // Add explanation if exists
      if (question.explanation) {
        const expText = sanitizeText(question.explanation);
        cardChildren.push(
          new Paragraph({
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({
                text: "💡 EXPLANATION:",
                bold: true,
                size: 20,
                color: COLORS.warning,
              }),
            ],
          }),
        );

        cardChildren.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: expText,
                size: 20,
                color: COLORS.textDark,
              }),
            ],
            shading: { fill: "FFFBEB", type: ShadingType.CLEAR },
            border: {
              top: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.warning,
              },
              bottom: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.warning,
              },
              left: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.warning,
              },
              right: {
                style: BorderStyle.SINGLE,
                size: 3,
                color: COLORS.warning,
              },
            },
          }),
        );
      }

      // Create Question Card (Table)
      const questionCard = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: {
            style: BorderStyle.DOUBLE,
            size: 24,
            color: COLORS.cardBorder,
          },
          bottom: {
            style: BorderStyle.DOUBLE,
            size: 24,
            color: COLORS.cardBorder,
          },
          left: {
            style: BorderStyle.DOUBLE,
            size: 24,
            color: COLORS.cardBorder,
          },
          right: {
            style: BorderStyle.DOUBLE,
            size: 24,
            color: COLORS.cardBorder,
          },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: cardChildren,
                shading: { fill: COLORS.cardBg, type: ShadingType.CLEAR },
                margins: {
                  top: convertInchesToTwip(0.2),
                  bottom: convertInchesToTwip(0.2),
                  left: convertInchesToTwip(0.2),
                  right: convertInchesToTwip(0.2),
                },
              }),
            ],
            cantSplit: true, // Prevent splitting across pages
          }),
        ],
      });

      children.push(
        new Paragraph({
          spacing: { before: 400, after: 400 },
          children: [],
        }),
      );
      children.push(questionCard);
    }

    // ===========================
    // HELPER: Get Question Status
    // ===========================

    function getQuestionStatus(question, userAns, isEssay) {
      if (isEssay) {
        return { statusText: "ESSAY", statusColor: COLORS.warning };
      }

      const isSkipped = userAns === undefined || userAns === null;
      if (isSkipped) {
        return { statusText: "SKIPPED", statusColor: COLORS.textLight };
      }

      const isCorrect = userAns === question.correct;
      return isCorrect
        ? { statusText: "CORRECT", statusColor: COLORS.success }
        : { statusText: "WRONG", statusColor: COLORS.error };
    }

    // ===========================
    // CTA PAGE
    // ===========================

    children.push(new Paragraph({ children: [new PageBreak()] }));

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 200 },
        children: [
          new TextRun({
            text: "🎮 End 🎮",
            bold: true,
            size: 64,
            color: COLORS.primary,
          }),
        ],
      }),
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: "READY FOR MORE?",
            bold: true,
            size: 40,
            color: COLORS.primary,
          }),
        ],
      }),
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: "Continue your journey with more challenges!",
            size: 24,
            color: COLORS.textLight,
          }),
        ],
      }),
    );

    // CTA Button (simulated)
    const ctaTable = new Table({
      width: { size: 60, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 12, color: COLORS.primary },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.primary },
        left: { style: BorderStyle.SINGLE, size: 12, color: COLORS.primary },
        right: { style: BorderStyle.SINGLE, size: 12, color: COLORS.primary },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "PLAY MORE QUIZZES",
                      bold: true,
                      size: 28,
                      color: COLORS.textWhite,
                    }),
                  ],
                }),
              ],
              shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
            }),
          ],
        }),
      ],
    });

    children.push(ctaTable);

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 300 },
        children: [
          new TextRun({
            text: "https://divquizzes.vercel.app/",
            bold: true,
            size: 24,
            color: COLORS.info,
            underline: {
              type: UnderlineType.SINGLE,
              color: COLORS.info,
            },
          }),
        ],
      }),
    );

    // ===========================
    // FOOTER
    // ===========================

    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Crafted by Belal Amr | Page ",
              size: 18,
              color: COLORS.textLight,
            }),
            new TextRun({
              children: [PageNumber.CURRENT],
              size: 18,
              color: COLORS.textLight,
            }),
          ],
        }),
      ],
    });

    // ===========================
    // CREATE DOCUMENT
    // ===========================

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.75),
                right: convertInchesToTwip(0.75),
                bottom: convertInchesToTwip(0.75),
                left: convertInchesToTwip(0.75),
              },
            },
          },
          footers: {
            default: footer,
          },
          children: children,
        },
      ],
    });

    // ===========================
    // SAVE DOCUMENT
    // ===========================

    const blob = await Packer.toBlob(doc);
    const filename = `${sanitizeText(config.title)}.docx`;

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Gamified Word document exported: ${filename}`);

    return { success: true, filename };
  } catch (error) {
    console.error("Word Export Error:", error);
    alert(`Failed to export Word document: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function exportToHtml(config, questions, userAnswers = []) {
  // Convert local images to base64
  const processedQuestions = await convertImagesToBase64(questions);

  let hasMCQ = false,
    hasTrueFalse = false,
    hasEssay = false;
  processedQuestions.forEach((q) => {
    if (isEssayQuestion(q)) hasEssay = true;
    else if (q.options.length === 2) hasTrueFalse = true;
    else hasMCQ = true;
  });

  let questionType = "Multiple Choice";
  if (hasEssay && !hasMCQ && !hasTrueFalse) questionType = "Essay/Definitions";
  else if (hasEssay) questionType = "Mixed (MCQ, True/False, Essay)";

  const date = new Date().toLocaleDateString();

  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title || "Quiz Examination"}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #e0e0e0; background: #121212; }
        h1 { color: #ffffff; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; text-align: center; }
        .meta { text-align: center; color: #888; margin-bottom: 40px; font-style: italic; }
        .question-card { background: #1e1e1e; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid #333; }
        .q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 0.9rem; color: #aaa; }
        .q-text { font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 20px; }
        .options-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .option { padding: 10px 15px; margin-bottom: 8px; border-radius: 6px; background: rgba(255,255,255,0.05); font-size: 0.95rem; }
        .user-answer { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6; font-weight: 600; margin-top: 15px; padding: 12px 15px; border-radius: 8px; }
        .user-answer.wrong { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
        .user-answer.skipped { background: rgba(156, 163, 175, 0.2); color: #9ca3af; border: 1px solid #6b7280; }
        .correct-answer { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; font-weight: 600; margin-top: 15px; padding: 12px 15px; border-radius: 8px; }
        .explanation { margin-top: 15px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; color: #dbeafe; font-size: 0.95rem; }
        .essay-box { background: #2a2a2a; padding: 15px; border-radius: 8px; border-left: 3px solid #f59e0b; margin-top: 10px; }
        .question-image { max-width: 100%; height: auto; display: block; margin: 10px auto; border-radius: 8px; border: 1px solid #333; }
        .footer { text-align: center; margin-top: 50px; color: #888; font-size: 0.8rem; border-top: 1px solid #333; padding-top: 20px; }
    </style>
</head>
<body>
    <h1>${config.title || "Quiz Examination"}</h1>
    <div class="meta">Total Questions: ${
      processedQuestions.length
    } • Type: ${questionType} • Date: ${date}</div>
`;

  // Determine if we are in "Summary Mode" (user answers provided)
  const isSummaryMode =
    userAnswers &&
    (Array.isArray(userAnswers)
      ? userAnswers.length > 0
      : Object.keys(userAnswers).length > 0);

  processedQuestions.forEach((q, index) => {
    const userAns = userAnswers[index];
    const isSkipped = userAns === undefined || userAns === null;
    const isCorrect =
      !isSkipped && userAns === q.correct && !isEssayQuestion(q);

    htmlContent += `
    <div class="question-card">
        <div class="q-header">
            <span>Question ${index + 1}</span>
            <span>${isEssayQuestion(q) ? "Essay" : "MCQ"}</span>
        </div>
        ${q.image ? `<img src="${q.image}" class="question-image" alt="Question Image" onerror="this.alt='[Image not available]'; this.style.border='2px dashed #666';">` : ""}
        <div class="q-text">${q.q}</div>`;

    if (isEssayQuestion(q)) {
      const userText = userAns || "Not answered";
      if (isSummaryMode)
        htmlContent += `
        <div class="essay-box" style="border-left: 3px solid #3b82f6;">
            <strong style="color: #60a5fa; display:block; margin-bottom:5px;">Your Answer:</strong>
            ${userText}
        </div>`;

      htmlContent += `<div class="essay-box">
            <strong style="color: #f59e0b; display:block; margin-bottom:5px;">Formal Answer / Key Points:</strong>
            ${q.options[0]}
        </div>`;
    } else {
      htmlContent += `<div class="options-list">`;
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        htmlContent += `<div class="option"><strong>${letter}.</strong> ${opt}</div>`;
      });
      htmlContent += `</div>`;

      const userClass = isSkipped ? "skipped" : isCorrect ? "" : "wrong";
      const userLetter = isSkipped ? "" : String.fromCharCode(65 + userAns);
      const userAnswer = isSkipped
        ? "Skipped"
        : `${userLetter}. ${q.options[userAns]}`;
      const userIcon = isSkipped ? "⚪" : isCorrect ? "✅" : "❌";

      if (isSummaryMode)
        htmlContent += `<div class="user-answer ${userClass}">${userIcon} Your Answer: ${userAnswer}</div>`;

      const correctLetter = String.fromCharCode(65 + q.correct);
      htmlContent += `<div class="correct-answer">✓ Correct Answer: ${correctLetter}. ${
        q.options[q.correct]
      }</div>`;
    }

    if (q.explanation) {
      htmlContent += `<div class="explanation"><strong>💡 Explanation:</strong> ${q.explanation}</div>`;
    }

    htmlContent += `</div>`;
  });

  htmlContent += `<div class="footer">Generated by Quiz App</div></body></html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${config.title || "quiz_export"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(config, questions, userAnswers = []) {
  let hasMCQ = false,
    hasTrueFalse = false,
    hasEssay = false;

  questions.forEach((q) => {
    if (isEssayQuestion(q)) hasEssay = true;
    else if (q.options.length === 2) hasTrueFalse = true;
    else hasMCQ = true;
  });

  let questionType = "";
  if (hasEssay && !hasMCQ && !hasTrueFalse) questionType = "Essay/Definitions";
  else if (hasEssay) questionType = "Mixed (MCQ, True/False, Essay)";
  else if (hasMCQ && hasTrueFalse) questionType = "MCQ and True/False";
  else if (hasTrueFalse) questionType = "True/False only";
  else questionType = "MCQ only";

  // Determine if we are in "Summary Mode" (user answers provided)
  const isSummaryMode =
    userAnswers &&
    (Array.isArray(userAnswers)
      ? userAnswers.length > 0
      : Object.keys(userAnswers).length > 0);

  let markdown = `# ${config.title || "Quiz"}\n**Number of questions:** ${
    questions.length
  }\n**Questions' type:** ${questionType}\n\n---\n\n`;

  questions.forEach((q, index) => {
    const userAns = userAnswers[index];
    let imageLink = "";

    if (q.image) {
      imageLink = !isLocalPath(q.image)
        ? `![Question Image](${q.image})\n\n`
        : `[![Image Can't be Displayed](https://i.postimg.cc/NMdJJNzY/no-image.jpg)](https://postimg.cc/dkTjD9FS)\n\n`;
    }

    markdown += `## Question ${index + 1}: ${q.q}\n${imageLink}\n\n`;

    if (isEssayQuestion(q)) {
      // Only show user answer section if userAnswers was actually passed
      if (isSummaryMode) {
        const userText = userAns || "Not answered";
        markdown += `**Your Answer:**\n\n${userText}\n\n`;
      }
      markdown += `**Formal Answer:**\n\n${q.options[0]}\n\n`;
    } else {
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(48 + i + 1);
        markdown += `${letter}. ${opt}\n`;
      });
      markdown += `\n`;

      const isSkipped = userAns === undefined || userAns === null;

      // Only append "Your Answer" if we are in summary mode
      if (isSummaryMode) {
        const userLetter = isSkipped
          ? "Skipped"
          : String.fromCharCode(48 + userAns + 1);
        const userAnswerText = isSkipped ? "Skipped" : q.options[userAns];

        markdown += `**Your Answer:** ${userLetter}${
          isSkipped ? "" : `. ${userAnswerText}`
        }\n\n`;
      }

      const correctLetter = String.fromCharCode(48 + q.correct + 1);
      markdown += `**Correct Answer:** ${correctLetter}. ${
        q.options[q.correct]
      }\n\n`;
    }

    if (q.explanation) markdown += `> **Explanation:**\n${q.explanation}\n\n`;
    markdown += `---\n\n`;
  });

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${config.title || "quiz_export"}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
