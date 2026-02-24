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

    if (!config || !questions || !Array.isArray(questions))
      throw new Error(
        "Invalid parameters: config and questions array required",
      );
    if (!window.jspdf || !window.jspdf.jsPDF)
      throw new Error("jsPDF library not loaded");

    // =========================================================
    // INIT
    // =========================================================
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    doc.setFont("helvetica");

    // =========================================================
    // COLORS
    // =========================================================
    const COLORS = Object.freeze({
      primary: [106, 90, 205],
      secondary: [255, 215, 0],
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
      btnCorrect: [16, 185, 129],
      btnWrong: [239, 68, 68],
      btnNeutral: [203, 213, 225],
      progressBg: [226, 232, 240],
      progressFill: [255, 215, 0],
      codeBg: [240, 242, 246],
      codeBorder: [180, 185, 200],
      codeText: [50, 60, 100],
      inlineCodeBg: [226, 230, 242],
    });

    // =========================================================
    // SIZES
    // =========================================================
    const SIZES = Object.freeze({
      headerH: 18,
      footerH: 12,
      progressBar: 6,
      cardPad: 8,
      cardMargin: 6,
      cardCorner: 3,
      cardShadow: 0.8,
      titleFont: 24,
      headingFont: 16,
      qFont: 11,
      optFont: 10,
      labelFont: 9,
      footerFont: 8,
      codeFont: 9,
      btnPad: 3,
      btnMinH: 10,
      btnRadius: 2,
      optGap: 4,
    });

    const MARGINS = Object.freeze({ top: 22, right: 12, bottom: 18, left: 12 });

    // =========================================================
    // LAYOUT CONSTANTS
    // =========================================================
    const LINE_H = 4.5; // mm per line of text
    const BASELINE_RATIO = 0.78; // baseline position within a line (fraction from top)
    const CODE_LINE_H = 5.0; // mm per code line  (9pt courier, ~1.4× leading)
    const CODE_LABEL_H = 7.0; // mm for "CODE" label area at top of block
    const CODE_OVERHEAD = CODE_LABEL_H + 3.5; // total vertical overhead in a code box
    const IC_PAD = 1.0; // inline-code horizontal padding per side (mm)
    const IC_GAP = 0.6; // gap after inline-code pill (mm)
    const CARD_TOP_OFF = SIZES.cardPad - 2; // 6mm — visual top inset inside card

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - MARGINS.left - MARGINS.right;

    const MAX_IMG_H = 50;
    const MAX_IMG_W = contentWidth - SIZES.cardPad * 2 - 6;

    // Card content area coordinates (used everywhere for consistency)
    const CC_X = MARGINS.left + SIZES.cardPad + 3; // 23 mm from left
    const CC_W = contentWidth - SIZES.cardPad * 2 - 6; // inner width

    let currentY = MARGINS.top;
    let currentLevel = 1;

    // =========================================================
    // UNICODE / ARABIC DETECTION
    // =========================================================
    const hasNonLatin = (t) => /[^\x00-\xFF]/.test(t);
    const hasArabic = (t) =>
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
        t,
      );

    // =========================================================
    // TEXT SANITIZATION  (Unicode-safe — strip only raw control chars)
    // =========================================================
    const sanitizeText = (text) => {
      if (text == null) return "";
      return String(text)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();
    };

    // =========================================================
    // CANVAS MEASUREMENT CACHE  (#7 — avoids creating thousands of canvases)
    // =========================================================
    const CANVAS_DPR = 3;
    const mmToPx = (mm) => mm * 3.7795275591 * CANVAS_DPR;

    const _mxCache = new Map();
    const getMeasureCtx = (fontSizePt, bold = false) => {
      const key = `${fontSizePt}_${bold}`;
      if (!_mxCache.has(key)) {
        const cv = document.createElement("canvas");
        cv.width = 600;
        cv.height = 1;
        const ctx = cv.getContext("2d");
        const px = fontSizePt * 1.3333 * CANVAS_DPR;
        ctx.font = `${bold ? "bold " : ""}${px}px Inter, Cairo, Arial, sans-serif`;
        _mxCache.set(key, { ctx, pxSize: px });
      }
      return _mxCache.get(key);
    };

    // =========================================================
    // CANVAS WORD-WRAP  (for Arabic / Unicode paragraphs)
    // =========================================================
    const wrapTextCanvas = (text, maxWidthMm, fontSizePt, bold = false) => {
      const { ctx } = getMeasureCtx(fontSizePt, bold);
      const maxPx = mmToPx(maxWidthMm);
      const lines = [];
      for (const para of text.split("\n")) {
        if (!para.trim()) {
          lines.push("");
          continue;
        }
        const words = para.split(/\s+/);
        let cur = "";
        for (const w of words) {
          const test = cur ? `${cur} ${w}` : w;
          if (ctx.measureText(test).width > maxPx && cur) {
            lines.push(cur);
            cur = w;
          } else cur = test;
        }
        if (cur) lines.push(cur);
      }
      return lines;
    };

    // =========================================================
    // UNICODE CANVAS RENDERER
    // y = top of the image area. Returns height consumed (mm).
    // =========================================================
    const renderUnicodeText = (
      text,
      x,
      y,
      maxWidthMm,
      color,
      fontSizePt,
      bold = false,
      rtl = false,
    ) => {
      if (!text) return 0;
      const lines = wrapTextCanvas(text, maxWidthMm, fontSizePt, bold);
      if (!lines.length) return 0;
      const { pxSize } = getMeasureCtx(fontSizePt, bold);
      const lineHpx = pxSize * 1.55;
      const widthPx = mmToPx(maxWidthMm);
      const heightPx = Math.ceil(lines.length * lineHpx + pxSize * 0.4);
      const cv = document.createElement("canvas");
      cv.width = widthPx;
      cv.height = heightPx;
      const ctx = cv.getContext("2d");
      ctx.font = `${bold ? "bold " : ""}${pxSize}px Inter, Cairo, Arial, sans-serif`;
      ctx.direction = rtl ? "rtl" : "ltr";
      ctx.textAlign = rtl ? "right" : "left";
      ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
      lines.forEach((line, i) =>
        ctx.fillText(
          line,
          rtl ? widthPx - 1 : 1,
          (i + 1) * lineHpx - pxSize * 0.15,
        ),
      );
      const heightMm = heightPx / (CANVAS_DPR * 3.7795275591);
      doc.addImage(
        cv.toDataURL("image/png"),
        "PNG",
        x,
        y,
        maxWidthMm,
        heightMm,
      );
      return heightMm;
    };

    const measureUnicodeHeight = (
      text,
      maxWidthMm,
      fontSizePt,
      bold = false,
    ) => {
      if (!text) return 0;
      const lines = wrapTextCanvas(text, maxWidthMm, fontSizePt, bold);
      const { pxSize } = getMeasureCtx(fontSizePt, bold);
      return (
        Math.ceil(lines.length * pxSize * 1.55 + pxSize * 0.4) /
        (CANVAS_DPR * 3.7795275591)
      );
    };

    // =========================================================
    // PDF STATE CACHE  (#7 — skip redundant set* calls)
    // =========================================================
    let _pfam = "",
      _psty = "",
      _psz = 0;
    let _tR = -1,
      _tG = -1,
      _tB = -1;
    let _fR = -1,
      _fG = -1,
      _fB = -1;

    const setPdfFont = (family, style, size) => {
      if (family !== _pfam || style !== _psty) {
        doc.setFont(family, style);
        _pfam = family;
        _psty = style;
      }
      if (size !== _psz) {
        doc.setFontSize(size);
        _psz = size;
      }
    };

    // const setPdfTextColor = (r, g, b) => {
    //   if (r !== _tR || g !== _tG || b !== _tB) {
    //     doc.setTextColor(r, g, b);
    //     _tR = r;
    //     _tG = g;
    //     _tB = b;
    //   }
    // };
    // const setPdfFillColor = (r, g, b) => {
    //   if (r !== _fR || g !== _fG || b !== _fB) {
    //     doc.setFillColor(r, g, b);
    //     _fR = r;
    //     _fG = g;
    //     _fB = b;
    //   }
    // };

    const setPdfTextColor = (r, g, b) => {
      if (r !== _tR || g !== _tG || b !== _tB) {
        doc.setTextColor(r, g, b);
        _tR = r;
        _tG = g;
        _tB = b;
        // Force the next setPdfFillColor to apply
        _fR = -1;
        _fG = -1;
        _fB = -1;
      }
    };

    const setPdfFillColor = (r, g, b) => {
      if (r !== _fR || g !== _fG || b !== _fB) {
        doc.setFillColor(r, g, b);
        _fR = r;
        _fG = g;
        _fB = b;
        // Force the next setPdfTextColor to apply
        _tR = -1;
        _tG = -1;
        _tB = -1;
      }
    };

    // =========================================================
    // INLINE RUN WORD-WRAP  (#3 #4 #2)
    //
    // Turns an array of InlineRun  { type:'text'|'inline-code', content }
    // into display lines (array of arrays), respecting maxWidthMm.
    //
    // Side-effect: sets PDF font state. Always setPdfFont() before rendering.
    // =========================================================
    const wrapInlineRuns = (runs, maxWidthMm, fontSizePt, bold = false) => {
      const getTextW = (t) => {
        setPdfFont("helvetica", bold ? "bold" : "normal", fontSizePt);
        return doc.getTextWidth(t);
      };
      const getCodeW = (t) => {
        setPdfFont("courier", "normal", fontSizePt);
        return doc.getTextWidth(t) + IC_PAD * 2 + IC_GAP;
      };

      // Tokenise all runs into atomic chunks (words / spaces / code pills)
      const tokens = [];
      for (const run of runs) {
        if (run.type === "inline-code") {
          tokens.push({
            type: "inline-code",
            content: run.content,
            w: getCodeW(run.content),
          });
        } else {
          for (const p of run.content.split(/(\s+)/)) {
            if (p) tokens.push({ type: "text", content: p, w: getTextW(p) });
          }
        }
      }

      const lines = [];
      let curLine = [],
        lineW = 0;

      const flushLine = () => {
        while (
          curLine.length &&
          /^\s+$/.test(curLine[curLine.length - 1].content)
        )
          curLine.pop();
        if (curLine.length) lines.push(curLine);
        curLine = [];
        lineW = 0;
      };

      for (const tok of tokens) {
        const isWS = tok.type === "text" && /^\s+$/.test(tok.content);
        if (isWS) {
          if (curLine.length) {
            const last = curLine[curLine.length - 1];
            if (last.type === "text") {
              last.content += tok.content;
              last.w += tok.w;
            } else curLine.push({ ...tok });
            lineW += tok.w;
          }
          continue;
        }
        if (curLine.length > 0 && lineW + tok.w > maxWidthMm) flushLine();
        if (
          tok.type === "text" &&
          curLine.length &&
          curLine[curLine.length - 1].type === "text"
        ) {
          curLine[curLine.length - 1].content += tok.content;
          curLine[curLine.length - 1].w += tok.w;
        } else {
          curLine.push({ ...tok });
        }
        lineW += tok.w;
      }
      flushLine();
      return lines.length > 0 ? lines : [[]];
    };

    // =========================================================
    // INLINE LINE RENDERER
    // baselineY = actual jsPDF baseline Y coordinate (NOT top-of-line).
    // Draws inline-code as highlighted pills on the same baseline.
    // =========================================================
    const renderInlineLine = (
      lineTokens,
      x,
      baselineY,
      color,
      fontSizePt,
      bold,
    ) => {
      let curX = x;
      for (const tok of lineTokens) {
        if (tok.type === "inline-code") {
          setPdfFont("courier", "normal", fontSizePt);
          const codeW = doc.getTextWidth(tok.content);
          // Cap height in mm ≈ font_pt × 0.352 × 0.85
          const capH = fontSizePt * 0.352 * 0.85;
          const bgH = capH + IC_PAD * 1.8;
          const bgY = baselineY - capH - IC_PAD * 0.4;
          setPdfFillColor(...COLORS.inlineCodeBg);
          doc.roundedRect(curX, bgY, codeW + IC_PAD * 2, bgH, 0.7, 0.7, "F");
          setPdfTextColor(...COLORS.codeText);
          doc.text(tok.content, curX + IC_PAD, baselineY);
          curX += codeW + IC_PAD * 2 + IC_GAP;
        } else {
          setPdfFont("helvetica", bold ? "bold" : "normal", fontSizePt);
          setPdfTextColor(...color);
          doc.text(tok.content, curX, baselineY);
          curX += doc.getTextWidth(tok.content);
        }
      }
    };

    // =========================================================
    // MARKDOWN PARSER  (#3 #4)
    //
    // Returns Block[]  where Block is one of:
    //   { type: "code-block",        content: string      }
    //   { type: "inline-paragraph",  runs:    InlineRun[] }
    //
    // InlineRun: { type: "text"|"inline-code", content: string }
    // =========================================================
    const parseMarkdown = (text) => {
      if (!text)
        return [
          { type: "inline-paragraph", runs: [{ type: "text", content: "" }] },
        ];

      const result = [];
      const codeBlocks = [];

      // 1. Extract fenced code blocks
      let processed = String(text).replace(/```([\s\S]*?)```/g, (_, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push(code.trim());
        return `\x00CB${idx}\x00`;
      });

      // 2. Split by code-block placeholders
      for (const part of processed.split(/(\x00CB\d+\x00)/)) {
        if (!part) continue;
        const cbM = part.match(/^\x00CB(\d+)\x00$/);
        if (cbM) {
          result.push({ type: "code-block", content: codeBlocks[+cbM[1]] });
          continue;
        }

        // 3. Split by newlines → each line = one inline-paragraph
        for (const line of part.split("\n")) {
          const runs = [];
          for (const ip of line.split(/(`[^`\n]+`)/)) {
            if (!ip) continue;
            const icM = ip.match(/^`([^`\n]+)`$/);
            if (icM) runs.push({ type: "inline-code", content: icM[1] });
            else runs.push({ type: "text", content: ip });
          }
          result.push({ type: "inline-paragraph", runs });
        }
      }

      return result.length
        ? result
        : [{ type: "inline-paragraph", runs: [{ type: "text", content: "" }] }];
    };

    /**
     * Prepend a plain-text string into the first inline-paragraph of a segments array.
     * Used to merge option prefix ("A. ") with option content for correct word-wrap.
     */
    const prependText = (prefix, segments) => {
      if (!segments.length)
        return [
          {
            type: "inline-paragraph",
            runs: [{ type: "text", content: prefix }],
          },
        ];
      const result = segments.map((s) => ({
        ...s,
        runs: s.runs ? [...s.runs] : undefined,
      }));
      const idx = result.findIndex((s) => s.type === "inline-paragraph");
      if (idx === -1) {
        result.unshift({
          type: "inline-paragraph",
          runs: [{ type: "text", content: prefix }],
        });
      } else {
        result[idx] = {
          ...result[idx],
          runs: [{ type: "text", content: prefix }, ...result[idx].runs],
        };
      }
      return result;
    };

    // =========================================================
    // HEIGHT MEASUREMENT  (must mirror renderSegments exactly)
    // =========================================================
    const calcSegmentsHeight = (
      segments,
      maxWidthMm,
      fontSizePt = SIZES.optFont,
      bold = false,
    ) => {
      let h = 0;
      for (const seg of segments) {
        if (seg.type === "code-block") {
          const codeLines = seg.content.split("\n");
          let blockLinesH = 0;
          for (const line of codeLines) {
            if (!line.trim()) {
              blockLinesH += CODE_LINE_H;
              continue;
            }
            if (hasNonLatin(line)) {
              blockLinesH += Math.max(
                CODE_LINE_H,
                measureUnicodeHeight(
                  line,
                  maxWidthMm - 6,
                  SIZES.codeFont,
                  false,
                ),
              );
            } else {
              setPdfFont("courier", "normal", SIZES.codeFont);
              const wrapped = doc.splitTextToSize(line, maxWidthMm - 6);
              blockLinesH += wrapped.length * CODE_LINE_H;
            }
          }
          h += blockLinesH + CODE_OVERHEAD + 2;
        } else {
          const fullText = seg.runs.map((r) => r.content).join("");
          if (!fullText.trim()) {
            h += LINE_H * 0.5;
            continue;
          }
          if (hasNonLatin(fullText)) {
            h += measureUnicodeHeight(fullText, maxWidthMm, fontSizePt, bold);
          } else {
            h +=
              wrapInlineRuns(seg.runs, maxWidthMm, fontSizePt, bold).length *
              LINE_H;
          }
        }
      }
      return Math.max(h, LINE_H);
    };

    const calcMarkdownHeight = (
      text,
      maxWidthMm,
      fontSizePt = SIZES.optFont,
      bold = false,
    ) => {
      if (!text) return LINE_H;
      return calcSegmentsHeight(
        parseMarkdown(text),
        maxWidthMm,
        fontSizePt,
        bold,
      );
    };

    const calcTextHeight = (text, maxWidthMm, fontSizePt = SIZES.optFont) => {
      if (!text) return 0;
      if (hasNonLatin(text))
        return measureUnicodeHeight(text, maxWidthMm, fontSizePt);
      setPdfFont("helvetica", "normal", fontSizePt);
      return doc.splitTextToSize(text, maxWidthMm).length * LINE_H;
    };

    // =========================================================
    // CODE BLOCK RENDERER  (#5 — proper line heights, no overlap)
    // Returns height consumed (mm). y = top of block.
    // =========================================================
    const renderCodeBlock = (content, x, y, maxWidthMm) => {
      const codeLines = content.split("\n");

      let blockLinesH = 0;
      for (const line of codeLines) {
        if (!line.trim()) {
          blockLinesH += CODE_LINE_H;
          continue;
        }
        if (hasNonLatin(line)) {
          blockLinesH += Math.max(
            CODE_LINE_H,
            measureUnicodeHeight(line, maxWidthMm - 6, SIZES.codeFont, false),
          );
        } else {
          setPdfFont("courier", "normal", SIZES.codeFont);
          const wrapped = doc.splitTextToSize(line, maxWidthMm - 6);
          blockLinesH += wrapped.length * CODE_LINE_H;
        }
      }

      const boxH = blockLinesH + CODE_OVERHEAD;

      setPdfFillColor(...COLORS.codeBg);
      doc.roundedRect(x, y, maxWidthMm, boxH, 1.5, 1.5, "F");
      doc.setDrawColor(...COLORS.codeBorder);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, maxWidthMm, boxH, 1.5, 1.5, "S");

      // "CODE" label
      setPdfFont("helvetica", "bold", SIZES.labelFont - 1);
      setPdfTextColor(...COLORS.codeText);
      doc.text("CODE", x + 2.5, y + 4.5);

      // Separator
      doc.setDrawColor(...COLORS.codeBorder);
      doc.setLineWidth(0.15);
      doc.line(
        x + 1.5,
        y + CODE_LABEL_H - 0.5,
        x + maxWidthMm - 1.5,
        y + CODE_LABEL_H - 0.5,
      );

      // Lines of code
      setPdfFont("courier", "normal", SIZES.codeFont);
      setPdfTextColor(...COLORS.codeText);

      let curYOffset = CODE_LABEL_H;
      codeLines.forEach((line) => {
        if (!line.trim()) {
          curYOffset += CODE_LINE_H;
          return;
        }

        if (hasNonLatin(line)) {
          const usedH = renderUnicodeText(
            line,
            x + 3,
            y + curYOffset,
            maxWidthMm - 6,
            COLORS.codeText,
            SIZES.codeFont,
            false,
            false,
          );
          curYOffset += Math.max(CODE_LINE_H, usedH);
        } else {
          setPdfFont("courier", "normal", SIZES.codeFont);
          const wrappedLines = doc.splitTextToSize(line, maxWidthMm - 6);
          wrappedLines.forEach((wl) => {
            const baselineY = y + curYOffset + BASELINE_RATIO * CODE_LINE_H;
            doc.text(wl, x + 3, baselineY);
            curYOffset += CODE_LINE_H;
          });
        }
      });

      return boxH + 2; // +2 mm gap after block
    };

    // =========================================================
    // SEGMENT RENDERER  (core markdown render, mirrors calcSegmentsHeight)
    // y = top of content area. Returns total height consumed (mm).
    // =========================================================
    const renderSegments = (
      segments,
      x,
      y,
      maxWidthMm,
      {
        color = COLORS.textDark,
        fontSizePt = SIZES.optFont,
        bold = false,
      } = {},
    ) => {
      let consumed = 0;
      for (const seg of segments) {
        if (seg.type === "code-block") {
          consumed += renderCodeBlock(seg.content, x, y + consumed, maxWidthMm);
        } else {
          const fullText = seg.runs.map((r) => r.content).join("");
          if (!fullText.trim()) {
            consumed += LINE_H * 0.5;
            continue;
          }

          if (hasNonLatin(fullText)) {
            consumed += renderUnicodeText(
              fullText,
              x,
              y + consumed,
              maxWidthMm,
              color,
              fontSizePt,
              bold,
              hasArabic(fullText),
            );
          } else {
            const wrapped = wrapInlineRuns(
              seg.runs,
              maxWidthMm,
              fontSizePt,
              bold,
            );
            for (const lineRuns of wrapped) {
              renderInlineLine(
                lineRuns,
                x,
                y + consumed + LINE_H * BASELINE_RATIO,
                color,
                fontSizePt,
                bold,
              );
              consumed += LINE_H;
            }
          }
        }
      }
      return consumed;
    };

    // Convenience wrapper: parse + render
    const renderMarkdownBlock = (text, x, y, maxWidthMm, opts = {}) => {
      if (!text) return 0;
      return renderSegments(parseMarkdown(text), x, y, maxWidthMm, opts);
    };

    // Plain text renderer — y = top of content area
    const renderText = (
      text,
      x,
      y,
      maxWidthMm,
      {
        color = COLORS.textDark,
        fontSizePt = SIZES.optFont,
        bold = false,
      } = {},
    ) => {
      if (!text) return 0;
      if (hasNonLatin(text))
        return renderUnicodeText(
          text,
          x,
          y,
          maxWidthMm,
          color,
          fontSizePt,
          bold,
          hasArabic(text),
        );
      setPdfFont("helvetica", bold ? "bold" : "normal", fontSizePt);
      setPdfTextColor(...color);
      const lines = doc.splitTextToSize(text, maxWidthMm);
      const baselineY = y + LINE_H * BASELINE_RATIO;
      lines.forEach((l, i) => doc.text(l, x, baselineY + i * LINE_H));
      return lines.length * LINE_H;
    };

    // =========================================================
    // ESSAY GRADER  (mirrors quiz.js gradeEssay exactly)
    // =========================================================
    const gradeEssay = (userInput, modelAnswer) => {
      const norm = (s) =>
        String(s || "")
          .toLowerCase()
          .replace(/[.,;:!?()\[\]{}"'\/\\]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      const u = norm(userInput),
        m = norm(modelAnswer);
      if (!u) return 0;
      const nums = (s) => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
      const mn = nums(m),
        un = nums(u),
        mNoN = m.replace(/\d+(\.\d+)?/g, "").trim();
      if (mn.length > 0 && mNoN.length < 8) {
        return mn.every((n) =>
          un.some((k) => Math.abs(k - n) / (Math.abs(n) || 1) < 0.02),
        )
          ? 5
          : un.length > 0
            ? 1
            : 0;
      }
      const stop = new Set([
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
      const kw = (s) =>
        s.split(/\s+/).filter((w) => w.length > 2 && !stop.has(w));
      const mk = kw(m);
      if (!mk.length) {
        const sim = u.length
          ? Math.min(u.length, m.length) / Math.max(u.length, m.length)
          : 0;
        return Math.round(sim * 5);
      }
      const uk = new Set(kw(u));
      const ratio =
        mk.filter(
          (k) =>
            uk.has(k) ||
            [...uk].some(
              (x) =>
                (x.includes(k) || k.includes(x)) &&
                Math.min(x.length, k.length) > 3,
            ),
        ).length / mk.length;
      if (ratio >= 0.85) return 5;
      if (ratio >= 0.65) return 4;
      if (ratio >= 0.45) return 3;
      if (ratio >= 0.25) return 2;
      if (ratio > 0) return 1;
      return 0;
    };

    // =========================================================
    // IMAGE UTILITIES
    // =========================================================
    const getDataUrl = (url) =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const cv = document.createElement("canvas");
          cv.width = img.width;
          cv.height = img.height;
          cv.getContext("2d").drawImage(img, 0, 0);
          res(cv.toDataURL("image/png"));
        };
        img.onerror = () => rej(new Error("Failed to load image"));
        img.src = url;
      });

    const svgToDataUrl = (svgStr) =>
      new Promise((res, rej) => {
        const img = new Image();
        const url = URL.createObjectURL(
          new Blob([svgStr], { type: "image/svg+xml" }),
        );
        img.onload = () => {
          const cv = document.createElement("canvas");
          cv.width = img.width || 800;
          cv.height = img.height || 600;
          cv.getContext("2d").drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          res(cv.toDataURL("image/png"));
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          rej(new Error("SVG conversion failed"));
        };
        img.src = url;
      });

    const constrainDims = (w, h, mw, mh) => {
      const ar = w / h;
      let nw = mw,
        nh = nw / ar;
      if (nh > mh) {
        nh = mh;
        nw = nh * ar;
      }
      return { width: nw, height: nh };
    };

    const processImage = async (src) => {
      try {
        let data = src;
        const svg = src.includes("<svg") || src.includes("data:image/svg+xml");
        if (svg) {
          data = src.startsWith("data:image/svg+xml")
            ? await svgToDataUrl(decodeURIComponent(src.split(",")[1]))
            : await svgToDataUrl(src);
        } else if (!src.startsWith("data:")) {
          data = await getDataUrl(src);
        }
        const img = new Image();
        await new Promise((r, j) => {
          img.onload = r;
          img.onerror = j;
          img.src = data;
        });
        const { width, height } = constrainDims(
          img.width,
          img.height,
          MAX_IMG_W * 3.78,
          MAX_IMG_H * 3.78,
        );
        return {
          data,
          width: width / 3.78,
          height: height / 3.78,
          success: true,
        };
      } catch {
        return { success: false };
      }
    };

    // =========================================================
    // DECORATIVE HELPERS
    // =========================================================
    const drawBackgroundPattern = () => {
      setPdfFillColor(...COLORS.pageBg);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      // Diagonal lines (#7: 18mm spacing, was 12mm)
      doc.setDrawColor(220, 220, 230);
      doc.setLineWidth(0.15);
      for (let i = -pageHeight; i < pageWidth + pageHeight; i += 18)
        doc.line(i, 0, i + pageHeight, pageHeight);
      // Dots (#7: 22mm spacing, was 15mm)
      setPdfFillColor(215, 215, 225);
      for (let dx = 10; dx < pageWidth; dx += 22)
        for (let dy = 10; dy < pageHeight; dy += 22)
          doc.circle(dx, dy, 0.3, "F");
      // Corners
      setPdfFillColor(230, 230, 240);
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

    const drawCard = (x, y, w, h) => {
      setPdfFillColor(200, 200, 210);
      doc.roundedRect(
        x + SIZES.cardShadow,
        y + SIZES.cardShadow,
        w,
        h,
        SIZES.cardCorner,
        SIZES.cardCorner,
        "F",
      );
      setPdfFillColor(...COLORS.cardBg);
      doc.roundedRect(x, y, w, h, SIZES.cardCorner, SIZES.cardCorner, "F");
      doc.setDrawColor(...COLORS.cardBorder);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, w, h, SIZES.cardCorner, SIZES.cardCorner, "S");
    };

    const drawButton = (x, y, w, h, isCorrect, isWrong) => {
      const bg = isCorrect
        ? COLORS.btnCorrect
        : isWrong
          ? COLORS.btnWrong
          : COLORS.btnNeutral;
      const tc = isCorrect || isWrong ? COLORS.textWhite : COLORS.textDark;
      setPdfFillColor(180, 180, 190);
      doc.roundedRect(
        x + 0.4,
        y + 0.4,
        w,
        h,
        SIZES.btnRadius,
        SIZES.btnRadius,
        "F",
      );
      setPdfFillColor(...bg);
      doc.roundedRect(x, y, w, h, SIZES.btnRadius, SIZES.btnRadius, "F");
      doc.setDrawColor(...bg);
      doc.setLineWidth(0.6);
      doc.roundedRect(x, y, w, h, SIZES.btnRadius, SIZES.btnRadius, "S");
      return tc;
    };

    const drawProgressBar = (x, y, w, h, pct) => {
      setPdfFillColor(...COLORS.progressBg);
      doc.roundedRect(x, y, w, h, 1.5, 1.5, "F");
      const fw = (w * pct) / 100;
      if (fw > 0) {
        setPdfFillColor(...COLORS.progressFill);
        doc.roundedRect(x, y, fw, h, 1.5, 1.5, "F");
      }
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y, w, h, 1.5, 1.5, "S");
    };

    const isEssayQuestion = (q) => q.options && q.options.length === 1;

    const getQuestionStatus = (question, userAns, isEssay) => {
      if (isEssay) return { statusText: "ESSAY" };
      if (userAns === undefined || userAns === null)
        return { statusText: "SKIPPED" };
      return userAns === question.correct
        ? { statusText: "CORRECT" }
        : { statusText: "WRONG" };
    };

    // =========================================================
    // HEADER / FOOTER
    // =========================================================
    const addGameHeader = () => {
      drawBackgroundPattern();
      setPdfFillColor(...COLORS.primary);
      doc.rect(0, 0, pageWidth, SIZES.headerH, "F");
      doc.setDrawColor(...COLORS.secondary);
      doc.setLineWidth(1.5);
      doc.line(0, SIZES.headerH - 1, pageWidth, SIZES.headerH - 1);

      const title = sanitizeText(config.title || "Quiz Quest");
      if (hasNonLatin(title)) {
        renderUnicodeText(
          title,
          MARGINS.left,
          4,
          contentWidth * 0.65,
          COLORS.textWhite,
          SIZES.headingFont,
          true,
          hasArabic(title),
        );
      } else {
        setPdfFont("helvetica", "bold", SIZES.headingFont);
        setPdfTextColor(...COLORS.textWhite);
        doc.text(title, MARGINS.left, 11);
      }

      const name = sanitizeText(currentName);
      if (hasNonLatin(name)) {
        renderUnicodeText(
          name,
          pageWidth - MARGINS.right - contentWidth * 0.3,
          4,
          contentWidth * 0.3,
          COLORS.textWhite,
          12,
          true,
          hasArabic(name),
        );
      } else {
        setPdfFont("helvetica", "bold", 12);
        setPdfTextColor(...COLORS.textWhite);
        doc.text(name, pageWidth - MARGINS.right - doc.getTextWidth(name), 11);
      }
      currentY = SIZES.headerH + 6;
    };

    // #8: Arabic watermark
    const WATERMARK_W = 52;
    const WATERMARK_TEXT = "منصة إمتحانات بصمجي";

    const addGameFooter = (isLastPage = false) => {
      const fy = pageHeight - SIZES.footerH;
      setPdfFillColor(240, 242, 245);
      doc.rect(0, fy - 2, pageWidth, SIZES.footerH + 2, "F");
      doc.setDrawColor(...COLORS.secondary);
      doc.setLineWidth(0.8);
      doc.line(0, fy - 2, pageWidth, fy - 2);

      setPdfFont("helvetica", "bold", SIZES.footerFont);
      setPdfTextColor(...COLORS.primary);
      doc.text(`Page ${currentLevel}`, MARGINS.left, fy + 4);

      // Arabic watermark via canvas (#8)
      renderUnicodeText(
        WATERMARK_TEXT,
        pageWidth - MARGINS.right - WATERMARK_W,
        fy - 1,
        WATERMARK_W,
        COLORS.textLight,
        SIZES.footerFont,
        false,
        true,
      );

      if (!isLastPage) {
        const dotY = fy + 3.5,
          dotSp = 3.5,
          nDots = 5;
        const startX = pageWidth / 2 - (nDots * dotSp) / 2;
        for (let i = 0; i < nDots; i++) {
          setPdfFillColor(
            ...(i < currentLevel ? COLORS.primary : COLORS.progressBg),
          );
          doc.circle(startX + i * dotSp, dotY, 0.7, "F");
        }
      }
    };

    // =========================================================
    // SCORE CALCULATION + PAGE
    // =========================================================
    const calculateScore = () => {
      let correct = 0,
        wrong = 0,
        skipped = 0,
        essayCount = 0,
        totalScorable = 0;
      questions.forEach((q, i) => {
        if (isEssayQuestion(q)) {
          essayCount++;
          return;
        }
        totalScorable++;
        const a = userAnswers[i];
        if (a === undefined || a === null) skipped++;
        else if (a === q.correct) correct++;
        else wrong++;
      });
      const pct =
        totalScorable > 0 ? Math.round((correct / totalScorable) * 100) : 0;
      return {
        correct,
        wrong,
        skipped,
        essayCount,
        totalScorable,
        percentage: pct,
        isPassing: pct >= 70,
      };
    };

    const scoreData = calculateScore();

    const isResultsMode =
      userAnswers &&
      (Array.isArray(userAnswers)
        ? userAnswers.length > 0
        : Object.keys(userAnswers).length > 0);

    const renderScorePage = () => {
      addGameHeader();
      const cardY = currentY,
        cardH = 85;
      drawCard(MARGINS.left, cardY, contentWidth, cardH);

      currentY = cardY + 5;
      setPdfFillColor(...COLORS.primary);
      doc.roundedRect(
        MARGINS.left + 12,
        currentY,
        contentWidth - 24,
        12,
        2,
        2,
        "F",
      );
      setPdfFont("helvetica", "bold", SIZES.titleFont);
      setPdfTextColor(...COLORS.textWhite);
      doc.text("QUIZ COMPLETE!", pageWidth / 2, currentY + 9, {
        align: "center",
      });
      currentY += 22;

      const circleY = currentY + 13,
        radius = 18;
      setPdfFillColor(...COLORS.secondary);
      doc.circle(pageWidth / 2, circleY, radius + 1.5, "F");
      setPdfFillColor(
        ...(scoreData.isPassing ? COLORS.success : COLORS.warning),
      );
      doc.circle(pageWidth / 2, circleY, radius, "F");
      setPdfFont("helvetica", "bold", 22);
      setPdfTextColor(...COLORS.textWhite);
      doc.text(`${scoreData.percentage}%`, pageWidth / 2, circleY + 2, {
        align: "center",
      });
      currentY = circleY + radius + 10;

      setPdfFont("helvetica", "bold", 18);
      setPdfTextColor(...COLORS.primary);
      doc.text(
        scoreData.isPassing ? "LEGENDARY!" : "KEEP GRINDING!",
        pageWidth / 2,
        currentY,
        { align: "center" },
      );
      currentY += 9;

      setPdfFont("helvetica", "normal", SIZES.qFont);
      setPdfTextColor(...COLORS.textDark);
      doc.text(
        `Score: ${scoreData.correct} / ${scoreData.totalScorable}`,
        pageWidth / 2,
        currentY,
        { align: "center" },
      );
      currentY += 5;

      setPdfFont("helvetica", "normal", SIZES.optFont);
      setPdfTextColor(...COLORS.textLight);
      doc.text(
        `Correct: ${scoreData.correct}  Wrong: ${scoreData.wrong}  Skipped: ${scoreData.skipped}`,
        pageWidth / 2,
        currentY,
        { align: "center" },
      );

      currentY = cardY + cardH + 10;
      drawProgressBar(
        MARGINS.left + 18,
        currentY,
        contentWidth - 36,
        SIZES.progressBar,
        scoreData.percentage,
      );
      currentY += SIZES.progressBar + 3;

      setPdfFont("helvetica", "normal", SIZES.labelFont);
      setPdfTextColor(...COLORS.textLight);
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

    if (isResultsMode) renderScorePage();
    else addGameHeader();

    // =========================================================
    // SECTION-BASED QUESTION RENDERING  (#1 #2 #6)
    //
    // Each Section = { height: mm, render: (topY) => void }
    // Heights are measured first; render closures are pure / stateless.
    // =========================================================

    /**
     * Build an ordered array of Section objects for one question.
     * All heights pre-computed; closures capture what they need.
     */
    const measureQuestionSections = (question, qIndex, userAns, imageInfo) => {
      const sections = [];
      const isEssay = isEssayQuestion(question);
      const qText = sanitizeText(question.q);
      const BW = CC_W; // box / button width
      const IW = BW - 3; // inner text width (small left inset)

      const { statusText } = getQuestionStatus(question, userAns, isEssay);

      // ── Section 1: Header strip ───────────────────────────────────
      sections.push({
        height: 15, // 8mm strip + 7mm gap
        render: (y) => {
          setPdfFillColor(...COLORS.primary);
          doc.roundedRect(
            MARGINS.left + SIZES.cardPad,
            y,
            contentWidth - SIZES.cardPad * 2,
            8,
            2,
            2,
            "F",
          );
          setPdfFont("helvetica", "bold", SIZES.qFont);
          setPdfTextColor(...COLORS.textWhite);
          doc.text(
            `Question #${qIndex + 1}`,
            MARGINS.left + SIZES.cardPad + 2.5,
            y + 5.5,
          );
          if (isResultsMode) {
            setPdfFont("helvetica", "normal", SIZES.optFont);
            doc.text(
              statusText,
              pageWidth - MARGINS.right - SIZES.cardPad - 2.5,
              y + 5.5,
              { align: "right" },
            );
          }
        },
      });

      // ── Section 2: Image (if present) ────────────────────────────
      if (imageInfo && imageInfo.success) {
        const { width: iW, height: iH } = imageInfo;
        sections.push({
          height: iH + 5,
          render: (y) => {
            try {
              doc.addImage(
                imageInfo.data,
                "PNG",
                CC_X + (CC_W - iW) / 2,
                y,
                iW,
                iH,
              );
            } catch (e) {
              console.error("addImage failed", e);
            }
          },
        });
      }

      // ── Section 3: Question text ──────────────────────────────────
      const qSegs = parseMarkdown(qText);
      const qContentH = calcSegmentsHeight(qSegs, BW, SIZES.qFont);
      sections.push({
        height: qContentH + 5,
        render: (y) => {
          renderSegments(qSegs, CC_X, y, BW, {
            color: COLORS.textDark,
            fontSizePt: SIZES.qFont,
          });
        },
      });

      // ── Section 4a: MCQ options ───────────────────────────────────
      if (!isEssay) {
        question.options.forEach((opt, optIndex) => {
          const isUserAns = optIndex === userAns;
          const isCorrectAns = optIndex === question.correct;
          const rawOpt = sanitizeText(opt);
          const letter = String.fromCharCode(65 + optIndex);
          const marker = isCorrectAns ? "> " : isUserAns ? "X " : "";
          const prefix = `${marker}${letter}. `;
          const isLast = optIndex === question.options.length - 1;

          // Merge prefix + option for unified word-wrap (#2 alignment fix)
          const optSegs = prependText(prefix, parseMarkdown(rawOpt));
          const optTextH = calcSegmentsHeight(
            optSegs,
            BW - SIZES.btnPad * 2,
            SIZES.optFont,
            isCorrectAns,
          );
          const btnH = Math.max(optTextH + SIZES.btnPad * 2, SIZES.btnMinH);
          const sectionH = btnH + SIZES.optGap + (isLast ? 3 : 0);

          // Capture loop variables for closure
          const _segs = optSegs;
          const _btnH = btnH;
          const _corr = isCorrectAns;
          const _user = isUserAns;

          sections.push({
            height: sectionH,
            render: (y) => {
              const tc = drawButton(CC_X, y, BW, _btnH, _corr, _user && !_corr);
              renderSegments(
                _segs,
                CC_X + SIZES.btnPad,
                y + SIZES.btnPad,
                BW - SIZES.btnPad * 2,
                { color: tc, fontSizePt: SIZES.optFont, bold: _corr },
              );
            },
          });
        });
      }

      // ── Section 4b: Essay sections ────────────────────────────────
      if (isEssay) {
        const formalText = sanitizeText(question.options[0]);

        // Score badge (results mode + answered)
        if (isResultsMode && userAns && String(userAns).trim()) {
          const score = gradeEssay(userAns, question.options[0]);
          const stars = "★".repeat(score) + "☆".repeat(5 - score);
          const label = `Score: ${score} / 5`;
          const badgeC =
            score >= 3
              ? COLORS.success
              : score > 0
                ? COLORS.warning
                : COLORS.error;
          const _score = score,
            _stars = stars,
            _label = label,
            _badgeC = badgeC;

          sections.push({
            height: 13, // 10mm badge + 3mm gap
            render: (y) => {
              setPdfFillColor(..._badgeC);
              doc.roundedRect(CC_X, y, BW, 10, 1.5, 1.5, "F");
              setPdfFont("helvetica", "bold", SIZES.optFont);
              setPdfTextColor(...COLORS.textWhite);
              doc.text(_label, CC_X + 2, y + 3.5);
              renderUnicodeText(
                _stars,
                CC_X + 30,
                y + 0.5,
                BW - 32,
                COLORS.textWhite,
                SIZES.optFont + 1,
                false,
                false,
              );
            },
          });
        }

        // User answer box (results mode)
        if (isResultsMode) {
          const userText = sanitizeText(userAns || "Not answered");
          const uContentH = calcTextHeight(userText, IW, SIZES.optFont);
          const uBoxH = Math.max(uContentH + 10, 16);
          const _uText = userText,
            _uBoxH = uBoxH;

          sections.push({
            height: uBoxH + 2,
            render: (y) => {
              setPdfFillColor(245, 247, 250);
              doc.roundedRect(CC_X, y, BW, _uBoxH, 1.5, 1.5, "F");
              setPdfFont("helvetica", "bold", SIZES.labelFont);
              setPdfTextColor(...COLORS.primary);
              doc.text("YOUR ANSWER:", CC_X + 1.5, y + 4);
              renderText(_uText, CC_X + 1.5, y + 7, IW, {
                color: COLORS.textDark,
                fontSizePt: SIZES.optFont,
              });
            },
          });
        }

        // Formal / correct answer box
        const fSegs = parseMarkdown(formalText);
        const fContentH = calcSegmentsHeight(fSegs, IW, SIZES.optFont);
        const fBoxH = Math.max(fContentH + 10, 16);
        const _fSegs = fSegs,
          _fBoxH = fBoxH;

        sections.push({
          height: fBoxH + 3,
          render: (y) => {
            setPdfFillColor(240, 253, 244);
            doc.roundedRect(CC_X, y, BW, _fBoxH, 1.5, 1.5, "F");
            setPdfFont("helvetica", "bold", SIZES.labelFont);
            setPdfTextColor(...COLORS.success);
            doc.text("CORRECT ANSWER:", CC_X + 1.5, y + 4);
            renderSegments(_fSegs, CC_X + 1.5, y + 7, IW, {
              color: COLORS.textDark,
              fontSizePt: SIZES.optFont,
            });
          },
        });
      }

      // ── Section 5: Explanation ────────────────────────────────────
      if (question.explanation) {
        const expText = sanitizeText(question.explanation);
        const eSegs = parseMarkdown(expText);
        const eContentH = calcSegmentsHeight(eSegs, IW, SIZES.optFont);
        const eBoxH = Math.max(eContentH + 9, 14);
        const _eSegs = eSegs,
          _eBoxH = eBoxH;

        sections.push({
          height: eBoxH + 3,
          render: (y) => {
            setPdfFillColor(255, 251, 235);
            doc.roundedRect(CC_X, y, BW, _eBoxH, 1.5, 1.5, "F");
            doc.setDrawColor(...COLORS.warning);
            doc.setLineWidth(0.4);
            doc.roundedRect(CC_X, y, BW, _eBoxH, 1.5, 1.5, "S");
            setPdfFont("helvetica", "bold", SIZES.labelFont);
            setPdfTextColor(...COLORS.warning);
            doc.text("EXPLANATION:", CC_X + 1.5, y + 4);
            renderSegments(_eSegs, CC_X + 1.5, y + 7, IW, {
              color: COLORS.textDark,
              fontSizePt: SIZES.optFont,
            });
          },
        });
      }

      return sections;
    };

    /**
     * Group sections into per-page arrays.
     * startY: initial Y on the current page.
     * Returns Section[][] (one inner array per page).
     */
    const groupSectionsIntoPages = (sections, startY) => {
      // Reserve card margin so the card + margin fits before footer
      const maxY =
        pageHeight - MARGINS.bottom - SIZES.footerH - SIZES.cardMargin;
      const freshY = MARGINS.top + SIZES.headerH + 6;

      const groups = [];
      let curY = startY,
        group = [];

      for (const sec of sections) {
        if (group.length > 0 && curY + sec.height > maxY) {
          groups.push(group);
          group = [];
          curY = freshY;
        }
        group.push(sec);
        curY += sec.height;
      }
      if (group.length > 0) groups.push(group);
      return groups;
    };

    /**
     * Render one question. Handles any length via section-based multi-page flow.
     */
    const renderQuestion = async (question, qIndex) => {
      const userAns = userAnswers[qIndex];
      const imageInfo = imageCache.get(qIndex) ?? null;
      const sections = measureQuestionSections(
        question,
        qIndex,
        userAns,
        imageInfo,
      );

      // If very little space remains, start fresh page before grouping
      const MIN_USEFUL = 42; // mm
      const pageBottom = pageHeight - MARGINS.bottom - SIZES.footerH;
      if (pageBottom - currentY < MIN_USEFUL) {
        addGameFooter();
        doc.addPage();
        currentLevel++;
        addGameHeader();
      }

      const pageGroups = groupSectionsIntoPages(sections, currentY);

      for (let gi = 0; gi < pageGroups.length; gi++) {
        if (gi > 0) {
          addGameFooter();
          doc.addPage();
          currentLevel++;
          addGameHeader();
        }

        const group = pageGroups[gi];
        const groupH = group.reduce((s, sec) => s + sec.height, 0);
        const cardH = groupH + SIZES.cardPad * 2;
        const cardY = currentY;

        drawCard(MARGINS.left, cardY, contentWidth, cardH);

        let secY = cardY + CARD_TOP_OFF;
        for (const sec of group) {
          sec.render(secY);
          secY += sec.height;
        }

        currentY = cardY + cardH + SIZES.cardMargin;
      }
    };

    // =========================================================
    // PARALLEL IMAGE PRE-LOADING  (#7 — no sequential awaits)
    // =========================================================
    const imageCache = new Map();
    await Promise.all(
      questions.map(async (q, i) => {
        if (q.image) {
          const info = await processImage(q.image);
          if (info.success) imageCache.set(i, info);
        }
      }),
    );

    // =========================================================
    // RENDER ALL QUESTIONS
    // =========================================================
    for (const [index, question] of questions.entries()) {
      await renderQuestion(question, index);
    }

    // =========================================================
    // FINAL CTA PAGE
    // =========================================================
    const renderCTAPage = () => {
      addGameFooter();
      doc.addPage();
      currentLevel++;
      addGameHeader();

      const cardH = 55,
        cardY = currentY + 18;
      drawCard(MARGINS.left + 8, cardY, contentWidth - 16, cardH);
      currentY = cardY + 12;

      setPdfFont("helvetica", "bold", 32);
      setPdfTextColor(...COLORS.primary);
      doc.text("End", pageWidth / 2, currentY, { align: "center" });
      currentY += 14;

      setPdfFont("helvetica", "bold", 20);
      doc.text("READY FOR MORE?", pageWidth / 2, currentY, { align: "center" });
      currentY += 8;

      setPdfFont("helvetica", "normal", SIZES.qFont);
      setPdfTextColor(...COLORS.textLight);
      doc.text(
        "Continue your journey with more challenges!",
        pageWidth / 2,
        currentY,
        { align: "center" },
      );
      currentY += 10;

      const bX = MARGINS.left + 25,
        bY = currentY,
        bW = contentWidth - 50;
      setPdfFillColor(...COLORS.primary);
      doc.roundedRect(bX, bY, bW, 12, 2.5, 2.5, "F");
      setPdfFont("helvetica", "bold", SIZES.qFont);
      setPdfTextColor(...COLORS.textWhite);
      doc.text("PLAY MORE QUIZZES", pageWidth / 2, bY + 7.5, {
        align: "center",
      });
      currentY += 25;

      setPdfFont("helvetica", "bold", 18);
      setPdfTextColor(...COLORS.info);
      doc.text("https://basmagi-quiz.vercel.app/", pageWidth / 2, currentY, {
        align: "center",
      });

      addGameFooter(true);
    };

    renderCTAPage();

    // =========================================================
    // SAVE
    // =========================================================
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
