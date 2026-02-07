// Script/exportToPptx.js
// Downloads the quiz as a PowerPoint file (.pptx)
// Deals with the export from both main page and results/summary page
// `pptxgen` library used, included in this file.

/**
 * =====================================================
 * EXPORT TO PPTX - PROFESSIONAL QUIZ PRESENTATION (V2)
 * =====================================================
 *
 * FIXED ISSUES:
 * - Dynamic layout engine with currentY tracking
 * - Proper click-sequence animations
 * - Slide transitions
 * - 2-column grid for many options
 * - Image aspect ratio preservation
 * - Auto-fit text to prevent overflow
 */

let pptxgen;

async function loadPptxGen() {
  if (!pptxgen) {
    const module =
      await import("https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/+esm");
    pptxgen = module.default;
    window.pptxgen = pptxgen;
  }
  return pptxgen;
}

export async function exportToPptx(config, questions, userAnswers = []) {
  try {
    await loadPptxGen();

    // ===========================
    // VALIDATION
    // ===========================
    if (!config || !questions || !Array.isArray(questions)) {
      throw new Error(
        "Invalid parameters: config and questions array required",
      );
    }

    // ===========================
    // INITIALIZE PRESENTATION
    // ===========================
    const pptx = new pptxgen();

    // ===========================
    // CONSTANTS & CONFIGURATION
    // ===========================
    const SLIDE_WIDTH = 10;
    const SLIDE_HEIGHT = 5.625;
    const MARGIN = 0.4;
    const HEADER_HEIGHT = 0.5;
    const FOOTER_HEIGHT = 0.3;
    const USABLE_HEIGHT =
      SLIDE_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - MARGIN * 2;
    const USABLE_WIDTH = SLIDE_WIDTH - MARGIN * 2;
    const MAX_IMAGE_HEIGHT = USABLE_HEIGHT * 0.3; // 30% max

    const COLORS = Object.freeze({
      primary: "6A5ACD",
      secondary: "FFD700",
      success: "10B981",
      error: "EF4444",
      warning: "F59E0B",
      info: "3B82F6",
      background: "FFFFFF",
      cardBg: "F8FAFC",
      textDark: "1E293B",
      textLight: "64748B",
      border: "E2E8F0",
      optionNeutral: "E2E8F0",
      userWrong: "FEE2E2",
      correctBg: "D1FAE5",
    });

    // ===========================
    // UTILITY FUNCTIONS
    // ===========================
    function sanitizeText(text) {
      if (!text) return "";
      return String(text)
        .trim()
        .replace(/[^\x20-\x7E]/g, "");
    }

    function isEssayQuestion(q) {
      return q.options && q.options.length === 1;
    }

    function calculateScore() {
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
    }

    async function getImageDimensions(imageSource) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error("Failed to load image"));
        img.crossOrigin = "Anonymous";
        img.src = imageSource;
      });
    }

    function calculateImageSize(imgWidth, imgHeight, maxWidth, maxHeight) {
      const aspectRatio = imgWidth / imgHeight;
      let width = maxWidth;
      let height = width / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      return { width, height, aspectRatio };
    }

    const currentName = config.name || "Player";
    const documentTitle = sanitizeText(config.title || "Quiz Quest");

    const isResultsMode =
      userAnswers &&
      (Array.isArray(userAnswers)
        ? userAnswers.length > 0
        : Object.keys(userAnswers).length > 0);

    const scoreData = isResultsMode ? calculateScore() : null;

    // ===========================
    // PRESENTATION PROPERTIES
    // ===========================
    pptx.author = "Belal Amr - Quiz Quest";
    pptx.title = documentTitle;
    pptx.subject = "Interactive Quiz Results";
    pptx.layout = "LAYOUT_16x9";

    // ===========================
    // HELPER: ADD HEADER TO SLIDE
    // ===========================
    function addHeader(slide) {
      slide.addText(documentTitle, {
        x: MARGIN,
        y: 0.1,
        w: USABLE_WIDTH / 2,
        h: 0.4,
        fontSize: 18,
        bold: true,
        color: COLORS.primary,
        align: "left",
      });

      slide.addText(`🏆 ${currentName}`, {
        x: MARGIN + USABLE_WIDTH / 2,
        y: 0.1,
        w: USABLE_WIDTH / 2,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: COLORS.secondary,
        align: "right",
      });

      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0,
        y: HEADER_HEIGHT,
        w: SLIDE_WIDTH,
        h: 0.02,
        fill: { color: COLORS.primary },
      });
    }

    // ===========================
    // HELPER: ADD FOOTER TO SLIDE
    // ===========================
    function addFooter(slide) {
      slide.addText("Crafted by Belal Amr", {
        x: MARGIN,
        y: SLIDE_HEIGHT - FOOTER_HEIGHT,
        w: USABLE_WIDTH,
        h: FOOTER_HEIGHT,
        fontSize: 11,
        color: COLORS.textLight,
        align: "center",
      });
    }

    // ===========================
    // TITLE SLIDE
    // ===========================
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: COLORS.background };
    titleSlide.transition = { type: "fade", duration: 0.5 };

    addHeader(titleSlide);
    addFooter(titleSlide);

    titleSlide.addText("🎯 " + documentTitle, {
      x: 1,
      y: 1.8,
      w: 8,
      h: 0.8,
      fontSize: 44,
      bold: true,
      color: COLORS.primary,
      align: "center",
    });

    titleSlide.addText(isResultsMode ? "QUIZ RESULTS" : "QUIZ PREVIEW", {
      x: 1,
      y: 2.8,
      w: 8,
      h: 0.5,
      fontSize: 26,
      color: COLORS.textLight,
      align: "center",
    });

    titleSlide.addText(`${questions.length} Questions`, {
      x: 1,
      y: 3.5,
      w: 8,
      h: 0.4,
      fontSize: 18,
      color: COLORS.textLight,
      align: "center",
    });

    // ===========================
    // RESULTS SUMMARY SLIDE
    // ===========================
    if (isResultsMode && scoreData) {
      const summarySlide = pptx.addSlide();
      summarySlide.background = { color: COLORS.background };
      summarySlide.transition = { type: "fade", duration: 0.5 };

      addHeader(summarySlide);
      addFooter(summarySlide);

      summarySlide.addText("🎯 QUIZ COMPLETE!", {
        x: 1,
        y: 0.9,
        w: 8,
        h: 0.5,
        fontSize: 32,
        bold: true,
        color: COLORS.primary,
        align: "center",
      });

      summarySlide.addText(`${scoreData.percentage}%`, {
        x: 3.5,
        y: 1.6,
        w: 3,
        h: 1,
        fontSize: 72,
        bold: true,
        color: scoreData.isPassing ? COLORS.success : COLORS.warning,
        align: "center",
      });

      const message = scoreData.isPassing
        ? "🏆 LEGENDARY! 🏆"
        : "💪 KEEP GRINDING! 💪";
      summarySlide.addText(message, {
        x: 1,
        y: 2.8,
        w: 8,
        h: 0.5,
        fontSize: 26,
        bold: true,
        color: COLORS.primary,
        align: "center",
      });

      const statsData = [
        [
          { text: "Score", options: { bold: true, fontSize: 16 } },
          {
            text: `${scoreData.correct} / ${scoreData.totalScorable}`,
            options: { bold: true, fontSize: 16, color: COLORS.success },
          },
        ],
        [
          { text: "Correct ✓", options: { fontSize: 14 } },
          {
            text: String(scoreData.correct),
            options: { fontSize: 14, color: COLORS.success },
          },
        ],
        [
          { text: "Wrong ✗", options: { fontSize: 14 } },
          {
            text: String(scoreData.wrong),
            options: { fontSize: 14, color: COLORS.error },
          },
        ],
        [
          { text: "Skipped ⊝", options: { fontSize: 14 } },
          {
            text: String(scoreData.skipped),
            options: { fontSize: 14, color: COLORS.textLight },
          },
        ],
      ];

      summarySlide.addTable(statsData, {
        x: 2.5,
        y: 3.6,
        w: 5,
        h: 0.8,
        border: { pt: 2, color: COLORS.primary },
        fill: { color: COLORS.cardBg },
        align: "center",
        valign: "middle",
      });
    }

    // ===========================
    // QUESTION SLIDES WITH DYNAMIC LAYOUT
    // ===========================
    for (const [index, question] of questions.entries()) {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.background };
      slide.transition = { type: "fade", duration: 0.5 };

      addHeader(slide);
      addFooter(slide);

      const isEssay = isEssayQuestion(question);
      const userAns = userAnswers[index];
      const questionText = sanitizeText(question.q);
      const hasUserAnswer =
        isResultsMode && userAns !== undefined && userAns !== null;

      // Dynamic Y tracking - starts after header
      let currentY = HEADER_HEIGHT + MARGIN;
      const contentStartY = currentY;
      const maxContentY = SLIDE_HEIGHT - FOOTER_HEIGHT - MARGIN;

      // ===========================
      // QUESTION HEADER
      // ===========================
      let statusBadge = "";
      let statusColor = COLORS.textLight;

      if (isResultsMode) {
        if (isEssay) {
          statusBadge = " [ESSAY]";
          statusColor = COLORS.warning;
        } else if (!hasUserAnswer) {
          statusBadge = " [SKIPPED]";
          statusColor = COLORS.textLight;
        } else if (userAns === question.correct) {
          statusBadge = " [✓ CORRECT]";
          statusColor = COLORS.success;
        } else {
          statusBadge = " [✗ WRONG]";
          statusColor = COLORS.error;
        }
      }

      slide.addText(
        [
          {
            text: `Question #${index + 1}`,
            options: { fontSize: 22, bold: true, color: COLORS.primary },
          },
          {
            text: statusBadge,
            options: { fontSize: 18, bold: true, color: statusColor },
          },
        ],
        {
          x: MARGIN,
          y: currentY,
          w: USABLE_WIDTH,
          h: 0.35,
        },
      );

      currentY += 0.4;

      // ===========================
      // IMAGE HANDLING WITH ASPECT RATIO
      // ===========================
      let imageProcessed = false;
      let imageDimensions = null;

      if (question.image) {
        try {
          const imgDims = await getImageDimensions(question.image);
          const aspectRatio = imgDims.width / imgDims.height;
          const isSquareOrWide = aspectRatio >= 1;

          // Calculate image size
          let imgSize = calculateImageSize(
            imgDims.width,
            imgDims.height,
            USABLE_WIDTH * (isSquareOrWide ? 0.35 : 0.9),
            MAX_IMAGE_HEIGHT,
          );

          imageDimensions = imgSize;

          // Decide layout: side-by-side for square/wide images, stacked for tall
          if (isSquareOrWide && imgSize.width < USABLE_WIDTH * 0.4) {
            // Side-by-side layout
            slide.addImage({
              path: question.image,
              x: MARGIN,
              y: currentY,
              w: imgSize.width,
              h: imgSize.height,
            });

            // Question text next to image
            const textX = MARGIN + imgSize.width + 0.2;
            const textW = USABLE_WIDTH - imgSize.width - 0.2;

            slide.addText(questionText, {
              x: textX,
              y: currentY,
              w: textW,
              h: imgSize.height,
              fontSize: 18,
              color: COLORS.textDark,
              bold: true,
              valign: "top",
              wrap: true,
            });

            currentY += Math.max(imgSize.height, 0.6) + 0.2;
          } else {
            // Stacked layout
            slide.addImage({
              path: question.image,
              x: MARGIN + (USABLE_WIDTH - imgSize.width) / 2,
              y: currentY,
              w: imgSize.width,
              h: imgSize.height,
            });

            currentY += imgSize.height + 0.15;

            // Question text below image
            slide.addText(questionText, {
              x: MARGIN,
              y: currentY,
              w: USABLE_WIDTH,
              h: 0.5,
              fontSize: 18,
              color: COLORS.textDark,
              bold: true,
              valign: "top",
              wrap: true,
            });

            currentY += 0.6;
          }

          imageProcessed = true;
        } catch (err) {
          console.warn("Failed to load image:", err);
        }
      }

      // If no image or image failed, add question text normally
      if (!imageProcessed) {
        slide.addText(questionText, {
          x: MARGIN,
          y: currentY,
          w: USABLE_WIDTH,
          h: 0.5,
          fontSize: 18,
          color: COLORS.textDark,
          bold: true,
          valign: "top",
          wrap: true,
        });

        currentY += 0.6;
      }

      // ===========================
      // CALCULATE REMAINING SPACE
      // ===========================
      const remainingHeight = maxContentY - currentY;
      const hasExplanation =
        question.explanation && question.explanation.trim();
      const explanationHeight = hasExplanation ? 0.6 : 0;

      // ===========================
      // HANDLE ESSAY QUESTIONS
      // ===========================
      if (isEssay) {
        const correctAnswer = sanitizeText(question.options[0]);
        const availableHeight = remainingHeight - explanationHeight;
        let answerBoxHeight = Math.min(
          availableHeight / (isResultsMode ? 2.2 : 1.2),
          0.8,
        );

        // Adjust font size based on content length
        let fontSize = 14;
        if (correctAnswer.length > 200) fontSize = 12;
        if (correctAnswer.length > 400) fontSize = 10;

        // USER'S ANSWER (Results Mode)
        if (isResultsMode) {
          const userText =
            typeof userAns === "string"
              ? sanitizeText(userAns)
              : "Not answered";

          slide.addText("YOUR ANSWER:", {
            x: MARGIN,
            y: currentY,
            w: USABLE_WIDTH,
            h: 0.25,
            fontSize: 13,
            bold: true,
            color: COLORS.primary,
            opacity: 0,
            animation: { type: "appear", trigger: "onclick" },
          });

          slide.addText(userText, {
            x: MARGIN,
            y: currentY + 0.25,
            w: USABLE_WIDTH,
            h: answerBoxHeight,
            fontSize: fontSize,
            color: COLORS.textDark,
            fill: { color: "F5F7FA" },
            margin: 0.1,
            wrap: true,
            valign: "top",
            opacity: 0,
            animation: { type: "appear", trigger: "onclick" },
          });

          currentY += answerBoxHeight + 0.35;
        }

        // CORRECT ANSWER
        slide.addText("CORRECT ANSWER:", {
          x: MARGIN,
          y: currentY,
          w: USABLE_WIDTH,
          h: 0.25,
          fontSize: 13,
          bold: true,
          color: COLORS.success,
          opacity: 0,
          animation: { type: "appear", trigger: "onclick" },
        });

        slide.addText(correctAnswer, {
          x: MARGIN,
          y: currentY + 0.25,
          w: USABLE_WIDTH,
          h: answerBoxHeight,
          fontSize: fontSize,
          color: COLORS.textDark,
          fill: { color: COLORS.correctBg },
          margin: 0.1,
          wrap: true,
          valign: "top",
          opacity: 0,
          animation: { type: "appear", trigger: "onclick" },
        });

        currentY += answerBoxHeight + 0.35;
      } else {
        // ===========================
        // HANDLE MULTIPLE CHOICE
        // ===========================
        const optionCount = question.options.length;
        const useTwoColumns = optionCount > 3;

        const availableHeight = remainingHeight - explanationHeight - 0.1;
        let optionHeight = 0.35;
        let fontSize = 15;

        // Calculate optimal option height and font size
        if (useTwoColumns) {
          const rowsNeeded = Math.ceil(optionCount / 2);
          optionHeight = Math.min(availableHeight / rowsNeeded, 0.45);
          if (optionHeight < 0.3) {
            optionHeight = 0.3;
            fontSize = 13;
          }
        } else {
          optionHeight = Math.min(availableHeight / optionCount, 0.5);
          if (optionHeight < 0.35) {
            optionHeight = 0.35;
            fontSize = 14;
          }
        }

        const optionSpacing = 0.05;
        const columnWidth = useTwoColumns
          ? (USABLE_WIDTH - 0.3) / 2
          : USABLE_WIDTH;

        question.options.forEach((opt, optIndex) => {
          const isUserChoice = hasUserAnswer && optIndex === userAns;
          const isCorrect = optIndex === question.correct;
          const prefix = String.fromCharCode(65 + optIndex);
          const optionText = `${prefix}. ${sanitizeText(opt)}`;

          // Calculate position
          let xPos = MARGIN;
          let yPos = currentY;

          if (useTwoColumns) {
            const row = Math.floor(optIndex / 2);
            const col = optIndex % 2;
            xPos = MARGIN + col * (columnWidth + 0.3);
            yPos = currentY + row * (optionHeight + optionSpacing);
          } else {
            yPos = currentY + optIndex * (optionHeight + optionSpacing);
          }

          // Determine styling
          let bgColor = COLORS.optionNeutral;
          let textColor = COLORS.textDark;
          let borderColor = COLORS.border;

          // Base option (neutral) - appears first
          slide.addText(optionText, {
            x: xPos,
            y: yPos,
            w: columnWidth,
            h: optionHeight,
            fontSize: fontSize,
            color: textColor,
            fill: { color: bgColor },
            align: "left",
            valign: "middle",
            margin: 0.08,
            wrap: true,
            opacity: 0,
            animation: { type: "appear", trigger: "onclick" },
          });

          // User's wrong answer highlight (if applicable)
          if (isUserChoice && !isCorrect) {
            slide.addShape(pptx.shapes.RECTANGLE, {
              x: xPos,
              y: yPos,
              w: columnWidth,
              h: optionHeight,
              fill: { color: COLORS.userWrong, transparency: 30 },
              line: { color: COLORS.error, width: 3 },
              opacity: 0,
              animation: { type: "appear", trigger: "onclick" },
            });
          }

          // Correct answer highlight
          if (isCorrect) {
            slide.addShape(pptx.shapes.RECTANGLE, {
              x: xPos,
              y: yPos,
              w: columnWidth,
              h: optionHeight,
              fill: { color: COLORS.correctBg, transparency: 30 },
              line: { color: COLORS.success, width: 3 },
              opacity: 0,
              animation: { type: "appear", trigger: "onclick" },
            });
          }
        });

        // Update currentY
        if (useTwoColumns) {
          const rowsUsed = Math.ceil(optionCount / 2);
          currentY += rowsUsed * (optionHeight + optionSpacing) + 0.1;
        } else {
          currentY += optionCount * (optionHeight + optionSpacing) + 0.1;
        }
      }

      // ===========================
      // EXPLANATION (if space allows)
      // ===========================
      if (hasExplanation) {
        const expText = sanitizeText(question.explanation);
        const remainingSpace = maxContentY - currentY;

        if (remainingSpace > 0.4) {
          let expFontSize = 13;
          let expHeight = Math.min(remainingSpace - 0.05, 0.6);

          if (expText.length > 200) expFontSize = 11;

          slide.addText("💡 EXPLANATION:", {
            x: MARGIN,
            y: currentY,
            w: USABLE_WIDTH,
            h: 0.25,
            fontSize: 12,
            bold: true,
            color: COLORS.warning,
            opacity: 0,
            animation: { type: "appear", trigger: "onclick" },
          });

          slide.addText(expText, {
            x: MARGIN,
            y: currentY + 0.25,
            w: USABLE_WIDTH,
            h: expHeight,
            fontSize: expFontSize,
            color: COLORS.textDark,
            italic: true,
            fill: { color: "FFFBEB" },
            margin: 0.08,
            wrap: true,
            valign: "top",
            opacity: 0,
            animation: { type: "appear", trigger: "onclick" },
          });
        }
      }
    }

    // ===========================
    // CTA SLIDE
    // ===========================
    const ctaSlide = pptx.addSlide();
    ctaSlide.background = { color: COLORS.background };
    ctaSlide.transition = { type: "fade", duration: 0.5 };

    addHeader(ctaSlide);
    addFooter(ctaSlide);

    ctaSlide.addText("🎮 End 🎮", {
      x: 1,
      y: 1.4,
      w: 8,
      h: 0.7,
      fontSize: 50,
      bold: true,
      color: COLORS.primary,
      align: "center",
    });

    ctaSlide.addText("READY FOR MORE?", {
      x: 1,
      y: 2.3,
      w: 8,
      h: 0.5,
      fontSize: 28,
      bold: true,
      color: COLORS.primary,
      align: "center",
    });

    ctaSlide.addText("Continue your journey with more challenges!", {
      x: 1,
      y: 2.9,
      w: 8,
      h: 0.4,
      fontSize: 17,
      color: COLORS.textLight,
      align: "center",
    });

    ctaSlide.addShape(pptx.shapes.RECTANGLE, {
      x: 2.5,
      y: 3.5,
      w: 5,
      h: 0.6,
      fill: { color: COLORS.primary },
      line: { color: COLORS.primary, width: 2 },
    });

    ctaSlide.addText("PLAY MORE QUIZZES", {
      x: 2.5,
      y: 3.6,
      w: 5,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: COLORS.background,
      align: "center",
      hyperlink: { url: "https://divquizzes.vercel.app/" },
    });

    ctaSlide.addText("https://divquizzes.vercel.app/", {
      x: 1,
      y: 4.3,
      w: 8,
      h: 0.3,
      fontSize: 15,
      color: "0563C1",
      underline: { style: "sng" },
      align: "center",
      hyperlink: { url: "https://divquizzes.vercel.app/" },
    });

    // ===========================
    // EXPORT
    // ===========================
    const filename = `${sanitizeText(config.title || "Quiz")}.pptx`;
    await pptx.writeFile({ fileName: filename });

    console.log(`Professional PowerPoint exported: ${filename}`);
    return { success: true, filename };
  } catch (error) {
    console.error("PowerPoint Export Error:", error);
    alert(`Failed to export PowerPoint: ${error.message}`);
    return { success: false, error: error.message };
  }
}
