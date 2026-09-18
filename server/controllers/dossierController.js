const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const Event = require("../models/Event");
const EventPlan = require("../models/EventPlan");
const EventBudget = require("../models/EventBudget");
const EventTask = require("../models/EventTask");

const { getMatchedVendors } = require("../services/vendorMatchingService");

// ============================================================
// GENERATE EVENT DOSSIER PDF
// GET /api/events/:eventId/dossier
// ============================================================

const generateEventDossier = async (req, res) => {
  const { eventId } = req.params;

  try {
    // ========================================================
    // 1. VALIDATE EVENT ID
    // ========================================================

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    // ========================================================
    // 2. GET EVENT
    // ========================================================

    const event = await Event.findOne({
      _id: eventId,
      user: req.user._id,
    }).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // ========================================================
    // 3. GET AI PLAN
    // ========================================================

    const eventPlan = await EventPlan.findOne({
      event: event._id,
      user: req.user._id,
    }).lean();

    // ========================================================
    // 4. GET BUDGET
    // ========================================================

    const eventBudget = await EventBudget.findOne({
      event: event._id,
      user: req.user._id,
    }).lean();

    // ========================================================
    // 5. GET TIMELINE TASKS
    // ========================================================

    const tasks = await EventTask.find({
      event: event._id,
      user: req.user._id,
    })
      .sort({
        dueDate: 1,
        order: 1,
      })
      .lean();

    // ========================================================
    // 6. GET MATCHED VENDORS
    // ========================================================

    let vendors = [];

    try {
      vendors = await getMatchedVendors(event, {
        limit: 10,
      });

      if (!Array.isArray(vendors)) {
        vendors = [];
      }
    } catch (vendorError) {
      console.error("[DOSSIER] Vendor matching failed:", vendorError.message);

      vendors = [];
    }

    // ========================================================
    // 7. CREATE PDF
    // ========================================================

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,

      info: {
        Title: `${event.title} - EventWise Event Dossier`,
        Author: "EventWise",
        Subject: "AI-Powered Event Planning Dossier",
        Creator: "EventWise",
      },
    });

    const filename = `${sanitizeFilename(event.title)}-EventWise-Dossier.pdf`;

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.setHeader("Cache-Control", "no-cache");

    doc.pipe(res);

    // ========================================================
    // COLORS
    // ========================================================

    const COLORS = {
      primary: "#4F46E5",
      primaryDark: "#3730A3",
      primaryLight: "#EEF2FF",

      success: "#059669",
      successLight: "#ECFDF5",

      warning: "#D97706",
      warningLight: "#FFFBEB",

      danger: "#DC2626",
      dangerLight: "#FEF2F2",

      dark: "#111827",
      text: "#374151",
      muted: "#6B7280",
      lightText: "#9CA3AF",

      border: "#E5E7EB",
      background: "#F8FAFC",

      white: "#FFFFFF",
    };

    // ========================================================
    // PAGE CONSTANTS
    // ========================================================

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;

    const LEFT = 50;
    const RIGHT = 545;

    const CONTENT_WIDTH = RIGHT - LEFT;

    const FOOTER_Y = 800;

    // ========================================================
    // HELPER: FORMAT DATE
    // ========================================================

    const formatDate = (date) => {
      if (!date) {
        return "Not available";
      }

      const parsed = new Date(date);

      if (Number.isNaN(parsed.getTime())) {
        return String(date);
      }

      return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    // ========================================================
    // HELPER: FORMAT CURRENCY
    // ========================================================
    // PDFKit Helvetica does not reliably render the ₹ symbol.
    // Therefore we intentionally use:
    //
    // INR 110,000
    //
    // instead of:
    //
    // ₹110,000
    //
    // ========================================================

    const formatCurrency = (amount, currency = event.currency || "INR") => {
      const numericAmount = Number(amount);

      if (!Number.isFinite(numericAmount)) {
        return "Not available";
      }

      try {
        const formatted = new Intl.NumberFormat("en-IN", {
          maximumFractionDigits: 0,
        }).format(numericAmount);

        return `${currency || "INR"} ${formatted}`;
      } catch {
        return `${currency || "INR"} ${numericAmount.toLocaleString("en-IN")}`;
      }
    };

    // ========================================================
    // HELPER: SAFE TEXT
    // ========================================================

    const safeText = (value, fallback = "Not available") => {
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        return fallback;
      }

      return String(value);
    };

    // ========================================================
    // HELPER: BUDGET CATEGORY AMOUNT
    // ========================================================

    const getBudgetCategoryAmount = (category) => {
      return Number(
        category.allocatedAmount ??
          category.amount ??
          category.allocated ??
          category.budget ??
          0,
      );
    };

    // ========================================================
    // HELPER: BUDGET CATEGORY PERCENTAGE
    // ========================================================

    const getBudgetCategoryPercentage = (category, totalBudget) => {
      const explicitPercentage = Number(category.percentage);

      if (Number.isFinite(explicitPercentage)) {
        return explicitPercentage;
      }

      const amount = getBudgetCategoryAmount(category);

      if (!totalBudget) {
        return 0;
      }

      return (amount / totalBudget) * 100;
    };

    // ========================================================
    // HELPER: ROUNDED BOX
    // ========================================================

    const roundedBox = (
      x,
      y,
      width,
      height,
      fillColor,
      strokeColor = null,
      radius = 8,
    ) => {
      doc.roundedRect(x, y, width, height, radius);

      if (fillColor) {
        doc.fillColor(fillColor).fill();
      }

      if (strokeColor) {
        doc
          .roundedRect(x, y, width, height, radius)
          .lineWidth(0.8)
          .strokeColor(strokeColor)
          .stroke();
      }
    };

    // ========================================================
    // HELPER: PAGE SPACE
    // ========================================================

    const checkPageSpace = (requiredHeight = 80) => {
      if (doc.y + requiredHeight > 770) {
        doc.addPage();

        doc.y = 55;
      }
    };

    // ========================================================
    // HELPER: SECTION HEADER
    // ========================================================

    const addSectionHeader = (number, title, subtitle = "") => {
      checkPageSpace(80);

      const heading = number !== "" ? `${number}. ${title}` : title;

      doc
        .font("Helvetica-Bold")
        .fontSize(19)
        .fillColor(COLORS.dark)
        .text(heading, LEFT, doc.y);

      doc.moveDown(0.25);

      doc
        .moveTo(LEFT, doc.y)
        .lineTo(LEFT + 45, doc.y)
        .lineWidth(3)
        .strokeColor(COLORS.primary)
        .stroke();

      doc.moveDown(0.55);

      if (subtitle) {
        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(COLORS.muted)
          .text(subtitle, {
            width: CONTENT_WIDTH,
          });

        doc.moveDown(0.6);
      }
    };

    // ========================================================
    // HELPER: LABEL / VALUE
    // ========================================================

    const addLabelValue = (label, value, x = LEFT, width = CONTENT_WIDTH) => {
      checkPageSpace(30);

      doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor(COLORS.text)
        .text(`${label}: `, x, doc.y, {
          continued: true,
          width,
        });

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(COLORS.dark)
        .text(safeText(value), {
          width,
        });

      doc.moveDown(0.15);
    };

    // ========================================================
    // HELPER: BULLET
    // ========================================================

    const addBullet = (text, indent = 15) => {
      checkPageSpace(25);

      const startY = doc.y;

      doc
        .circle(LEFT + 3, startY + 5, 2)
        .fillColor(COLORS.primary)
        .fill();

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(COLORS.text)
        .text(safeText(text), LEFT + indent, startY, {
          width: CONTENT_WIDTH - indent,
          lineGap: 2,
        });

      doc.moveDown(0.25);
    };

    // ========================================================
    // HELPER: BADGE
    // ========================================================

    const addBadge = (text, x, y, width = 90) => {
      roundedBox(x, y, width, 20, COLORS.primaryLight, null, 10);

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(COLORS.primaryDark)
        .text(safeText(text), x, y + 6, {
          width,
          align: "center",
        });
    };

    // ========================================================
    // COVER PAGE
    // ========================================================

    // Top accent
    doc.rect(0, 0, PAGE_WIDTH, 8).fillColor(COLORS.primary).fill();

    doc.y = 65;

    // Brand
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor(COLORS.primary)
      .text("EventWise");

    doc.moveDown(0.25);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text("AI-POWERED EVENT PLANNING PLATFORM");

    doc.moveDown(2.5);

    // Main title
    doc
      .font("Helvetica-Bold")
      .fontSize(31)
      .fillColor(COLORS.dark)
      .text("Event Planning", {
        width: CONTENT_WIDTH,
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(31)
      .fillColor(COLORS.primary)
      .text("Dossier", {
        width: CONTENT_WIDTH,
      });

    doc.moveDown(0.8);

    doc
      .font("Helvetica")
      .fontSize(18)
      .fillColor(COLORS.text)
      .text(safeText(event.title), {
        width: CONTENT_WIDTH,
      });

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor(COLORS.muted)
      .text("A personalized event planning report generated by EventWise.", {
        width: CONTENT_WIDTH,
      });

    doc.moveDown(2);

    // ========================================================
    // COVER SUMMARY CARDS
    // ========================================================

    const cardGap = 10;

    const cardWidth = (CONTENT_WIDTH - cardGap * 2) / 3;

    const cardY = doc.y;

    const drawCoverCard = (x, label, value, smallText = "") => {
      roundedBox(x, cardY, cardWidth, 82, COLORS.background, COLORS.border, 10);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(label.toUpperCase(), x + 12, cardY + 13);

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(COLORS.dark)
        .text(safeText(value), x + 12, cardY + 34, {
          width: cardWidth - 24,
        });

      if (smallText) {
        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(COLORS.primary)
          .text(smallText, x + 12, cardY + 61, {
            width: cardWidth - 24,
          });
      }
    };

    drawCoverCard(
      LEFT,
      "Event Date",
      formatDate(event.eventDate),
      event.startTime
        ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`
        : "",
    );

    drawCoverCard(
      LEFT + cardWidth + cardGap,
      "Guests",
      String(event.guestCount || "0"),
      "Expected attendees",
    );

    drawCoverCard(
      LEFT + (cardWidth + cardGap) * 2,
      "Budget",
      formatCurrency(event.budget, event.currency),
      "Planned event budget",
    );

    doc.y = cardY + 110;

    // ========================================================
    // EVENT OVERVIEW
    // ========================================================

    roundedBox(LEFT, doc.y, CONTENT_WIDTH, 150, COLORS.primaryLight, null, 12);

    const overviewY = doc.y;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(COLORS.primaryDark)
      .text("EVENT OVERVIEW", LEFT + 18, overviewY + 18);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(
        safeText(event.description, "No event description was provided."),
        LEFT + 18,
        overviewY + 44,
        {
          width: CONTENT_WIDTH - 36,
          height: 55,
          lineGap: 3,
          ellipsis: true,
        },
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(`Type: ${safeText(event.eventType)}`, LEFT + 18, overviewY + 105);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(
        `Location: ${safeText(event.location)}`,
        LEFT + 18,
        overviewY + 122,
      );

    doc.y = overviewY + 180;

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(COLORS.lightText)
      .text(
        `Generated by EventWise on ${new Date().toLocaleDateString("en-IN")}`,
        LEFT,
        doc.y,
      );

    // ========================================================
    // 1. EVENT DETAILS
    // ========================================================

    doc.addPage();

    addSectionHeader(
      "1",
      "Event Details",
      "Core information and planning preferences for your event.",
    );

    const detailBoxWidth = (CONTENT_WIDTH - 10) / 2;

    const drawDetailBox = (x, y, label, value) => {
      roundedBox(x, y, detailBoxWidth, 55, COLORS.white, COLORS.border, 8);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(label.toUpperCase(), x + 12, y + 10);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(COLORS.dark)
        .text(safeText(value), x + 12, y + 27, {
          width: detailBoxWidth - 24,
          height: 18,
          ellipsis: true,
        });
    };

    let detailsY = doc.y;

    drawDetailBox(LEFT, detailsY, "Event Name", event.title);

    drawDetailBox(
      LEFT + detailBoxWidth + 10,
      detailsY,
      "Event Type",
      event.eventType,
    );

    detailsY += 65;

    drawDetailBox(LEFT, detailsY, "Date", formatDate(event.eventDate));

    drawDetailBox(
      LEFT + detailBoxWidth + 10,
      detailsY,
      "Location",
      event.location,
    );

    detailsY += 65;

    drawDetailBox(LEFT, detailsY, "Guests", event.guestCount);

    drawDetailBox(
      LEFT + detailBoxWidth + 10,
      detailsY,
      "Budget",
      formatCurrency(event.budget, event.currency),
    );

    doc.y = detailsY + 85;

    // Description
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(COLORS.dark)
      .text("Description");

    doc.moveDown(0.35);

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(COLORS.text)
      .text(safeText(event.description, "No description provided."), {
        width: CONTENT_WIDTH,
        lineGap: 3,
      });

    doc.moveDown(1);

    // Planning preferences
    if (event.planningPreferences) {
      addSectionHeader("", "Planning Preferences");

      const preferences = [
        ["Style", event.planningPreferences.style],
        ["Food", event.planningPreferences.food],
        ["Decoration", event.planningPreferences.decoration],
        ["Entertainment", event.planningPreferences.entertainment],
        ["Priority", event.planningPreferences.priority],
      ];

      preferences.forEach(([label, value]) => {
        if (value) {
          addLabelValue(label, value);
        }
      });

      if (event.planningPreferences.specialRequirements) {
        doc.moveDown(0.4);

        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor(COLORS.text)
          .text("Special Requirements");

        doc.moveDown(0.2);

        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(COLORS.text)
          .text(event.planningPreferences.specialRequirements, {
            width: CONTENT_WIDTH,
            lineGap: 3,
          });
      }
    }

    // ========================================================
    // 2. AI EVENT PLAN
    // ========================================================

    doc.addPage();

    addSectionHeader(
      "2",
      "AI Event Plan",
      "Personalized planning recommendations generated by EventWise AI.",
    );

    if (!eventPlan) {
      roundedBox(LEFT, doc.y, CONTENT_WIDTH, 80, COLORS.warningLight, null, 10);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.warning)
        .text("AI plan not available", LEFT + 16, doc.y + 16);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(
          "Generate an AI event plan from the EventWise event page to include personalized planning information in the dossier.",
          LEFT + 16,
          doc.y + 38,
          {
            width: CONTENT_WIDTH - 32,
          },
        );
    } else {
      // Plan title
      roundedBox(LEFT, doc.y, CONTENT_WIDTH, 70, COLORS.primaryLight, null, 10);

      const planY = doc.y;

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.primary)
        .text("AI PLAN", LEFT + 16, planY + 12);

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(COLORS.dark)
        .text(safeText(eventPlan.title), LEFT + 16, planY + 29, {
          width: CONTENT_WIDTH - 32,
        });

      doc.y = planY + 88;

      // Summary
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(COLORS.dark)
        .text("Plan Summary");

      doc.moveDown(0.3);

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(COLORS.text)
        .text(safeText(eventPlan.summary, "No summary available."), {
          width: CONTENT_WIDTH,
          lineGap: 3,
        });

      doc.moveDown(1);

      // Objectives
      if (
        Array.isArray(eventPlan.objectives) &&
        eventPlan.objectives.length > 0
      ) {
        addSectionHeader("", "Objectives");

        eventPlan.objectives.forEach((objective) => {
          addBullet(objective);
        });
      }

      // Recommendations
      if (
        Array.isArray(eventPlan.recommendations) &&
        eventPlan.recommendations.length > 0
      ) {
        addSectionHeader("", "AI Recommendations");

        eventPlan.recommendations.forEach((recommendation) => {
          checkPageSpace(95);

          const category = recommendation.category || "General";

          const recommendationText = recommendation.recommendation || "";

          const reason = recommendation.reason || "";

          const boxHeight = reason ? 75 : 55;

          roundedBox(
            LEFT,
            doc.y,
            CONTENT_WIDTH,
            boxHeight,
            COLORS.background,
            COLORS.border,
            8,
          );

          const recY = doc.y;

          addBadge(category, LEFT + 12, recY + 10, 95);

          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(COLORS.text)
            .text(safeText(recommendationText), LEFT + 120, recY + 10, {
              width: CONTENT_WIDTH - 135,
              lineGap: 2,
            });

          if (reason) {
            doc
              .font("Helvetica-Oblique")
              .fontSize(8)
              .fillColor(COLORS.muted)
              .text(`Why: ${reason}`, LEFT + 12, recY + 43, {
                width: CONTENT_WIDTH - 24,
              });
          }

          doc.y = recY + (reason ? 90 : 70);
        });
      }

      // Notes
      if (Array.isArray(eventPlan.notes) && eventPlan.notes.length > 0) {
        addSectionHeader("", "Planning Notes");

        eventPlan.notes.forEach((note) => {
          addBullet(note);
        });
      }
    }

    // ========================================================
    // 3. EVENT ITINERARY
    // ========================================================

    if (
      eventPlan &&
      Array.isArray(eventPlan.itinerary) &&
      eventPlan.itinerary.length > 0
    ) {
      doc.addPage();

      addSectionHeader(
        "3",
        "Event Itinerary",
        "AI-generated schedule for the event day.",
      );

      eventPlan.itinerary.forEach((item, index) => {
        checkPageSpace(105);

        const boxHeight = 82;
        const boxY = doc.y;

        roundedBox(
          LEFT,
          boxY,
          CONTENT_WIDTH,
          boxHeight,
          COLORS.white,
          COLORS.border,
          9,
        );

        // Number circle
        doc
          .circle(LEFT + 24, boxY + 25, 12)
          .fillColor(COLORS.primary)
          .fill();

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(COLORS.white)
          .text(String(index + 1), LEFT + 20, boxY + 22, {
            width: 8,
            align: "center",
          });

        // Time
        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor(COLORS.primary)
          .text(
            safeText(item.time, "Time not specified"),
            LEFT + 48,
            boxY + 13,
          );

        // Activity
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(COLORS.dark)
          .text(safeText(item.activity, "Activity"), LEFT + 48, boxY + 30, {
            width: CONTENT_WIDTH - 110,
          });

        // Description
        if (item.description) {
          doc
            .font("Helvetica")
            .fontSize(8.5)
            .fillColor(COLORS.text)
            .text(safeText(item.description), LEFT + 48, boxY + 48, {
              width: CONTENT_WIDTH - 70,
              height: 24,
              ellipsis: true,
            });
        }

        // Duration
        if (
          item.durationMinutes !== undefined &&
          item.durationMinutes !== null
        ) {
          doc
            .font("Helvetica-Bold")
            .fontSize(7.5)
            .fillColor(COLORS.muted)
            .text(`${item.durationMinutes} min`, RIGHT - 55, boxY + 14, {
              width: 40,
              align: "right",
            });
        }

        doc.y = boxY + boxHeight + 10;
      });
    }

    // ========================================================
    // 4. BUDGET OPTIMIZATION
    // ========================================================

    doc.addPage();

    addSectionHeader(
      "4",
      "Budget Optimization",
      "AI-assisted allocation of the available event budget.",
    );

    if (!eventBudget) {
      roundedBox(LEFT, doc.y, CONTENT_WIDTH, 80, COLORS.warningLight, null, 10);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.warning)
        .text("Budget optimization not available", LEFT + 16, doc.y + 16);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(
          "Generate the optimized budget from the EventWise event page to include allocation details.",
          LEFT + 16,
          doc.y + 38,
          {
            width: CONTENT_WIDTH - 32,
          },
        );
    } else {
      const totalBudget = Number(eventBudget.totalBudget || event.budget || 0);

      const totalAllocated = Number(eventBudget.totalAllocated || 0);

      const remainingBudget = Number(
        eventBudget.remainingBudget ?? totalBudget - totalAllocated,
      );

      // Budget cards
      const budgetCardGap = 10;

      const budgetCardWidth = (CONTENT_WIDTH - budgetCardGap * 2) / 3;

      const budgetY = doc.y;

      const drawBudgetCard = (x, label, value, valueColor) => {
        roundedBox(
          x,
          budgetY,
          budgetCardWidth,
          75,
          COLORS.white,
          COLORS.border,
          9,
        );

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(COLORS.muted)
          .text(label.toUpperCase(), x + 12, budgetY + 12);

        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .fillColor(valueColor)
          .text(value, x + 12, budgetY + 34, {
            width: budgetCardWidth - 24,
          });
      };

      drawBudgetCard(
        LEFT,
        "Total Budget",
        formatCurrency(totalBudget, eventBudget.currency || event.currency),
        COLORS.primary,
      );

      drawBudgetCard(
        LEFT + budgetCardWidth + budgetCardGap,
        "Allocated",
        formatCurrency(totalAllocated, eventBudget.currency || event.currency),
        COLORS.success,
      );

      drawBudgetCard(
        LEFT + (budgetCardWidth + budgetCardGap) * 2,
        "Remaining",
        formatCurrency(remainingBudget, eventBudget.currency || event.currency),
        remainingBudget >= 0 ? COLORS.success : COLORS.danger,
      );

      doc.y = budgetY + 100;

      // Strategy
      roundedBox(LEFT, doc.y, CONTENT_WIDTH, 60, COLORS.successLight, null, 9);

      const strategyY = doc.y;

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.success)
        .text("OPTIMIZATION STRATEGY", LEFT + 15, strategyY + 12);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(COLORS.dark)
        .text(
          safeText(eventBudget.optimizationStrategy, "Balanced allocation"),
          LEFT + 15,
          strategyY + 29,
          {
            width: CONTENT_WIDTH - 30,
          },
        );

      doc.y = strategyY + 80;

      // Category allocation
      if (
        Array.isArray(eventBudget.categories) &&
        eventBudget.categories.length > 0
      ) {
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .fillColor(COLORS.dark)
          .text("Category Allocation");

        doc.moveDown(0.5);

        eventBudget.categories.forEach((category) => {
          checkPageSpace(70);

          const name = category.name || category.category || "Category";

          const amount = getBudgetCategoryAmount(category);

          const percentage = getBudgetCategoryPercentage(category, totalBudget);

          const rowY = doc.y;

          doc
            .font("Helvetica-Bold")
            .fontSize(9.5)
            .fillColor(COLORS.dark)
            .text(safeText(name), LEFT, rowY);

          doc
            .font("Helvetica-Bold")
            .fontSize(9.5)
            .fillColor(COLORS.text)
            .text(
              formatCurrency(amount, eventBudget.currency || event.currency),
              RIGHT - 90,
              rowY,
              {
                width: 90,
                align: "right",
              },
            );

          doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor(COLORS.muted)
            .text(`${percentage.toFixed(1)}%`, RIGHT - 90, rowY + 15, {
              width: 90,
              align: "right",
            });

          const barY = rowY + 31;

          // Background
          doc
            .roundedRect(LEFT, barY, CONTENT_WIDTH, 7, 3)
            .fillColor("#E5E7EB")
            .fill();

          // Progress
          const progressWidth = Math.max(
            3,
            (CONTENT_WIDTH * Math.min(Math.max(percentage, 0), 100)) / 100,
          );

          doc
            .roundedRect(LEFT, barY, progressWidth, 7, 3)
            .fillColor(COLORS.primary)
            .fill();

          doc.y = barY + 22;
        });
      }
    }

    // ========================================================
    // 5. TIMELINE & CHECKLIST
    // ========================================================

    doc.addPage();

    addSectionHeader(
      "5",
      "Timeline & Checklist",
      "Tasks and preparation activities required for the event.",
    );

    if (!tasks.length) {
      roundedBox(LEFT, doc.y, CONTENT_WIDTH, 80, COLORS.warningLight, null, 10);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.warning)
        .text("No tasks available", LEFT + 16, doc.y + 16);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(
          "Generate the event timeline to add preparation tasks to this dossier.",
          LEFT + 16,
          doc.y + 38,
          {
            width: CONTENT_WIDTH - 32,
          },
        );
    } else {
      tasks.forEach((task, index) => {
        checkPageSpace(95);

        const taskY = doc.y;

        roundedBox(
          LEFT,
          taskY,
          CONTENT_WIDTH,
          70,
          COLORS.white,
          COLORS.border,
          9,
        );

        // Checkbox
        doc
          .rect(LEFT + 14, taskY + 15, 14, 14)
          .lineWidth(1)
          .strokeColor(COLORS.primary)
          .stroke();

        if (String(task.status || "").toLowerCase() === "completed") {
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(COLORS.success)
            .text("✓", LEFT + 16, taskY + 16);
        }

        // Task title
        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor(COLORS.dark)
          .text(
            `${index + 1}. ${safeText(task.title)}`,
            LEFT + 40,
            taskY + 13,
            {
              width: CONTENT_WIDTH - 150,
            },
          );

        // Status badge
        addBadge(safeText(task.status, "Pending"), RIGHT - 95, taskY + 10, 80);

        // Due date
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(COLORS.muted)
          .text(`Due: ${formatDate(task.dueDate)}`, LEFT + 40, taskY + 34);

        if (task.priority) {
          doc.text(`Priority: ${task.priority}`, LEFT + 160, taskY + 34);
        }

        if (task.category) {
          doc.text(`Category: ${task.category}`, LEFT + 275, taskY + 34);
        }

        if (task.description) {
          doc
            .font("Helvetica")
            .fontSize(7.8)
            .fillColor(COLORS.muted)
            .text(safeText(task.description), LEFT + 40, taskY + 49, {
              width: CONTENT_WIDTH - 55,
              height: 15,
              ellipsis: true,
            });
        }

        doc.y = taskY + 82;
      });
    }

    // ========================================================
    // 6. RECOMMENDED VENDORS
    // ========================================================

    doc.addPage();

    addSectionHeader(
      "6",
      "Recommended Vendors",
      "Vendors matched against your event requirements.",
    );

    if (!vendors.length) {
      roundedBox(LEFT, doc.y, CONTENT_WIDTH, 80, COLORS.background, null, 10);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.text)
        .text("No matching vendors found", LEFT + 16, doc.y + 16);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text(
          "Try adjusting your event location, budget, guest count, or preferences.",
          LEFT + 16,
          doc.y + 38,
          {
            width: CONTENT_WIDTH - 32,
          },
        );
    } else {
      vendors.forEach((vendor, index) => {
        checkPageSpace(150);

        const vendorY = doc.y;

        roundedBox(
          LEFT,
          vendorY,
          CONTENT_WIDTH,
          125,
          COLORS.white,
          COLORS.border,
          10,
        );

        // Vendor name
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .fillColor(COLORS.dark)
          .text(
            `${index + 1}. ${safeText(vendor.name)}`,
            LEFT + 15,
            vendorY + 14,
            {
              width: CONTENT_WIDTH - 120,
            },
          );

        // Match percentage
        const matchPercentage = Number(vendor.matchPercentage || 0);

        roundedBox(
          RIGHT - 90,
          vendorY + 12,
          75,
          28,
          COLORS.primaryLight,
          null,
          14,
        );

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(COLORS.primaryDark)
          .text(`${matchPercentage}%`, RIGHT - 90, vendorY + 20, {
            width: 75,
            align: "center",
          });

        // Category
        addBadge(
          safeText(vendor.category, "Vendor"),
          LEFT + 15,
          vendorY + 42,
          100,
        );

        let vendorDetailY = vendorY + 73;

        // Location
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor(COLORS.text)
          .text(
            `Location: ${
              vendor.area
                ? `${vendor.area}, ${vendor.city || ""}`
                : safeText(vendor.city)
            }`,
            LEFT + 15,
            vendorDetailY,
            {
              width: 235,
            },
          );

        // Rating
        doc.text(
          `Rating: ${Number(vendor.rating || 0).toFixed(1)} / 5`,
          LEFT + 265,
          vendorDetailY,
        );

        vendorDetailY += 15;

        // Capacity
        doc.text(
          `Capacity: ${vendor.minGuests || 0} - ${
            vendor.maxGuests || "Any"
          } guests`,
          LEFT + 15,
          vendorDetailY,
          {
            width: 235,
          },
        );

        // Reviews
        doc.text(
          `Reviews: ${vendor.reviewCount || 0}`,
          LEFT + 265,
          vendorDetailY,
        );

        vendorDetailY += 15;

        // Budget
        if (vendor.minBudget !== undefined || vendor.maxBudget !== undefined) {
          doc.text(
            `Budget: ${formatCurrency(
              vendor.minBudget,
              vendor.currency,
            )} - ${formatCurrency(vendor.maxBudget, vendor.currency)}`,
            LEFT + 15,
            vendorDetailY,
            {
              width: CONTENT_WIDTH - 30,
            },
          );
        }

        doc.y = vendorY + 140;
      });
    }

    // ========================================================
    // 7. EVENTWISE SUMMARY
    // ========================================================

    doc.addPage();

    addSectionHeader(
      "7",
      "EventWise Summary",
      "A final overview of your event planning information.",
    );

    roundedBox(LEFT, doc.y, CONTENT_WIDTH, 170, COLORS.primaryLight, null, 12);

    const summaryY = doc.y;

    doc
      .font("Helvetica-Bold")
      .fontSize(15)
      .fillColor(COLORS.primaryDark)
      .text("Your Event at a Glance", LEFT + 20, summaryY + 20);

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(COLORS.text)
      .text(
        "This dossier combines your event information, AI-generated planning guidance, budget optimization, preparation checklist, and vendor recommendations.",
        LEFT + 20,
        summaryY + 50,
        {
          width: CONTENT_WIDTH - 40,
          lineGap: 3,
        },
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(COLORS.dark)
      .text(`Event: ${safeText(event.title)}`, LEFT + 20, summaryY + 100);

    doc.text(`Type: ${safeText(event.eventType)}`, LEFT + 20, summaryY + 118);

    doc.text(`Date: ${formatDate(event.eventDate)}`, LEFT + 20, summaryY + 136);

    doc.text(
      `Location: ${safeText(event.location)}`,
      LEFT + 270,
      summaryY + 100,
    );

    doc.text(`Guests: ${event.guestCount || 0}`, LEFT + 270, summaryY + 118);

    doc.text(
      `Budget: ${formatCurrency(event.budget, event.currency)}`,
      LEFT + 270,
      summaryY + 136,
    );

    doc.y = summaryY + 205;

    // Closing message
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(COLORS.dark)
      .text("Plan smarter. Stay organized. Celebrate better.", {
        width: CONTENT_WIDTH,
        align: "center",
      });

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text("Thank you for using EventWise.", {
        width: CONTENT_WIDTH,
        align: "center",
      });

    // ========================================================
    // HEADER + FOOTER
    // ========================================================

    const range = doc.bufferedPageRange();

    for (let page = range.start; page < range.start + range.count; page++) {
      doc.switchToPage(page);

      // ------------------------------------------------------
      // Header
      // ------------------------------------------------------

      // Don't show header on cover
      if (page !== range.start) {
        doc
          .moveTo(LEFT, 30)
          .lineTo(RIGHT, 30)
          .lineWidth(0.5)
          .strokeColor(COLORS.border)
          .stroke();

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(COLORS.primary)
          .text("EventWise", LEFT, 17);

        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor(COLORS.muted)
          .text("EVENT PLANNING DOSSIER", RIGHT - 130, 18, {
            width: 130,
            align: "right",
          });
      }

      // ------------------------------------------------------
      // Footer line
      // ------------------------------------------------------

      doc
        .moveTo(LEFT, FOOTER_Y - 5)
        .lineTo(RIGHT, FOOTER_Y - 5)
        .lineWidth(0.5)
        .strokeColor(COLORS.border)
        .stroke();

      // ------------------------------------------------------
      // Footer left
      // ------------------------------------------------------

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(COLORS.lightText)
        .text(`EventWise • ${safeText(event.title)}`, LEFT, FOOTER_Y + 3, {
          width: 300,
        });

      // ------------------------------------------------------
      // Footer right
      // ------------------------------------------------------

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(COLORS.lightText)
        .text(`Page ${page + 1} of ${range.count}`, RIGHT - 100, FOOTER_Y + 3, {
          width: 100,
          align: "right",
        });
    }

    // ========================================================
    // FINALIZE PDF
    // ========================================================

    doc.end();
  } catch (error) {
    console.error("=============================================");

    console.error("[DOSSIER PDF ERROR]");

    console.error("Message:", error.message);

    console.error("Name:", error.name);

    console.error("Full Error:", error);

    console.error("=============================================");

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate event dossier.",
      });
    }

    res.end();
  }
};

// ============================================================
// SANITIZE FILE NAME
// ============================================================

const sanitizeFilename = (name) => {
  return String(name || "EventWise")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 100);
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  generateEventDossier,
};
