// Website/Script/index.js
import { examList } from "./examManifest.js";

// Ensure these IDs match the HTML exactly
const container = document.getElementById("contentArea");
const title = document.getElementById("pageTitle");
const breadcrumb = document.getElementById("breadcrumb");

// Derive categories from manifest entries; fall back to path parsing
const categories = [
  ...new Set(
    examList.map((e) => {
      if (e.category) return e.category;
      const parts = e.path.replace(/\\/g, "/").split("/");
      return parts[parts.length - 2] || "General";
    })
  ),
];

renderCategories();

function renderCategories() {
  if (!title || !container) return; // Safety check

  title.textContent = "📚 Select a Topic";
  breadcrumb.style.display = "none";
  container.innerHTML = "";
  container.className = "grid-container";

  categories.forEach((cat) => {
    const card = document.createElement("div");
    card.className = "card category-card";
    card.innerHTML = `
            <div class="icon">📂</div>
            <h3>${cat}</h3>
            <p>${examList.filter((e) => e.category === cat).length} Exams</p>
        `;
    card.onclick = () => renderExams(cat);
    container.appendChild(card);
  });
}

function renderExams(category) {
  title.textContent = `📝 ${category} Exams`;
  breadcrumb.textContent = "← Back to Categories";
  breadcrumb.style.display = "block";
  breadcrumb.onclick = renderCategories;

  container.innerHTML = "";
  const exams = examList.filter((e) => e.category === category);

  exams.forEach((exam) => {
    const card = document.createElement("div");
    card.className = "card exam-card";
    const h = document.createElement("h3");
    // prefer manifest title, otherwise derive from path
    const titleText =
      exam.title ||
      (() => {
        const parts = exam.path.replace(/\\/g, "/").split("/");
        const filename = parts[parts.length - 1] || "";
        return filename
          .replace(/\.js$/i, "")
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      })();
    h.textContent = titleText;
    const btn = document.createElement("button");
    btn.className = "start-btn";
    btn.textContent = "Start";
    btn.onclick = (ev) => {
      ev.stopPropagation();
      window.location.href = `quiz.html?id=${exam.id}`;
    };
    card.appendChild(h);
    card.appendChild(btn);
    container.appendChild(card);
  });
}
