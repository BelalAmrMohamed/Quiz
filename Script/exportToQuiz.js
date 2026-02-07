// Script/exportToQuiz.js
// Downloads the quiz as a standalone file (.html)
// Deals with the export from both main page and results/summary page
// No libraries used.

export async function exportToQuiz(config, questions) {
  const processedQuestions = await convertImagesToBase64(questions);

  const quizHTML = `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHTML(config.description || "Interactive quiz platform")}">
  <title>${escapeHTML(config.title || "Practice Quiz")}</title>
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
    --warning: #ed8936;
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
    --shadow: rgba(0, 0, 0, 0.3);
    --shadow-lg: rgba(0, 0, 0, 0.5);
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    min-height: 100vh;
    padding: 20px;
    transition: background 0.3s ease;
    position: relative;
  }
  
  /* Wave animation background */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    z-index: -2;
  }
  
  .waves {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 15vh;
    min-height: 100px;
    max-height: 150px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
  }
  
  .waves.active {
    opacity: 1;
  }
  
  .parallax > use {
    animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
  }
  
  .parallax > use:nth-child(1) {
    animation-delay: -2s;
    animation-duration: 7s;
  }
  
  .parallax > use:nth-child(2) {
    animation-delay: -3s;
    animation-duration: 10s;
  }
  
  .parallax > use:nth-child(3) {
    animation-delay: -4s;
    animation-duration: 13s;
  }
  
  .parallax > use:nth-child(4) {
    animation-delay: -5s;
    animation-duration: 20s;
  }
  
  @keyframes move-forever {
    0% { transform: translate3d(-90px, 0, 0); }
    100% { transform: translate3d(85px, 0, 0); }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .parallax > use {
      animation: none;
    }
  }
  
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--gradient-start);
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    border-radius: 0 0 4px 0;
    z-index: 2000;
  }
  
  .skip-link:focus {
    top: 0;
  }
  
  /* Fixed hamburger menu button */
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
  
  .menu-toggle:focus {
    outline: 2px solid white;
    outline-offset: 2px;
  }
  
  .menu-toggle span {
    display: block;
    width: 24px;
    height: 3px;
    background: #fff;
    border-radius: 2px;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .menu-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }
  
  .menu-toggle.active span:nth-child(2) {
    opacity: 0;
  }
  
  .menu-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }
  
  .side-menu {
    position: fixed;
    top: 0;
    right: -320px;
    width: 320px;
    height: 100vh;
    background: var(--bg-primary);
    box-shadow: -4px 0 20px var(--shadow-lg);
    z-index: 1000;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    left: 0;
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
  
  .toggle-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    background: var(--bg-secondary);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 12px;
  }
  
  .toggle-option:hover {
    background: var(--bg-tertiary);
    transform: translateX(2px);
  }
  
  .toggle-label {
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
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 2px 4px var(--shadow);
  }
  
  .toggle-switch.active .toggle-slider {
    transform: translateX(24px);
  }
  
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
    position: relative;
    min-height: 44px;
  }
  
  .nav-btn:hover {
    border-color: var(--gradient-start);
    background: var(--card-answered);
    transform: scale(1.05);
  }
  
  .nav-btn:focus {
    outline: 2px solid var(--gradient-start);
    outline-offset: 2px;
  }
  
  .nav-btn.answered {
    background: var(--card-answered);
    border-color: var(--gradient-start);
    color: var(--gradient-start);
  }
  
  .nav-btn.flagged::after {
    content: '🚩';
    position: absolute;
    top: -5px;
    right: -5px;
    font-size: 12px;
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
    position: relative;
    z-index: 1;
  }
  
  .header {
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    color: #fff;
    padding: 30px;
    text-align: center;
    position: relative;
  }
  
  .header h1 {
    font-size: 28px;
    margin-bottom: 10px;
  }
  
  .header-meta {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    opacity: 0.9;
    font-size: 14px;
    margin-bottom: 15px;
  }
  
  .quiz-timer {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(255, 255, 255, 0.2);
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
  }
  
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
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 4px;
  }
  
  .progress-bar.updating {
    animation: progress-pulse 0.5s ease-out;
  }
  
  @keyframes progress-pulse {
    0%, 100% { opacity: 1; }
    50% { 
      opacity: 0.7; 
      box-shadow: 0 0 20px rgba(72, 187, 120, 0.8);
    }
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
    scroll-margin-top: 20px;
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
  
  .question-actions {
    display: flex;
    gap: 10px;
    align-items: center;
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
  
  .flag-btn {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    transition: transform 0.2s;
    padding: 4px 8px;
  }
  
  .flag-btn:hover {
    transform: scale(1.2);
  }
  
  .flag-btn:focus {
    outline: 2px solid var(--gradient-start);
    border-radius: 4px;
  }
  
  .question-text {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--text-primary);
    line-height: 1.6;
  }
  
  .question-image-container {
    margin-bottom: 20px;
    text-align: center;
    position: relative;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .skeleton-loader {
    width: 100%;
    height: 200px;
    background: linear-gradient(
      90deg,
      var(--bg-secondary) 25%,
      var(--bg-tertiary) 50%,
      var(--bg-secondary) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 12px;
    position: absolute;
    top: 0;
    left: 0;
  }
  
  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  .question-image {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    border: 2px solid var(--border-color);
    box-shadow: 0 2px 8px var(--shadow);
    opacity: 0;
    transition: opacity 0.3s ease;
    display: block;
    margin: 0 auto;
  }
  
  .question-image.loaded {
    opacity: 1;
    animation: fade-in 0.3s ease-in;
  }
  
  @keyframes fade-in {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
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
    position: relative;
    overflow: hidden;
    min-height: 44px;
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
  
  .option-btn.selecting {
    animation: select-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  @keyframes select-bounce {
    0% { transform: scale(1) translateX(0); }
    50% { transform: scale(1.05) translateX(8px); }
    100% { transform: scale(1) translateX(5px); }
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
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
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
    position: relative;
    overflow: hidden;
    min-height: 44px;
  }
  
  .btn:focus {
    outline: 2px solid var(--gradient-start);
    outline-offset: 2px;
  }
  
  .btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  .btn:active::before {
    width: 300px;
    height: 300px;
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
  
  /* Attemting to fix the misalignment */
  .modal-btn{
    display: block;
    margin: 0 auto;
    margin-top: 20px;
  }
  
  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: var(--border-color);
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn.loading .btn-text {
    display: none;
  }
  
  .btn.loading .btn-loader {
    display: inline-flex !important;
  }
  
  .btn-loader {
    display: none;
  }
  
  .spinner {
    width: 20px;
    height: 20px;
    animation: rotate 2s linear infinite;
  }
  
  .spinner circle {
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }
  
  @keyframes rotate {
    100% { transform: rotate(360deg); }
  }
  
  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
  
  .results {
    padding: 30px;
    text-align: center;
    display: none;
  }
  
  .results.show {
    display: block;
    animation: fadeIn 0.5s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
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
    animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  @keyframes scaleIn {
    from { transform: scale(0); }
    to { transform: scale(1); }
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
    max-width: 500px;
    width: 90%;
    margin: 20px;
    box-shadow: 0 20px 60px var(--shadow-lg);
    animation: modalSlideIn 0.3s ease;
    max-height: 80vh;
    overflow-y: auto;
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
    flex-wrap: wrap;
  }
  
  .review-summary {
    text-align: left;
  }
  
  .review-summary .warning {
    color: var(--warning);
    background: #fffaf0;
    padding: 10px;
    border-radius: 8px;
    margin: 10px 0;
  }
  
  [data-theme="dark"] .review-summary .warning {
    background: #3d2817;
  }
  
  .review-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    flex-wrap: wrap;
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
  
  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--bg-primary);
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 2000;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    max-width: 90%;
  }
  
  .toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  
  .toast-success {
    border-left: 4px solid var(--success);
  }
  
  .toast-info {
    border-left: 4px solid var(--info);
  }
  
  .toast-icon {
    font-size: 20px;
  }
  
  .toast-message {
    color: var(--text-primary);
  }
  
  @media print {
    body {
      background: white;
      padding: 0;
    }
    
    .menu-toggle, .side-menu, .side-menu-overlay,
    .controls, .waves, .toast, .skip-link {
      display: none !important;
    }
    
    .container {
      box-shadow: none;
      border-radius: 0;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .question-card {
      page-break-inside: avoid;
      border: 1px solid #ddd;
      margin-bottom: 20px;
    }
    
    .option-btn {
      border: 1px solid #ddd;
      background: white !important;
    }
    
    .flag-btn {
      display: none;
    }
  }
  
  @media (max-width: 600px) {
    body {
      padding: 0;
    }
    
    .container {
      border-radius: 0;
    }
    
    .header {
      padding: 20px;
    }
    
    .header h1 {
      font-size: 24px;
    }
    
    .header-meta {
      font-size: 13px;
      gap: 10px;
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
    
    .option-btn {
      padding: 18px 20px;
    }
    
    .side-menu {
      top: auto;
      bottom: -100%;
      right: 0;
      left: 0;
      width: 100%;
      height: 70vh;
      border-radius: 20px 20px 0 0;
      transition: bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .side-menu.open {
      bottom: 0;
      right: 0;
    }
    
    .side-menu::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 4px;
      background: var(--border-color);
      border-radius: 2px;
    }
    
    .nav-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .menu-toggle {
      width: 45px;
      height: 45px;
    }
    
    .modal-content {
      width: 95%;
      padding: 20px;
    }
    
    .toast {
      left: 20px;
      right: 20px;
      transform: translateX(0) translateY(100px);
    }
    
    .toast.show {
      transform: translateX(0) translateY(0);
    }
    
    .controls {
      padding: 15px;
    }
    
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  .live-region {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
  </style>
  </head>
  <body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <div class="live-region" aria-live="polite" aria-atomic="true" id="liveRegion"></div>
  
  <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false">
    <span></span>
    <span></span>
    <span></span>
  </button>
  
  <div class="side-menu-overlay" id="menuOverlay"></div>
  
  <div class="side-menu" id="sideMenu" role="dialog" aria-label="Quiz navigation menu">
    <div class="side-menu-header">
      <h2>Quiz Navigator</h2>
      <p>Jump to any question</p>
    </div>
    
    <div class="side-menu-content">
      <div class="menu-section">
        <h3>Settings</h3>
        
        <div class="toggle-option" id="darkModeToggle" role="switch" aria-checked="false" tabindex="0">
          <div class="toggle-label">
            <span id="themeIcon" aria-hidden="true">🌙</span>
            <span>Dark Mode</span>
          </div>
          <div class="toggle-switch" id="darkModeSwitch">
            <div class="toggle-slider"></div>
          </div>
        </div>
        
        <div class="toggle-option" id="animationToggle" role="switch" aria-checked="false" tabindex="0">
          <div class="toggle-label">
            <span aria-hidden="true">🌊</span>
            <span>Wave Animation</span>
          </div>
          <div class="toggle-switch" id="animationSwitch">
            <div class="toggle-slider"></div>
          </div>
        </div>
      </div>
      
      <div class="menu-section">
        <h3>Actions</h3>
        <button class="btn btn-secondary" onclick="quizApp.printQuiz()" style="width: 100%;">
          🖨️ Print Quiz
        </button>
      </div>
      
      <div class="menu-section">
        <h3>Questions</h3>
        <div class="nav-grid" id="navGrid"></div>
      </div>
    </div>
  </div>
  
  <svg class="waves" id="wavesAnimation" xmlns="http://www.w3.org/2000/svg" 
       viewBox="0 24 150 28" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
    </defs>
    <g class="parallax">
      <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
      <use href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
      <use href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
      <use href="#gentle-wave" x="48" y="7" fill="#fff" />
    </g>
  </svg>
  
  <div class="container">
    <header class="header">
      <h1>${escapeHTML(config.title || "Practice Quiz")}</h1>
      <div class="header-meta">
        <span>📝 ${questions.length} Questions</span>
        <span class="quiz-timer">⏱️ <span id="timerDisplay">0:00</span></span>
        <span>🎯 Practice Mode</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar" id="progressBar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      <div class="progress-text" id="progressText">0 of ${questions.length} answered</div>
    </header>
    
    <main id="main-content" class="quiz-body"></main>
    
    <div class="controls">
      <button class="btn btn-secondary" onclick="quizApp.enterReviewMode()" id="reviewBtn">
        👁️ Review
      </button>
      <button class="btn btn-secondary" onclick="quizApp.reset()">
        🔄 Reset Quiz
      </button>
      <button class="btn btn-primary" onclick="quizApp.submit()" id="submitBtn">
        <span class="btn-text">✓ Submit Quiz</span>
        <span class="btn-loader">
          <svg class="spinner" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
          </svg>
        </span>
      </button>
    </div>
    
    <div id="results" class="results" role="region" aria-label="Quiz results"></div>
  </div>
  
  <div id="modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-content">
      <h3 id="modalTitle">Confirm Action</h3>
      <div id="modalBody"></div>
      <div class="modal-buttons">
        <button class="btn btn-secondary modal-btn" onclick="quizApp.closeModal()">Cancel</button>
        <button class="btn btn-primary modal-btn" id="modalConfirm">Confirm</button>
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
    animationsEnabled: false,
    flaggedQuestions: new Set(),
    quizStartTime: null,
    timerInterval: null,
    touchStartX: 0,
    touchEndX: 0,
  
    init() {
      this.loadPreferences();
      this.loadProgress();
      this.renderQuiz();
      this.renderNav();
      this.updateProgress();
      this.setupMenuToggle();
      this.setupToggles();
      this.setupKeyboardNavigation();
      this.setupTouchGestures();
      this.setupModalClickOutside();
      this.startQuizTimer();
      this.setupImageLoading();
      this.announceToScreenReader('Quiz loaded. ' + questions.length + ' questions available.');
    },
  
    loadPreferences() {
      const savedTheme = localStorage.getItem('quizTheme');
      const savedAnimation = localStorage.getItem('quizAnimation');
      
      this.darkMode = savedTheme === 'dark';
      this.animationsEnabled = savedAnimation === 'true';
      
      this.applyTheme();
      this.applyAnimation();
    },
  
    applyTheme() {
      if (this.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeIcon').textContent = '☀️';
        document.getElementById('darkModeToggle').setAttribute('aria-checked', 'true');
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeIcon').textContent = '🌙';
        document.getElementById('darkModeToggle').setAttribute('aria-checked', 'false');
      }
      
      const toggleSwitch = document.getElementById('darkModeSwitch');
      toggleSwitch.classList.toggle('active', this.darkMode);
    },
  
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('quizTheme', this.darkMode ? 'dark' : 'light');
      this.applyTheme();
      this.announceToScreenReader(this.darkMode ? 'Dark mode enabled' : 'Light mode enabled');
    },
  
    applyAnimation() {
      const waves = document.getElementById('wavesAnimation');
      const animSwitch = document.getElementById('animationSwitch');
      
      if (this.animationsEnabled) {
        waves.classList.add('active');
        animSwitch.classList.add('active');
        document.getElementById('animationToggle').setAttribute('aria-checked', 'true');
      } else {
        waves.classList.remove('active');
        animSwitch.classList.remove('active');
        document.getElementById('animationToggle').setAttribute('aria-checked', 'false');
      }
    },
  
    toggleAnimation() {
      this.animationsEnabled = !this.animationsEnabled;
      localStorage.setItem('quizAnimation', this.animationsEnabled.toString());
      this.applyAnimation();
      this.announceToScreenReader(this.animationsEnabled ? 'Animations enabled' : 'Animations disabled');
    },
  
    saveProgress() {
      const state = {
        answers: this.userAnswers,
        flagged: Array.from(this.flaggedQuestions),
        currentQuestion: this.currentQuestion,
        timestamp: Date.now()
      };
      localStorage.setItem('quiz_progress', JSON.stringify(state));
    },
  
    loadProgress() {
      const saved = localStorage.getItem('quiz_progress');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          const ageInHours = (Date.now() - state.timestamp) / (1000 * 60 * 60);
          
          if (ageInHours < 24) {
            this.userAnswers = state.answers || this.userAnswers;
            this.flaggedQuestions = new Set(state.flagged || []);
            this.currentQuestion = state.currentQuestion || 0;
            
            setTimeout(() => {
              this.restoreUIState();
              this.showToast('Previous progress restored', 'info');
            }, 500);
          }
        } catch (e) {
          console.error('Failed to load progress:', e);
        }
      }
    },
  
    restoreUIState() {
      this.userAnswers.forEach((ans, i) => {
        if (ans !== null) {
          const q = questions[i];
          if (this.isEssayQuestion(q)) {
            const textarea = document.getElementById(\`essay\${i}\`);
            if (textarea) {
              textarea.value = ans;
              this.updateCharCount(i, ans);
            }
          } else {
            const card = document.getElementById(\`q\${i}\`);
            if (card) {
              card.classList.add('answered');
              const buttons = card.querySelectorAll('.option-btn');
              buttons.forEach((btn, j) => {
                btn.classList.toggle('selected', j === ans);
              });
            }
          }
        }
      });
      
      this.flaggedQuestions.forEach(i => {
        this.updateFlagUI(i);
      });
      
      this.updateAllNavButtons();
    },
  
    startQuizTimer() {
      this.quizStartTime = Date.now();
      this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    },
  
    updateTimer() {
      if (!this.quizStartTime) return;
      const elapsed = Math.floor((Date.now() - this.quizStartTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      document.getElementById('timerDisplay').textContent = 
        \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
    },
  
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
  
    setupMenuToggle() {
      const menuToggle = document.getElementById('menuToggle');
      const overlay = document.getElementById('menuOverlay');
  
      menuToggle.addEventListener('click', () => this.toggleMenu());
      overlay.addEventListener('click', () => this.closeMenu());
    },
  
    setupToggles() {
      const darkModeToggle = document.getElementById('darkModeToggle');
      const animationToggle = document.getElementById('animationToggle');
  
      darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
      animationToggle.addEventListener('click', () => this.toggleAnimation());
      
      [darkModeToggle, animationToggle].forEach(toggle => {
        toggle.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle.click();
          }
        });
      });
    },
  
    toggleMenu() {
      const menuToggle = document.getElementById('menuToggle');
      const sideMenu = document.getElementById('sideMenu');
      const overlay = document.getElementById('menuOverlay');
      const isOpen = sideMenu.classList.contains('open');
  
      menuToggle.classList.toggle('active');
      sideMenu.classList.toggle('open');
      overlay.classList.toggle('show');
      
      menuToggle.setAttribute('aria-expanded', !isOpen);
      
      if (!isOpen) {
        this.trapFocus(sideMenu);
      }
    },
  
    closeMenu() {
      const menuToggle = document.getElementById('menuToggle');
      const sideMenu = document.getElementById('sideMenu');
      const overlay = document.getElementById('menuOverlay');
  
      menuToggle.classList.remove('active');
      sideMenu.classList.remove('open');
      overlay.classList.remove('show');
      menuToggle.setAttribute('aria-expanded', 'false');
    },
  
    toggleFlag(qIndex) {
      if (this.flaggedQuestions.has(qIndex)) {
        this.flaggedQuestions.delete(qIndex);
      } else {
        this.flaggedQuestions.add(qIndex);
      }
      this.updateFlagUI(qIndex);
      this.updateNavButton(qIndex);
      this.saveProgress();
      
      const isFlagged = this.flaggedQuestions.has(qIndex);
      this.announceToScreenReader(
        isFlagged ? 'Question flagged for review' : 'Question unflagged'
      );
    },
  
    updateFlagUI(qIndex) {
      const flagBtn = document.getElementById(\`flag\${qIndex}\`);
      if (flagBtn) {
        const isFlagged = this.flaggedQuestions.has(qIndex);
        flagBtn.textContent = isFlagged ? '🚩' : '⚑';
        flagBtn.setAttribute('aria-label', 
          isFlagged ? 'Unflag question' : 'Flag question for review');
      }
    },
  
    isEssayQuestion(question) {
      return question.options && question.options.length === 1;
    },
  
    renderQuestionImage(imageUrl, qIndex) {
      if (!imageUrl) return "";
      return \`
        <div class="question-image-container">
          <div class="skeleton-loader" id="skeleton\${qIndex}"></div>
          <img 
            src="\${this.escapeHTML(imageUrl)}" 
            alt="Question context image" 
            class="question-image"
            id="img\${qIndex}"
            data-index="\${qIndex}"
          />
        </div>
      \`;
    },
  
    setupImageLoading() {
      document.querySelectorAll('.question-image').forEach(img => {
        img.addEventListener('load', function() {
          const index = this.dataset.index;
          const skeleton = document.getElementById(\`skeleton\${index}\`);
          if (skeleton) skeleton.style.display = 'none';
          this.classList.add('loaded');
          this.style.display = 'block';
        });
        
        img.addEventListener('error', function() {
          this.parentElement.style.display = 'none';
        });
      });
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
        \`<button class="nav-btn" id="nav\${i}" 
           onclick="quizApp.jumpToQuestion(\${i})" 
           aria-label="Go to question \${i + 1}">
          \${i + 1}
        </button>\`
      ).join("");
      navGrid.innerHTML = navHtml;
      this.updateAllNavButtons();
    },
  
    renderQuiz() {
      const quizBody = document.querySelector(".quiz-body");
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
            oninput="quizApp.handleEssayInput(\${i}, this.value)"
            aria-label="Essay answer for question \${i + 1}"
          >\${savedAnswer}</textarea>
          <div class="char-count" id="charCount\${i}">
            \${savedAnswer.length} characters
          </div>
          <div class="model-answer" id="modelAns\${i}">
            <strong>✓ Model Answer:</strong><br>
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
                onkeydown="quizApp.handleOptionKeydown(event, \${i}, \${j})"
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
            <div class="question-actions">
              <div class="question-badge \${badgeClass}">\${badgeText}</div>
              <button class="flag-btn" id="flag\${i}" 
                      onclick="quizApp.toggleFlag(\${i})"
                      aria-label="Flag question for review">⚑</button>
            </div>
          </div>
          
          \${this.renderQuestionImage(q.image, i)}
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
        btn.classList.remove('selected', 'selecting');
        if (i === optIndex) {
          btn.classList.add("selected", "selecting");
          setTimeout(() => btn.classList.remove('selecting'), 400);
        }
      });
  
      this.updateProgress();
      this.updateNavButton(qIndex);
      this.saveProgress();
      
      this.announceToScreenReader(\`Option \${String.fromCharCode(65 + optIndex)} selected\`);
    },
  
    handleEssayInput(qIndex, value) {
      const trimmed = value.trim();
      this.userAnswers[qIndex] = trimmed || null;
      
      const card = document.getElementById(\`q\${qIndex}\`);
      card.classList.toggle("answered", !!trimmed);
      
      this.updateCharCount(qIndex, value);
      this.updateProgress();
      this.updateNavButton(qIndex);
      this.saveProgress();
    },
  
    updateCharCount(qIndex, value) {
      const charCount = document.getElementById(\`charCount\${qIndex}\`);
      if (charCount) {
        charCount.textContent = \`\${value.length} characters\`;
      }
    },
  
    updateProgress() {
      const answered = this.userAnswers.filter(a => a !== null).length;
      const total = questions.length;
      const percent = (answered / total) * 100;
  
      const progressBar = document.getElementById("progressBar");
      const progressText = document.getElementById("progressText");
      
      progressBar.classList.add('updating');
      setTimeout(() => progressBar.classList.remove('updating'), 500);
      
      progressBar.style.width = \`\${percent}%\`;
      progressBar.setAttribute('aria-valuenow', percent);
      progressText.textContent = \`\${answered} of \${total} answered\`;
    },
  
    updateNavButton(qIndex) {
      const navBtn = document.getElementById(\`nav\${qIndex}\`);
      if (navBtn) {
        navBtn.classList.toggle("answered", this.userAnswers[qIndex] !== null);
        navBtn.classList.toggle("flagged", this.flaggedQuestions.has(qIndex));
        navBtn.classList.toggle("current", this.currentQuestion === qIndex);
      }
    },
  
    updateAllNavButtons() {
      questions.forEach((_, i) => this.updateNavButton(i));
    },
  
    jumpToQuestion(qIndex) {
      const card = document.getElementById(\`q\${qIndex}\`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        this.currentQuestion = qIndex;
        this.updateAllNavButtons();
        this.closeMenu();
        
        setTimeout(() => {
          const firstBtn = card.querySelector('.option-btn, .essay-input, .flag-btn');
          if (firstBtn) firstBtn.focus();
        }, 500);
      }
    },
  
    enterReviewMode() {
      const unanswered = [];
      const flagged = [];
      
      this.userAnswers.forEach((ans, i) => {
        if (ans === null) unanswered.push(i + 1);
      });
      
      this.flaggedQuestions.forEach(i => flagged.push(i + 1));
      
      let summaryHTML = '<div class="review-summary">';
      // summaryHTML += '<h3>Quiz Review</h3>';
      summaryHTML += \`<p><strong>Answered:</strong> \${this.userAnswers.filter(a => a !== null).length}/\${questions.length}</p>\`;
      
      if (unanswered.length > 0) {
        summaryHTML += \`<p class="warning">⚠️ <strong>Unanswered:</strong> Questions \${unanswered.join(', ')}</p>\`;
      }
      
      if (flagged.length > 0) {
        summaryHTML += \`<p>🚩 <strong>Flagged for review:</strong> Questions \${flagged.join(', ')}</p>\`;
      }
      
      if (unanswered.length === 0 && flagged.length === 0) {
        summaryHTML += '<p style="color: var(--success);">✓ All questions answered, none flagged.</p>';
      }
      
      summaryHTML += \`
        <div class="review-actions">
          <button class="btn btn-secondary modal-btn" onclick="quizApp.closeModal()">Continue Editing</button>
          <button class="btn btn-primary modal-btn" onclick="quizApp.performSubmit()">Submit Now</button>
        </div>
      </div>\`;
      
      this.showModal('Review Quiz', summaryHTML);
    },
  
    submit() {
      if (this.submitted) return;
  
      // Always show confirmation before submitting
      const unanswered = this.userAnswers.filter(a => a === null).length;
      
      let message = '<p>Are you sure you want to submit your quiz?</p>';
      if (unanswered > 0) {
        message = \`<p>You have <strong>\${unanswered}</strong> unanswered question(s).</p><p>Are you sure you want to submit anyway?</p>\`;
      }
      
      this.showModal(
        "Confirm Submission",
        message,
        () => this.performSubmit()
      );
    },
  
    performSubmit() {
      this.closeModal();
      
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      
      setTimeout(() => {
        this.submitted = true;
        this.stopTimer();
  
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
        
        submitBtn.classList.remove('loading');
        document.getElementById('reviewBtn').disabled = true;
        
        localStorage.removeItem('quiz_progress');
        
        this.announceToScreenReader('Quiz submitted. Check results below.');
      }, 800);
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
        btn.disabled = true;
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
          <p><strong>Time Taken:</strong> \${document.getElementById('timerDisplay').textContent}</p>
        </div>
        <p style="margin-top:20px;color:var(--text-muted)">Scroll up to review explanations and answers</p>
      \`;
      
      resultsDiv.classList.add("show");
      setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      
      this.showToast(\`Quiz complete! You scored \${percent}%\`, 'success');
    },
  
    reset() {
      this.showModal(
        "Reset Quiz",
        "<p>Are you sure you want to reset the quiz? All your answers will be lost.</p>",
        () => this.performReset()
      );
    },
  
    performReset() {
      this.closeModal();
      this.submitted = false;
      this.userAnswers = new Array(questions.length).fill(null);
      this.currentQuestion = 0;
      this.flaggedQuestions.clear();
  
      document.getElementById("results").classList.remove("show");
      document.getElementById("submitBtn").disabled = false;
      document.getElementById("submitBtn").classList.remove('loading');
      document.getElementById('reviewBtn').disabled = false;
      
      this.renderQuiz();
      this.renderNav();
      this.updateProgress();
      this.setupImageLoading();
      
      this.stopTimer();
      this.startQuizTimer();
      
      localStorage.removeItem('quiz_progress');
      
      window.scrollTo({ top: 0, behavior: "smooth" });
      this.showToast('Quiz reset', 'info');
      this.announceToScreenReader('Quiz has been reset');
    },
  
    showModal(title, bodyHTML, onConfirm = null) {
      const modal = document.getElementById("modal");
      document.getElementById("modalTitle").textContent = title;
      document.getElementById("modalBody").innerHTML = bodyHTML;
      
      const confirmBtn = document.getElementById("modalConfirm");
      if (onConfirm) {
        confirmBtn.style.display = 'inline-flex';
        confirmBtn.onclick = onConfirm;
      } else {
        confirmBtn.style.display = 'none';
      }
      
      modal.classList.add("show");
      
      setTimeout(() => {
        const firstBtn = modal.querySelector('.btn');
        if (firstBtn) firstBtn.focus();
      }, 100);
    },
  
    closeModal() {
      document.getElementById("modal").classList.remove("show");
    },
  
    setupModalClickOutside() {
      document.getElementById("modal").addEventListener("click", (e) => {
        if (e.target.id === "modal") {
          this.closeModal();
        }
      });
    },
  
    setupKeyboardNavigation() {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeModal();
          this.closeMenu();
        }
        
        if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey) {
          const modal = document.getElementById("modal");
          if (!modal.classList.contains("show")) {
            this.toggleMenu();
          }
        }
        
        if (e.key >= '1' && e.key <= '4' && !this.submitted) {
          const optIndex = parseInt(e.key) - 1;
          const q = questions[this.currentQuestion];
          if (!this.isEssayQuestion(q) && optIndex < q.options.length) {
            this.selectAnswer(this.currentQuestion, optIndex);
          }
        }
        
        if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
          const targetEl = e.target;
          if (targetEl.tagName !== 'TEXTAREA' && targetEl.tagName !== 'INPUT') {
            e.preventDefault();
            this.jumpToQuestion(Math.min(this.currentQuestion + 1, questions.length - 1));
          }
        }
        
        if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
          const targetEl = e.target;
          if (targetEl.tagName !== 'TEXTAREA' && targetEl.tagName !== 'INPUT') {
            e.preventDefault();
            this.jumpToQuestion(Math.max(this.currentQuestion - 1, 0));
          }
        }
        
        if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
          const targetEl = e.target;
          if (targetEl.tagName !== 'TEXTAREA' && targetEl.tagName !== 'INPUT') {
            e.preventDefault();
            this.toggleFlag(this.currentQuestion);
          }
        }
      });
    },
  
    handleOptionKeydown(event, qIndex, optIndex) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.selectAnswer(qIndex, optIndex);
      }
    },
  
    setupTouchGestures() {
      const quizBody = document.querySelector('.quiz-body');
      
      quizBody.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      quizBody.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });
    },
  
    handleSwipe() {
      const swipeThreshold = 75;
      const diff = this.touchStartX - this.touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          this.jumpToQuestion(Math.min(this.currentQuestion + 1, questions.length - 1));
        } else {
          this.jumpToQuestion(Math.max(this.currentQuestion - 1, 0));
        }
      }
    },
  
    announceToScreenReader(message) {
      const liveRegion = document.getElementById('liveRegion');
      if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }
    },
  
    trapFocus(element) {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
  
      element.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
  
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      });
    },
  
    printQuiz() {
      this.closeMenu();
      setTimeout(() => window.print(), 100);
    },
  
    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = \`toast toast-\${type}\`;
      toast.innerHTML = \`
        <span class="toast-icon" aria-hidden="true">\${type === 'success' ? '✓' : 'ℹ'}</span>
        <span class="toast-message">\${message}</span>
      \`;
      
      document.body.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
      
      this.announceToScreenReader(message);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => quizApp.init());
  } else {
    quizApp.init();
  }
  
  document.addEventListener('click', function(e) {
    if (e.target.closest('.btn, .option-btn')) {
      const btn = e.target.closest('.btn, .option-btn');
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = e.clientX - rect.left - size/2 + 'px';
      ripple.style.top = e.clientY - rect.top - size/2 + 'px';
      
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  });
  
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const cards = document.querySelectorAll('.question-card');
      const viewportCenter = window.innerHeight / 2;
      
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < viewportCenter && rect.bottom > viewportCenter) {
          if (quizApp.currentQuestion !== index) {
            quizApp.currentQuestion = index;
            quizApp.updateAllNavButtons();
          }
        }
      });
    }, 100);
  }, { passive: true });
  </script>
  </body>
  </html>`;

  const blob = new Blob([quizHTML], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(config.title || "practice_quiz")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHTML(str) {
  if (str == null) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function sanitizeFilename(name) {
  return name
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

// Image Helpers
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
