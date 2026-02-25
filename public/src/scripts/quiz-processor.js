// src/scripts/quiz-processor.js
// Shared quiz file/text processing utilities used by both create-quiz and index pages.

/**
 * Dynamically load a script from CDN.
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/**
 * Extract raw text from a File object.
 * Supports: .json, .txt (plain read), .pdf (pdf.js), .docx (JSZip+XML), .pptx (JSZip+XML)
 */
async function extractTextFromPdf(file) {
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  );
  const pdfjsLib = window["pdfjs-dist/build/pdf"];
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    fullText += tc.items.map((item) => item.str).join(" ") + "\n";
  }
  return fullText;
}

async function extractTextFromDocx(file) {
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  );
  const JSZip = window.JSZip;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXml = zip.file("word/document.xml");
  if (!docXml) throw new Error("ملف DOCX غير صحيح: لا يوجد document.xml");
  const xmlText = await docXml.async("string");
  // Strip XML tags and decode entities
  return xmlText
    .replace(/<w:p[ >]/g, "\n<w:p>")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractTextFromPptx(file) {
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  );
  const JSZip = window.JSZip;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  let fullText = "";
  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0]);
      const nb = parseInt(b.match(/\d+/)[0]);
      return na - nb;
    });
  for (const slideFile of slideFiles) {
    const xmlText = await zip.file(slideFile).async("string");
    const text = xmlText
      .replace(/<a:p[ >]/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();
    if (text) fullText += text + "\n";
  }
  return fullText.trim();
}

export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".json") || name.endsWith(".txt")) {
    return file.text();
  }
  if (name.endsWith(".pdf")) {
    return extractTextFromPdf(file);
  }
  if (name.endsWith(".docx")) {
    return extractTextFromDocx(file);
  }
  if (name.endsWith(".pptx")) {
    return extractTextFromPptx(file);
  }
  return file.text();
}

/** Parse a string as JSON array/object OR numbered text format */
export function parseImportContent(content, defaultTitle = "") {
  const trimmed = content.trim();

  // --- JSON ---
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      if (trimmed.startsWith("{")) {
        const data = JSON.parse(trimmed);
        const questions = Array.isArray(data.questions)
          ? data.questions
          : Array.isArray(data)
            ? data
            : null;
        const meta =
          data.meta ||
          (data.title
            ? { title: data.title, description: data.description || "" }
            : defaultTitle
              ? { title: defaultTitle }
              : null);
        if (!questions) throw new Error("لا توجد أسئلة في البيانات");
        return { questions, meta };
      } else {
        const questions = JSON.parse(trimmed);
        if (!Array.isArray(questions)) throw new Error("ليست مصفوفة");
        const meta = defaultTitle ? { title: defaultTitle } : null;
        return { questions, meta };
      }
    } catch (e) {
      throw new Error("JSON غير صحيح: " + e.message);
    }
  }

  // --- Numbered text format ---
  // 1. Question text
  // A. option / B) option / a. option / - option
  // Correct: A
  // Explanation: ...
  const questions = [];
  const blocks = trimmed.split(/(?=^\d+\.)/m);

  for (const block of blocks) {
    const lines = block
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) continue;

    const firstMatch = lines[0].match(/^\d+\.\s*(.*)/);
    if (!firstMatch) continue;

    let q = firstMatch[1].trim();
    // Collect multi-line question text until first option
    let lineIdx = 1;
    while (
      lineIdx < lines.length &&
      !lines[lineIdx].match(/^(?:[A-Eا-ي][.)]\s*|-\s+)/)
    ) {
      if (
        lines[lineIdx].match(
          /^(?:Correct|الصحيح|الإجابة|Explanation|الشرح)\s*[:\-]/i,
        )
      )
        break;
      q += "\n" + lines[lineIdx];
      lineIdx++;
    }

    const options = [];
    const optionLetters = [];
    let correct = 0;
    let explanation = "";
    let dashOptionIndex = 0; // for dash-style options

    for (let i = lineIdx; i < lines.length; i++) {
      const line = lines[i];
      // Match: A) / A. / a) / a. (case-insensitive)
      const optMatch = line.match(/^([A-Eا-ي])[.)]\s*(.*)/i);
      if (optMatch) {
        optionLetters.push(optMatch[1].toUpperCase());
        options.push(optMatch[2].trim());
        continue;
      }
      // Match: - option text (dash-prefixed)
      const dashMatch = line.match(/^-\s+(.*)/);
      if (dashMatch) {
        const letter = String.fromCharCode(65 + dashOptionIndex); // A, B, C...
        optionLetters.push(letter);
        options.push(dashMatch[1].trim());
        dashOptionIndex++;
        continue;
      }

      const correctMatch = line.match(
        /^(?:Correct|الصحيح|الإجابة الصحيحة|Answer)\s*[:\-]\s*(.+)/i,
      );
      if (correctMatch) {
        const letter = correctMatch[1].trim().charAt(0).toUpperCase();
        const idx = optionLetters.indexOf(letter);
        correct = idx >= 0 ? idx : 0;
        continue;
      }

      const expMatch = line.match(
        /^(?:Explanation|الشرح|شرح|Reason)\s*[:\-]\s*(.*)/i,
      );
      if (expMatch) {
        explanation = expMatch[1].trim();
        continue;
      }
    }

    if (q)
      questions.push({
        q: q.trim(),
        options: options.length ? options : [""],
        correct,
        explanation,
      });
  }

  if (!questions.length)
    throw new Error("التنسيق غير مدعوم. الرجاء لصق JSON أو نص مرقّم.");
  return { questions, meta: defaultTitle ? { title: defaultTitle } : null };
}

