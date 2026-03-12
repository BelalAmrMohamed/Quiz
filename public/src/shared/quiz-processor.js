// src/shared/quiz-processor.js
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

// ─── Raw text extractors ──────────────────────────────────────────────────────

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
  if (!docXml) throw new Error("Incorrect DOCX file: There's no document.xml");
  const xmlText = await docXml.async("string");
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

/**
 * Extract raw text from a File object (legacy, kept for compatibility).
 * Supports: .json, .txt (plain read), .pdf (pdf.js), .docx (JSZip+XML), .pptx (JSZip+XML)
 */
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

// ─── JSON parser ──────────────────────────────────────────────────────────────

/**
 * Extract leading metadata lines from the raw text.
 * Recognises: Title, Description, Source (case-insensitive).
 * Returns { meta, rest } where rest is the text after the meta block.
 */
function extractMetaBlock(trimmed) {
  const metaLineRe = /^(Title|Description|Source)\s*:\s*(.*)/i;
  const lines = trimmed.split("\n");
  const meta = {};
  let i = 0;

  // Walk past blank lines at the very top
  while (i < lines.length && !lines[i].trim()) i++;

  // Consume contiguous meta key-value lines (blank lines between them are ok)
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      // Blank line — only skip if we haven't seen the first question number yet
      const next = lines.slice(i + 1).find((l) => l.trim());
      if (next && metaLineRe.test(next)) {
        i++;
        continue;
      }
      // Otherwise the meta block has ended
      break;
    }
    const m = line.match(metaLineRe);
    if (m) {
      meta[m[1].toLowerCase()] = m[2].trim();
      i++;
    } else {
      break;
    }
  }

  const rest = lines.slice(i).join("\n").trim();
  return { meta: Object.keys(meta).length ? meta : null, rest };
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
        if (!questions) throw new Error("There are no questions");
        return { questions, meta };
      } else {
        const questions = JSON.parse(trimmed);
        if (!Array.isArray(questions)) throw new Error("No an array");
        const meta = defaultTitle ? { title: defaultTitle } : null;
        return { questions, meta };
      }
    } catch (e) {
      throw new Error("JSON incorrect: " + e.message);
    }
  }

  // --- Numbered text format ---
  // First, peel off the optional metadata block at the top
  const { meta: parsedMeta, rest } = extractMetaBlock(trimmed);

  // Build the final meta object, letting parsed values override the defaultTitle
  const meta = parsedMeta
    ? {
        title: parsedMeta.title || defaultTitle || undefined,
        description: parsedMeta.description || undefined,
        source: parsedMeta.source || undefined,
      }
    : defaultTitle
      ? { title: defaultTitle }
      : null;

  const questions = [];
  const blocks = rest.split(/(?=^\d+\.)/m);

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
    let lineIdx = 1;
    while (
      lineIdx < lines.length &&
      !lines[lineIdx].match(/^(?:[A-E][.)]\s*|-\s+)/)
    ) {
      if (lines[lineIdx].match(/^(?:Correct|Answer|Explanation)\s*[:\-]/i))
        break;
      q += "\n" + lines[lineIdx];
      lineIdx++;
    }

    const options = [];
    const optionLetters = [];
    let correct = 0;
    let explanation = "";
    let dashOptionIndex = 0;
    let essayAnswer = null; // holds a direct Answer: value for essay questions

    for (let i = lineIdx; i < lines.length; i++) {
      const line = lines[i];
      const optMatch = line.match(/^([A-E])[.)]\s*(.*)/i);
      if (optMatch) {
        optionLetters.push(optMatch[1].toUpperCase());
        options.push(optMatch[2].trim());
        continue;
      }
      const dashMatch = line.match(/^-\s+(.*)/);
      if (dashMatch) {
        const letter = String.fromCharCode(65 + dashOptionIndex);
        optionLetters.push(letter);
        options.push(dashMatch[1].trim());
        dashOptionIndex++;
        continue;
      }

      const correctMatch = line.match(/^(?:Correct|Answer)\s*[:\-]\s*(.+)/i);
      if (correctMatch) {
        const value = correctMatch[1].trim();
        // If value looks like a single letter option (A–E), treat as MCQ correct
        if (/^[A-E]$/i.test(value) && optionLetters.length > 0) {
          const idx = optionLetters.indexOf(value.toUpperCase());
          correct = idx >= 0 ? idx : 0;
        } else {
          // Essay answer — strip surrounding backticks / triple-backtick fences
          essayAnswer = value.replace(/^`{1,3}([^`]*)(`{1,3})?$/, "$1").trim();
        }
        continue;
      }

      const expMatch = line.match(/^(?:Explanation|Reason)\s*[:\-]\s*(.*)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
        continue;
      }
    }

    if (!q) continue;

    if (essayAnswer !== null) {
      // Essay question: store answer directly
      questions.push({
        q: q.trim(),
        answer: essayAnswer,
        options: [essayAnswer],
        correct: 0,
        explanation,
      });
    } else {
      questions.push({
        q: q.trim(),
        options: options.length ? options : [""],
        correct,
        explanation,
      });
    }
  }

  if (!questions.length) throw new Error("Unsupported format!");
  return { questions, meta };
}

// ─── High-level helper ────────────────────────────────────────────────────────

/**
 * Process a File and return { questions, meta } directly.
 *
 * - For .json: parsed immediately without text round-trip
 * - For .txt / .pdf / .docx / .pptx: text extracted first, then parsed
 *
 * The returned questions always follow the unified schema:
 *   MCQ/TF  → { q, options[], correct, explanation?, image? }
 *   Essay   → { q, options: [answer], correct: 0, explanation?, image? }
 *             OR { q, answer, explanation?, image? } (new-save format)
 *
 * @param {File}   file
 * @param {string} [defaultTitle] - fallback title (usually derived from filename)
 * @returns {Promise<{ questions: Array, meta: Object|null }>}
 */
export async function processQuizFile(file, defaultTitle = "") {
  const name = file.name.toLowerCase();

  if (name.endsWith(".json")) {
    try {
      const text = await file.text();
      const trimmed = text.trim();
      const data = JSON.parse(trimmed);

      // Flat array
      if (Array.isArray(data)) {
        return {
          questions: data,
          meta: defaultTitle ? { title: defaultTitle } : null,
        };
      }

      // Object with questions key
      const questions = Array.isArray(data.questions) ? data.questions : null;
      if (!questions)
        throw new Error("No questions in the provided JSON File.");

      const meta =
        data.meta ||
        (data.title
          ? { title: data.title, description: data.description || "" }
          : defaultTitle
            ? { title: defaultTitle }
            : null);

      return { questions, meta };
    } catch (e) {
      throw new Error(
        `Something went wrong while reading ${file.name}: ${e.message}`,
      );
    }
  }

  // For non-JSON: extract text → parse
  const text = await extractTextFromFile(file);
  const title =
    defaultTitle ||
    file.name
      .replace(/\.(txt|pdf|docx|pptx)$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return parseImportContent(text, title);
}
