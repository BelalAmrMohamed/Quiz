// Script/exportToPdf.js
// Downloads the quiz as a PDF file (.pdf)
// Deals with the export from both main page and results/summary page
// `jsPDF` library used, included in the html. See => "summary.html"

const currentName = localStorage.getItem("username") || "User";

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
    const isResultsMode =
      userAnswers &&
      (Array.isArray(userAnswers)
        ? userAnswers.length > 0
        : Object.keys(userAnswers).length > 0);

    if (isResultsMode) renderScorePage();
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
      if (isResultsMode) {
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
        doc.text(
          userText,
          MARGINS.left + SIZES.cardPadding + 4.5,
          currentY + 8,
          {
            maxWidth: boxWidth - 6,
          },
        );
        currentY += 17;
      }

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
      doc.setFontSize(18);
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
