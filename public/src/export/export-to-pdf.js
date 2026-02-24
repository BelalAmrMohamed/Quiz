// src/scripts/exportToPdf.js
// Downloads the quiz as a PDF file (.pdf)
// Deals with the export from both main page and results/summary page
// `jsPDF` library used, included in the html. See => "summary.html"

import { showNotification } from "../components/notifications.js";

const currentName = localStorage.getItem("username") || "User";

const loadPdfLib = () =>
  new Promise((resolve, reject) => {
    if (window.jspdf && window.jspdf.jsPDF) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("PDF library failed to load"));
    document.head.appendChild(s);
  });

export async function exportToPdf(config, questions, userAnswers = []) {
  try {
    try {
      await loadPdfLib();
    } catch {
      showNotification(
        "PDF library could not be loaded.",
        "Issue is From the website",
        "error",
      );
      alert("PDF library could not be loaded.");
      return;
    }

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

    doc.setFont("helvetica");

    // ===========================
    // GAMIFICATION COLORS
    // ===========================
    const COLORS = Object.freeze({
      primary: [106, 90, 205],
      secondary: [255, 215, 0],
      accent: [255, 105, 180],
      success: [46, 213, 115],
      error: [255, 71, 87],
      warning: [255, 168, 1],
      info: [52, 172, 224],
      cardBg: [255, 255, 255],
      cardBorder: [106, 90, 205],
      pageBg: [248, 250, 252],
      textDark: [30, 41, 59],
      textLight: [100, 116, 139],
      textWhite: [255, 255, 255],
      buttonCorrect: [16, 185, 129],
      buttonWrong: [239, 68, 68],
      buttonNeutral: [203, 213, 225],
      progressBarBg: [226, 232, 240],
      progressBarFill: [255, 215, 0],
      trophy: [255, 215, 0],
      codeBg: [240, 242, 246],
      codeBorder: [180, 185, 200],
      codeText: [50, 60, 100],
      inlineCodeBg: [235, 237, 244],
    });

    // ===========================
    // SIZES
    // ===========================
    const SIZES = Object.freeze({
      headerHeight: 18,
      footerHeight: 12,
      progressBarHeight: 6,
      cardPadding: 8,
      cardMargin: 6,
      cardCornerRadius: 3,
      cardShadowOffset: 0.8,
      titleFont: 24,
      headingFont: 16,
      questionFont: 11,
      optionFont: 10,
      labelFont: 9,
      footerFont: 8,
      codeFont: 9,
      buttonHeight: 10,
      buttonPadding: 3,
      buttonRadius: 2,
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

    const MAX_IMAGE_HEIGHT = 50;
    const MAX_IMAGE_WIDTH = contentWidth - SIZES.cardPadding * 2 - 6;

    let currentY = MARGINS.top;
    let currentLevel = 1;

    // ===========================
    // UNICODE / ARABIC DETECTION
    // ===========================

    /**
     * Returns true if the string contains Arabic or other non-Latin Unicode chars
     * that standard jsPDF helvetica cannot render.
     */
    const hasNonLatin = (text) => /[^\x00-\xFF]/.test(text);
    const hasArabic = (text) =>
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
        text,
      );

    // Track current PDF text color for canvas mirroring
    let _currentTextColor = COLORS.textDark;
    const setTextColor = (...rgb) => {
      _currentTextColor = rgb;
      doc.setTextColor(...rgb);
    };

    // ===========================
    // TEXT SANITIZATION (Unicode-safe)
    // ===========================

    /**
     * Sanitize text: keep ALL Unicode (Arabic, etc.),
     * only strip raw control characters that would corrupt PDF streams.
     */
    const sanitizeText = (text) => {
      if (text === null || text === undefined) return "";
      return String(text)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip real control chars only
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();
    };

    // ===========================
    // CANVAS-BASED UNICODE TEXT RENDERER
    // ===========================

    /** DPI multiplier for canvas — higher = crisper text in PDF */
    const CANVAS_DPR = 3;
    /** mm → px at our canvas DPI */
    const mmToPx = (mm) => mm * 3.7795275591 * (CANVAS_DPR / 1);

    /**
     * Build a reusable off-screen canvas ctx with the right font.
     * fontSize is in mm-equivalent points (same as doc.getFontSize()).
     */
    const makeCtx = (fontSizePt, bold = false) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1; // will resize before draw
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      const pxSize = fontSizePt * 1.3333 * (CANVAS_DPR / 1); // pt → px at DPR
      ctx.font = `${bold ? "bold " : ""}${pxSize}px Inter, Cairo, Arial, sans-serif`;
      return { canvas, ctx, pxSize };
    };

    /**
     * Word-wrap text into lines that fit within maxWidthMm, measured on canvas.
     * Works for both Arabic (RTL) and Latin text.
     */
    const wrapTextCanvas = (text, maxWidthMm, fontSizePt, bold = false) => {
      const { ctx } = makeCtx(fontSizePt, bold);
      const maxPx = mmToPx(maxWidthMm);

      // Split by explicit newlines first
      const paragraphs = text.split("\n");
      const lines = [];

      for (const paragraph of paragraphs) {
        if (paragraph.trim() === "") {
          lines.push("");
          continue;
        }
        // word wrap within paragraph
        const words = paragraph.split(/\s+/);
        let current = "";
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          if (ctx.measureText(test).width > maxPx && current) {
            lines.push(current);
            current = word;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);
      }

      return lines;
    };

    /**
     * Render text (potentially Arabic / Unicode) to a canvas and blit it into
     * the PDF as a PNG image. Returns the height consumed in mm.
     *
     * @param {string}   text        – the text to render
     * @param {number}   x           – left edge in mm
     * @param {number}   y           – top edge in mm
     * @param {number}   maxWidthMm  – wrap width in mm
     * @param {number[]} color       – [r, g, b] text color
     * @param {number}   fontSizePt  – font size in pt
     * @param {boolean}  bold
     * @param {boolean}  rtl         – force right-to-left layout
     */
    const renderUnicodeText = (
      text,
      x,
      y,
      maxWidthMm,
      color = COLORS.textDark,
      fontSizePt = SIZES.optionFont,
      bold = false,
      rtl = null,
    ) => {
      if (!text) return 0;

      // Auto-detect RTL
      const isRtl = rtl !== null ? rtl : hasArabic(text);

      const lines = wrapTextCanvas(text, maxWidthMm, fontSizePt, bold);
      if (lines.length === 0) return 0;

      const { canvas, ctx, pxSize } = makeCtx(fontSizePt, bold);
      const lineHeightPx = pxSize * 1.55;
      const widthPx = mmToPx(maxWidthMm);
      const heightPx = Math.ceil(lines.length * lineHeightPx + pxSize * 0.5);

      canvas.width = widthPx;
      canvas.height = heightPx;

      // Re-apply font after resize (canvas resets on resize)
      ctx.font = `${bold ? "bold " : ""}${pxSize}px Inter, Cairo, Arial, sans-serif`;
      ctx.direction = isRtl ? "rtl" : "ltr";
      ctx.textAlign = isRtl ? "right" : "left";
      ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;

      lines.forEach((line, i) => {
        const textX = isRtl ? widthPx - 1 : 1;
        ctx.fillText(line, textX, (i + 1) * lineHeightPx - pxSize * 0.15);
      });

      const imgData = canvas.toDataURL("image/png");
      const heightMm = heightPx / (CANVAS_DPR * 3.7795275591);

      doc.addImage(imgData, "PNG", x, y, maxWidthMm, heightMm);
      return heightMm;
    };

    /**
     * Measure how tall (mm) a block of Unicode text will be.
     */
    const measureUnicodeTextHeight = (
      text,
      maxWidthMm,
      fontSizePt,
      bold = false,
    ) => {
      if (!text) return 0;
      const lines = wrapTextCanvas(text, maxWidthMm, fontSizePt, bold);
      const { pxSize } = makeCtx(fontSizePt, bold);
      const lineHeightPx = pxSize * 1.55;
      const heightPx = Math.ceil(lines.length * lineHeightPx + pxSize * 0.5);
      return heightPx / (CANVAS_DPR * 3.7795275591);
    };

    // ===========================
    // SMART TEXT RENDERER
    // Automatically chooses canvas vs native jsPDF based on content
    // ===========================

    /**
     * Split text to lines (native jsPDF for ASCII, canvas-measured for Unicode).
     */
    const splitLines = (text, maxWidthMm, fontSizePt) => {
      if (!text) return [];
      if (hasNonLatin(text)) {
        return wrapTextCanvas(text, maxWidthMm, fontSizePt);
      }
      doc.setFontSize(fontSizePt);
      return doc.splitTextToSize(text, maxWidthMm);
    };

    /**
     * Calculate rendered height in mm for a text block.
     */
    const calcTextHeight = (
      text,
      maxWidthMm,
      fontSizePt,
      lineHeightMm = 4.5,
    ) => {
      if (!text) return 0;
      if (hasNonLatin(text)) {
        return measureUnicodeTextHeight(text, maxWidthMm, fontSizePt);
      }
      const lines = splitLines(text, maxWidthMm, fontSizePt);
      return lines.length * lineHeightMm;
    };

    /**
     * Master text render function. Picks native or canvas path automatically.
     * Returns height consumed in mm.
     */
    const renderText = (
      text,
      x,
      y,
      maxWidthMm,
      {
        color = COLORS.textDark,
        fontSizePt = SIZES.optionFont,
        bold = false,
        lineHeightMm = 4.5,
        align = "left",
      } = {},
    ) => {
      if (!text) return 0;

      if (hasNonLatin(text)) {
        const isRtl = hasArabic(text);
        return renderUnicodeText(
          text,
          x,
          y,
          maxWidthMm,
          color,
          fontSizePt,
          bold,
          isRtl,
        );
      }

      // Native jsPDF path (ASCII/Latin)
      doc.setFontSize(fontSizePt);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, maxWidthMm);
      doc.text(lines, x, y, { align });
      return lines.length * lineHeightMm;
    };

    // ===========================
    // MARKDOWN PARSER
    // ===========================

    /**
     * Parse markdown-lite into segments:
     *   { type: 'text' | 'inline-code' | 'code-block', content: string }
     *
     * Matches the quiz page's renderMarkdown() logic exactly.
     */
    const parseMarkdown = (text) => {
      if (!text) return [{ type: "text", content: "" }];
      const segments = [];

      // Step 1: Extract fenced code blocks first
      const codeBlocks = [];
      let processed = String(text).replace(/```([\s\S]*?)```/g, (_, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push(code.trim());
        return `\x00CODEBLOCK${idx}\x00`;
      });

      // Step 2: Split on placeholders and inline backticks
      const parts = processed.split(/(\x00CODEBLOCK\d+\x00|`[^`\n]+`)/);

      for (const part of parts) {
        if (!part) continue;

        const blockMatch = part.match(/^\x00CODEBLOCK(\d+)\x00$/);
        if (blockMatch) {
          segments.push({
            type: "code-block",
            content: codeBlocks[parseInt(blockMatch[1])],
          });
          continue;
        }

        const inlineMatch = part.match(/^`([^`\n]+)`$/);
        if (inlineMatch) {
          segments.push({ type: "inline-code", content: inlineMatch[1] });
          continue;
        }

        // Plain text — handle \n as actual line breaks
        segments.push({ type: "text", content: part });
      }

      return segments;
    };

    /**
     * Calculate total height consumed by rendering a markdown string.
     * Must mirror renderMarkdownBlock exactly.
     */
    const calcMarkdownHeight = (
      text,
      x,
      maxWidthMm,
      fontSizePt = SIZES.optionFont,
    ) => {
      if (!text) return 0;
      const segments = parseMarkdown(text);
      let totalHeight = 0;

      for (const seg of segments) {
        if (seg.type === "code-block") {
          const codeLineH = 4.2;
          const lines = seg.content.split("\n");
          totalHeight += lines.length * codeLineH + 8; // padding
        } else if (seg.type === "inline-code") {
          // Inline: rendered as part of surrounding line; minimal extra height
          totalHeight += calcTextHeight(
            `[${seg.content}]`,
            maxWidthMm,
            fontSizePt,
          );
        } else {
          // Normal text (may contain \n)
          totalHeight += calcTextHeight(seg.content, maxWidthMm, fontSizePt);
        }
      }

      return Math.max(totalHeight, 4);
    };

    /**
     * Render a markdown-lite string into the PDF.
     * Returns the total height consumed in mm.
     *
     * Supported:
     *   ``` ... ```  → code block (gray box, courier-like styling)
     *   `...`        → inline code (highlighted label)
     *   \n           → line break
     */
    const renderMarkdownBlock = (
      text,
      x,
      y,
      maxWidthMm,
      {
        color = COLORS.textDark,
        fontSizePt = SIZES.optionFont,
        bold = false,
      } = {},
    ) => {
      if (!text) return 0;
      const segments = parseMarkdown(text);
      let consumed = 0;
      const boxWidth = maxWidthMm;

      for (const seg of segments) {
        // ── Code block ──────────────────────────────────────────────
        if (seg.type === "code-block") {
          const codeLineH = 4.2;
          const codeLines = seg.content.split("\n");
          const codeInnerH = codeLines.length * codeLineH;
          const boxH = codeInnerH + 8;

          // Background
          doc.setFillColor(...COLORS.codeBg);
          doc.roundedRect(x, y + consumed, boxWidth, boxH, 1.5, 1.5, "F");

          // Border
          doc.setDrawColor(...COLORS.codeBorder);
          doc.setLineWidth(0.3);
          doc.roundedRect(x, y + consumed, boxWidth, boxH, 1.5, 1.5, "S");

          // Label
          doc.setFontSize(SIZES.labelFont - 1);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...COLORS.codeText);
          doc.text("CODE", x + 2.5, y + consumed + 3.5);

          // Code text (courier for monospace feel)
          doc.setFontSize(SIZES.codeFont);
          doc.setFont("courier", "normal");
          doc.setTextColor(...COLORS.codeText);

          codeLines.forEach((line, i) => {
            const lineY = y + consumed + 6 + i * codeLineH;
            if (hasNonLatin(line)) {
              renderUnicodeText(
                line,
                x + 3,
                lineY - codeLineH * 0.2,
                boxWidth - 6,
                COLORS.codeText,
                SIZES.codeFont,
                false,
                false,
              );
            } else {
              doc.text(line, x + 3, lineY, {
                maxWidth: boxWidth - 6,
              });
            }
          });

          consumed += boxH + 2;

          // ── Inline code ─────────────────────────────────────────────
        } else if (seg.type === "inline-code") {
          const label = `\u2022 ${seg.content}`;
          const labelH = calcTextHeight(label, boxWidth - 8, fontSizePt);
          const boxH = labelH + 4;

          doc.setFillColor(...COLORS.inlineCodeBg);
          doc.roundedRect(x + 1, y + consumed, boxWidth - 2, boxH, 1, 1, "F");

          doc.setFontSize(fontSizePt);
          doc.setFont("courier", "normal");
          doc.setTextColor(...COLORS.codeText);

          if (hasNonLatin(seg.content)) {
            renderUnicodeText(
              seg.content,
              x + 3,
              y + consumed + 1.5,
              boxWidth - 6,
              COLORS.codeText,
              fontSizePt,
            );
          } else {
            doc.text(seg.content, x + 3, y + consumed + labelH * 0.6 + 1, {
              maxWidth: boxWidth - 6,
            });
          }

          doc.setFont("helvetica", bold ? "bold" : "normal");
          consumed += boxH + 1.5;

          // ── Normal text ─────────────────────────────────────────────
        } else {
          const segText = seg.content;
          if (!segText) continue;

          const h = renderText(segText, x, y + consumed, boxWidth, {
            color,
            fontSizePt,
            bold,
            lineHeightMm: 4.5,
          });
          consumed += h;
        }
      }

      return consumed;
    };

    // ===========================
    // ESSAY GRADER (mirrors quiz.js gradeEssay)
    // ===========================
    const gradeEssay = (userInput, modelAnswer) => {
      const normalize = (s) =>
        String(s || "")
          .toLowerCase()
          .replace(/[.,;:!?()\[\]{}"'\/\\]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

      const userNorm = normalize(userInput);
      const modelNorm = normalize(modelAnswer);

      if (!userNorm) return 0;

      const extractNums = (s) => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
      const modelNums = extractNums(modelNorm);
      const userNums = extractNums(userNorm);
      const modelNoNums = modelNorm.replace(/\d+(\.\d+)?/g, "").trim();
      if (modelNums.length > 0 && modelNoNums.length < 8) {
        const allMatch = modelNums.every((mn) =>
          userNums.some((un) => Math.abs(un - mn) / (Math.abs(mn) || 1) < 0.02),
        );
        return allMatch ? 5 : userNums.length > 0 ? 1 : 0;
      }

      const stopWords = new Set([
        "a",
        "an",
        "the",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
        "shall",
        "can",
        "to",
        "of",
        "in",
        "on",
        "at",
        "by",
        "for",
        "with",
        "and",
        "or",
        "but",
        "if",
        "this",
        "that",
        "it",
        "its",
        "as",
        "from",
        "into",
      ]);

      const getKeywords = (s) =>
        s.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));

      const modelKw = getKeywords(modelNorm);
      if (modelKw.length === 0) {
        const sim =
          userNorm.length > 0
            ? Math.min(userNorm.length, modelNorm.length) /
              Math.max(userNorm.length, modelNorm.length)
            : 0;
        return Math.round(sim * 5);
      }

      const userKw = new Set(getKeywords(userNorm));
      const matchCount = modelKw.filter(
        (kw) =>
          userKw.has(kw) ||
          [...userKw].some(
            (uk) =>
              (uk.includes(kw) || kw.includes(uk)) &&
              Math.min(uk.length, kw.length) > 3,
          ),
      ).length;

      const ratio = matchCount / modelKw.length;

      if (ratio >= 0.85) return 5;
      if (ratio >= 0.65) return 4;
      if (ratio >= 0.45) return 3;
      if (ratio >= 0.25) return 2;
      if (ratio > 0) return 1;
      return 0;
    };

    // ===========================
    // IMAGE HANDLING UTILITIES
    // ===========================

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

    const getConstrainedDimensions = (
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

    const processImage = async (imageSource) => {
      try {
        let imageData = imageSource;
        const isSvg =
          imageSource.includes("<svg") ||
          imageSource.includes("data:image/svg+xml");

        if (isSvg) {
          if (imageSource.startsWith("data:image/svg+xml")) {
            const svgString = decodeURIComponent(imageSource.split(",")[1]);
            imageData = await svgToDataUrl(svgString);
          } else if (imageSource.includes("<svg")) {
            imageData = await svgToDataUrl(imageSource);
          }
        } else if (!imageSource.startsWith("data:")) {
          imageData = await getDataUrl(imageSource);
        }

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageData;
        });

        const { width: constrainedWidth, height: constrainedHeight } =
          getConstrainedDimensions(
            img.width,
            img.height,
            MAX_IMAGE_WIDTH * 3.78,
            MAX_IMAGE_HEIGHT * 3.78,
          );

        return {
          data: imageData,
          width: constrainedWidth / 3.78,
          height: constrainedHeight / 3.78,
          success: true,
        };
      } catch (err) {
        console.warn("Failed to process image:", err);
        return { success: false };
      }
    };

    // ===========================
    // DECORATIVE HELPERS
    // ===========================

    const drawBackgroundPattern = () => {
      doc.setFillColor(...COLORS.pageBg);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      doc.setDrawColor(220, 220, 230);
      doc.setLineWidth(0.15);
      for (let i = -pageHeight; i < pageWidth + pageHeight; i += 12) {
        doc.line(i, 0, i + pageHeight, pageHeight);
      }

      doc.setFillColor(215, 215, 225);
      for (let x = 10; x < pageWidth; x += 15) {
        for (let y = 10; y < pageHeight; y += 15) {
          doc.circle(x, y, 0.3, "F");
        }
      }

      doc.setFillColor(230, 230, 240);
      doc.triangle(0, 0, 15, 0, 0, 15, "F");
      doc.triangle(pageWidth, 0, pageWidth - 15, 0, pageWidth, 15, "F");
      doc.triangle(0, pageHeight, 15, pageHeight, 0, pageHeight - 15, "F");
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

    const drawCard = (x, y, width, height) => {
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

    const drawProgressBar = (x, y, width, height, percentage) => {
      doc.setFillColor(...COLORS.progressBarBg);
      doc.roundedRect(x, y, width, height, 1.5, 1.5, "F");
      const fillWidth = (width * percentage) / 100;
      if (fillWidth > 0) {
        doc.setFillColor(...COLORS.progressBarFill);
        doc.roundedRect(x, y, fillWidth, height, 1.5, 1.5, "F");
      }
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y, width, height, 1.5, 1.5, "S");
    };

    const isEssayQuestion = (q) => q.options && q.options.length === 1;

    // ===========================
    // HEADER & FOOTER
    // ===========================

    const addGameHeader = () => {
      drawBackgroundPattern();

      doc.setFillColor(...COLORS.primary);
      doc.rect(0, 0, pageWidth, SIZES.headerHeight, "F");
      doc.setDrawColor(...COLORS.secondary);
      doc.setLineWidth(1.5);
      doc.line(0, SIZES.headerHeight - 1, pageWidth, SIZES.headerHeight - 1);

      doc.setFontSize(SIZES.headingFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.textWhite);

      const headerTitle = sanitizeText(config.title || "Quiz Quest");
      if (hasNonLatin(headerTitle)) {
        renderUnicodeText(
          headerTitle,
          MARGINS.left,
          5,
          contentWidth * 0.65,
          COLORS.textWhite,
          SIZES.headingFont,
          true,
          hasArabic(headerTitle),
        );
      } else {
        doc.text(headerTitle, MARGINS.left, 11);
      }

      // User name (right side)
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const nameText = sanitizeText(currentName);
      if (hasNonLatin(nameText)) {
        renderUnicodeText(
          nameText,
          pageWidth - MARGINS.right - contentWidth * 0.3,
          5,
          contentWidth * 0.3,
          COLORS.textWhite,
          12,
          true,
          hasArabic(nameText),
        );
      } else {
        const nameWidth = doc.getTextWidth(nameText);
        doc.text(nameText, pageWidth - MARGINS.right - nameWidth, 11);
      }

      currentY = SIZES.headerHeight + 6;
    };

    const addGameFooter = (isLastPage = false) => {
      const footerY = pageHeight - SIZES.footerHeight;

      doc.setFillColor(240, 242, 245);
      doc.rect(0, footerY - 2, pageWidth, SIZES.footerHeight + 2, "F");
      doc.setDrawColor(...COLORS.secondary);
      doc.setLineWidth(0.8);
      doc.line(0, footerY - 2, pageWidth, footerY - 2);

      doc.setFontSize(SIZES.footerFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(`Page ${currentLevel}`, MARGINS.left, footerY + 4);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textLight);
      doc.text("Crafted by Belal Amr", pageWidth - MARGINS.right, footerY + 4, {
        align: "right",
      });

      if (!isLastPage) {
        const dotY = footerY + 3.5;
        const dotSpacing = 3.5;
        const totalDots = 5;
        const startX = pageWidth / 2 - (totalDots * dotSpacing) / 2;
        for (let i = 0; i < totalDots; i++) {
          doc.setFillColor(
            ...(i < currentLevel ? COLORS.primary : COLORS.progressBarBg),
          );
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
    // RENDER SCORE PAGE
    // ===========================

    const renderScorePage = () => {
      addGameHeader();

      const cardY = currentY;
      const cardHeight = 85;
      drawCard(MARGINS.left, cardY, contentWidth, cardHeight);

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

      const circleY = currentY + 13;
      const radius = 18;
      doc.setFillColor(...COLORS.secondary);
      doc.circle(pageWidth / 2, circleY, radius + 1.5, "F");
      doc.setFillColor(
        ...(scoreData.isPassing ? COLORS.success : COLORS.warning),
      );
      doc.circle(pageWidth / 2, circleY, radius, "F");

      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(`${scoreData.percentage}%`, pageWidth / 2, circleY + 2, {
        align: "center",
      });
      currentY = circleY + radius + 10;

      doc.setFontSize(18);
      doc.setTextColor(...COLORS.primary);
      const message = scoreData.isPassing ? "LEGENDARY!" : "KEEP GRINDING!";
      doc.text(message, pageWidth / 2, currentY, { align: "center" });
      currentY += 9;

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

      const progressY = currentY;
      drawProgressBar(
        MARGINS.left + 18,
        progressY,
        contentWidth - 36,
        SIZES.progressBarHeight,
        scoreData.percentage,
      );
      currentY = progressY + SIZES.progressBarHeight + 3;

      doc.setFontSize(SIZES.labelFont);
      doc.setTextColor(...COLORS.textLight);
      doc.text(`${scoreData.percentage}% Complete`, pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += 10;

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
    // Mode detection
    // ===========================
    const isResultsMode =
      userAnswers &&
      (Array.isArray(userAnswers)
        ? userAnswers.length > 0
        : Object.keys(userAnswers).length > 0);

    if (isResultsMode) renderScorePage();
    else addGameHeader();

    // ===========================
    // RENDER QUESTIONS
    // ===========================

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

    // ─────────────────────────────────────────────────────────────────
    // ESSAY ANSWER RENDERER
    // Dynamically sizes boxes based on actual content height.
    // Shows graded score with stars when in results mode.
    // ─────────────────────────────────────────────────────────────────
    const renderEssayAnswer = (question, userAns) => {
      const userText = sanitizeText(userAns || "Not answered");
      const formalAnswer = sanitizeText(question.options[0]);
      const boxWidth = contentWidth - SIZES.cardPadding * 2 - 6;
      const innerWidth = boxWidth - 6;
      const textX = MARGINS.left + SIZES.cardPadding + 4.5;

      // ── Essay score (only in results mode) ────────────────────────
      if (isResultsMode && userAns && String(userAns).trim()) {
        const essayScore = gradeEssay(userAns, question.options[0]);
        const filledStars = "★".repeat(essayScore);
        const emptyStars = "☆".repeat(5 - essayScore);
        const starsLabel = `${filledStars}${emptyStars}`;
        const scoreLabel = `Score: ${essayScore} / 5`;

        // Score badge box
        const scoreBadgeH = 10;
        const badgeColor =
          essayScore >= 3
            ? COLORS.success
            : essayScore > 0
              ? COLORS.warning
              : COLORS.error;

        doc.setFillColor(...badgeColor);
        doc.roundedRect(
          MARGINS.left + SIZES.cardPadding + 3,
          currentY,
          boxWidth,
          scoreBadgeH,
          1.5,
          1.5,
          "F",
        );

        // Score text
        doc.setFontSize(SIZES.optionFont);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLORS.textWhite);
        doc.text(scoreLabel, textX, currentY + 3.5);

        // Stars (rendered as canvas since ★☆ are Unicode)
        renderUnicodeText(
          starsLabel,
          textX + 28,
          currentY + 0.5,
          boxWidth - 34,
          COLORS.textWhite,
          SIZES.optionFont + 1,
          false,
          false, // LTR stars
        );

        currentY += scoreBadgeH + 3;
      }

      // ── User answer box ───────────────────────────────────────────
      if (isResultsMode) {
        const userTextH = calcTextHeight(
          userText,
          innerWidth,
          SIZES.optionFont,
          4.5,
        );
        const boxH = Math.max(userTextH + 10, 16);

        doc.setFillColor(245, 247, 250);
        doc.roundedRect(
          MARGINS.left + SIZES.cardPadding + 3,
          currentY,
          boxWidth,
          boxH,
          1.5,
          1.5,
          "F",
        );

        doc.setFontSize(SIZES.labelFont);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLORS.primary);
        doc.text("YOUR ANSWER:", textX, currentY + 4);

        renderText(userText, textX, currentY + 8, innerWidth, {
          color: COLORS.textDark,
          fontSizePt: SIZES.optionFont,
        });

        currentY += boxH + 2;
      }

      // ── Formal / correct answer box ───────────────────────────────
      const formalH = calcMarkdownHeight(
        formalAnswer,
        MARGINS.left + SIZES.cardPadding + 4.5,
        innerWidth,
        SIZES.optionFont,
      );
      const formalBoxH = Math.max(formalH + 10, 16);

      doc.setFillColor(240, 253, 244);
      doc.roundedRect(
        MARGINS.left + SIZES.cardPadding + 3,
        currentY,
        boxWidth,
        formalBoxH,
        1.5,
        1.5,
        "F",
      );

      doc.setFontSize(SIZES.labelFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.success);
      doc.text("CORRECT ANSWER:", textX, currentY + 4);

      renderMarkdownBlock(formalAnswer, textX, currentY + 8, innerWidth, {
        color: COLORS.textDark,
        fontSizePt: SIZES.optionFont,
      });

      currentY += formalBoxH + 3;
    };

    // ─────────────────────────────────────────────────────────────────
    // MCQ OPTIONS RENDERER
    // Dynamically sizes each option button based on wrapped text height.
    // ─────────────────────────────────────────────────────────────────
    const renderMultipleChoiceOptions = (question, userAns) => {
      const buttonWidth = contentWidth - SIZES.cardPadding * 2 - 6;
      const innerWidth = buttonWidth - SIZES.buttonPadding * 2;

      question.options.forEach((opt, optIndex) => {
        const isUserAns = optIndex === userAns;
        const isCorrectAns = optIndex === question.correct;
        const sanitizedOption = sanitizeText(opt);

        const prefix = String.fromCharCode(65 + optIndex);
        let marker = "";
        if (isCorrectAns) marker = "> ";
        else if (isUserAns && !isCorrectAns) marker = "X ";
        const displayText = `${marker}${prefix}. ${sanitizedOption}`;

        // ── Dynamic button height ──────────────────────────────────
        const textH = calcMarkdownHeight(
          sanitizedOption,
          MARGINS.left + SIZES.cardPadding + 3 + SIZES.buttonPadding,
          innerWidth,
          SIZES.optionFont,
        );
        // Account for prefix label (always 1 line of labelFont)
        const btnH = Math.max(
          textH + SIZES.buttonPadding * 2 + 2,
          SIZES.buttonHeight,
        );

        const buttonX = MARGINS.left + SIZES.cardPadding + 3;
        const buttonY = currentY;

        const textColor = drawButton(
          buttonX,
          buttonY,
          buttonWidth,
          btnH,
          isCorrectAns,
          isUserAns && !isCorrectAns,
        );

        // Prefix label (A. / B. etc.)
        doc.setFontSize(SIZES.optionFont);
        doc.setFont("helvetica", isCorrectAns ? "bold" : "normal");
        doc.setTextColor(...textColor);

        const prefixLabel = `${marker}${prefix}.`;

        if (hasNonLatin(displayText)) {
          // For non-Latin: render prefix then option text via canvas
          renderUnicodeText(
            `${prefixLabel} ${sanitizedOption}`,
            buttonX + SIZES.buttonPadding,
            buttonY + SIZES.buttonPadding * 0.5,
            innerWidth,
            textColor,
            SIZES.optionFont,
            isCorrectAns,
            hasArabic(sanitizedOption),
          );
        } else {
          // Render markdown-aware option text
          doc.text(
            prefixLabel,
            buttonX + SIZES.buttonPadding,
            buttonY + btnH / 2 + 1.2,
          );
          renderMarkdownBlock(
            sanitizedOption,
            buttonX + SIZES.buttonPadding + doc.getTextWidth(prefixLabel) + 1.5,
            buttonY + SIZES.buttonPadding,
            innerWidth - doc.getTextWidth(prefixLabel) - 2,
            {
              color: textColor,
              fontSizePt: SIZES.optionFont,
              bold: isCorrectAns,
            },
          );
        }

        currentY += btnH + SIZES.optionSpacing;
      });

      currentY += 3;
    };

    // ─────────────────────────────────────────────────────────────────
    // EXPLANATION RENDERER
    // ─────────────────────────────────────────────────────────────────
    const renderExplanation = (question) => {
      if (!question.explanation) return;
      const expText = sanitizeText(question.explanation);
      const boxWidth = contentWidth - SIZES.cardPadding * 2 - 6;
      const innerWidth = boxWidth - 6;
      const textX = MARGINS.left + SIZES.cardPadding + 4.5;

      const contentH = calcMarkdownHeight(
        expText,
        textX,
        innerWidth,
        SIZES.optionFont,
      );
      const boxHeight = Math.max(contentH + 9, 14);

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

      doc.setFontSize(SIZES.labelFont);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.warning);
      doc.text("EXPLANATION:", textX, currentY + 4);

      renderMarkdownBlock(expText, textX, currentY + 7, innerWidth, {
        color: COLORS.textDark,
        fontSizePt: SIZES.optionFont,
      });

      currentY += boxHeight + 3;
    };

    // ─────────────────────────────────────────────────────────────────
    // MAIN QUESTION RENDERER
    // ─────────────────────────────────────────────────────────────────
    const renderQuestion = async (question, index) => {
      const isEssay = isEssayQuestion(question);
      const userAns = userAnswers[index];
      const questionText = sanitizeText(question.q);

      // Process image
      let imageInfo = null;
      if (question.image) {
        imageInfo = await processImage(question.image);
      }

      // ── Pre-calculate card height ──────────────────────────────────
      let cardContentHeight = 15; // header strip

      if (imageInfo && imageInfo.success) {
        cardContentHeight += imageInfo.height + 5;
      }

      // Question text height
      const qMaxWidth = contentWidth - SIZES.cardPadding * 2 - 6;
      const qHeight = calcMarkdownHeight(
        questionText,
        MARGINS.left + SIZES.cardPadding + 3,
        qMaxWidth,
        SIZES.questionFont,
      );
      cardContentHeight += qHeight + 5;

      // Options height
      if (isEssay) {
        // Star rating badge (if results mode + answered)
        if (isResultsMode && userAns && String(userAns).trim()) {
          cardContentHeight += 13; // score badge + gap
        }
        // User answer box
        if (isResultsMode) {
          const userTextH = calcTextHeight(
            sanitizeText(userAns || "Not answered"),
            qMaxWidth - 6,
            SIZES.optionFont,
          );
          cardContentHeight += Math.max(userTextH + 10, 16) + 2;
        }
        // Formal answer box
        const formalH = calcMarkdownHeight(
          sanitizeText(question.options[0]),
          MARGINS.left + SIZES.cardPadding + 4.5,
          qMaxWidth - 6,
          SIZES.optionFont,
        );
        cardContentHeight += Math.max(formalH + 10, 16) + 3;
      } else {
        // MCQ: sum up dynamic button heights
        question.options.forEach((opt) => {
          const optText = sanitizeText(opt);
          const optH = calcMarkdownHeight(
            optText,
            MARGINS.left + SIZES.cardPadding + 3 + SIZES.buttonPadding,
            qMaxWidth - SIZES.buttonPadding * 2,
            SIZES.optionFont,
          );
          cardContentHeight +=
            Math.max(optH + SIZES.buttonPadding * 2 + 2, SIZES.buttonHeight) +
            SIZES.optionSpacing;
        });
        cardContentHeight += 3;
      }

      // Explanation height
      if (question.explanation) {
        const expText = sanitizeText(question.explanation);
        const expH = calcMarkdownHeight(
          expText,
          MARGINS.left + SIZES.cardPadding + 4.5,
          qMaxWidth - 6,
          SIZES.optionFont,
        );
        cardContentHeight += Math.max(expH + 9, 14) + 3;
      }

      const totalCardHeight = cardContentHeight + SIZES.cardPadding * 2;

      const maxCardHeight =
        pageHeight -
        MARGINS.top -
        MARGINS.bottom -
        SIZES.footerHeight -
        SIZES.headerHeight;

      if (totalCardHeight > maxCardHeight) {
        if (currentY > MARGINS.top + SIZES.headerHeight) {
          checkPageBreak(totalCardHeight);
        }
      } else {
        checkPageBreak(totalCardHeight + SIZES.cardMargin);
      }

      // ── Draw card ──────────────────────────────────────────────────
      const cardY = currentY;
      drawCard(MARGINS.left, cardY, contentWidth, totalCardHeight);

      currentY = cardY + SIZES.cardPadding - 2;
      const headerY = currentY;

      // Card header strip
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

      // Question number
      doc.setTextColor(...COLORS.textWhite);
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Question #${index + 1}`,
        MARGINS.left + SIZES.cardPadding + 2.5,
        headerY + 5.5,
      );

      // Status badge (results mode)
      const { statusText } = getQuestionStatus(question, userAns, isEssay);
      if (isResultsMode) {
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

      // ── Image ──────────────────────────────────────────────────────
      if (imageInfo && imageInfo.success) {
        const imageX =
          MARGINS.left +
          SIZES.cardPadding +
          3 +
          (contentWidth - SIZES.cardPadding * 2 - 6 - imageInfo.width) / 2;
        try {
          doc.addImage(
            imageInfo.data,
            "PNG",
            imageX,
            currentY,
            imageInfo.width,
            imageInfo.height,
          );
          currentY += imageInfo.height + 5;
        } catch (e) {
          console.error("Failed to add image to PDF", e);
          showNotification("Failed to add image to PDF", `${e}`, "error");
        }
      }

      // ── Question text (with markdown) ──────────────────────────────
      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textDark);

      const qConsumed = renderMarkdownBlock(
        questionText,
        MARGINS.left + SIZES.cardPadding + 3,
        currentY,
        qMaxWidth,
        { color: COLORS.textDark, fontSizePt: SIZES.questionFont },
      );
      currentY += qConsumed + 5;

      // ── Options ────────────────────────────────────────────────────
      if (isEssay) {
        renderEssayAnswer(question, userAns);
      } else {
        renderMultipleChoiceOptions(question, userAns);
      }

      // ── Explanation ────────────────────────────────────────────────
      renderExplanation(question);

      currentY = cardY + totalCardHeight + SIZES.cardMargin;
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

      const cardHeight = 55;
      const cardY = currentY + 18;
      drawCard(MARGINS.left + 8, cardY, contentWidth - 16, cardHeight);
      currentY = cardY + 12;

      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text("End", pageWidth / 2, currentY, { align: "center" });
      currentY += 14;

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text("READY FOR MORE?", pageWidth / 2, currentY, { align: "center" });
      currentY += 8;

      doc.setFontSize(SIZES.questionFont);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textLight);
      doc.text(
        "Continue your journey with more challenges!",
        pageWidth / 2,
        currentY,
        { align: "center" },
      );
      currentY += 10;

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

      doc.setFontSize(18);
      doc.setTextColor(...COLORS.info);
      doc.setFont("helvetica", "bold");
      doc.text("https://basmagi-quiz.vercel.app/", pageWidth / 2, currentY, {
        align: "center",
      });

      addGameFooter(true);
    };

    renderCTAPage();

    // ===========================
    // SAVE PDF
    // ===========================
    const filename = `${sanitizeText(config.title || "quiz")}.pdf`;
    doc.save(filename);
    console.log(`PDF exported: ${filename}`);

    showNotification(
      "PDF file downloaded.",
      "You have it now",
      "./assets/images/PDF_Icon.png",
    );

    return { success: true, filename };
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert(`Failed to export PDF: ${error.message}`);
    showNotification("Failed to export PDF", `${error.message}`, "error");
    return { success: false, error: error.message };
  }
}
