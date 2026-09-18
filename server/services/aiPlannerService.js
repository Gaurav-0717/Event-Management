const { GoogleGenAI } = require("@google/genai");

// ============================================================
// GEMINI CONFIGURATION
// ============================================================

const apiKey = process.env.GEMINI_API_KEY;

const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const fallbackModelName =
  process.env.GEMINI_FALLBACK_MODEL || "gemini-3.8-flash";

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!apiKey) {
  console.warn(
    "[AI Planner] GEMINI_API_KEY is not configured. AI generation will fail until it is added.",
  );
}

// ============================================================
// RETRY CONFIGURATION
// ============================================================

// Keep retries limited so we can move to the fallback model quickly.
const MAX_RETRIES_PER_MODEL = 2;

// Each model attempt must leave enough time for the configured retry and
// fallback sequence to finish within the frontend's 120 second AI timeout.
const AI_REQUEST_TIMEOUT_MS = 25000;

// Delay before retrying the same model.
const RETRY_DELAYS = [2500, 5000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// ERROR HELPERS
// ============================================================

const getErrorStatus = (error) => {
  return (
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    error?.code ||
    null
  );
};

const getErrorMessage = (error) => {
  return String(
    error?.message ||
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "",
  ).toLowerCase();
};

const isRetryableAIError = (error) => {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  // Temporary HTTP/API failures.
  if (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }

  // Common Gemini temporary failure messages.
  return (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit") ||
    message.includes("temporarily") ||
    message.includes("timeout") ||
    message.includes("aborted") ||
    message.includes("overloaded") ||
    message.includes("try again later")
  );
};

const isRequestTimeoutError = (error) =>
  error?.name === "AbortError" || getErrorMessage(error).includes("aborted");

// ============================================================
// NORMALIZE GEMINI ERROR
// ============================================================

const createAIError = (error, fallbackMessage) => {
  if (isRequestTimeoutError(error)) {
    const timeoutError = new Error(
      "AI request timed out. Please try generating the plan again.",
    );
    timeoutError.statusCode = 504;
    return timeoutError;
  }

  const status = getErrorStatus(error);

  const message =
    error?.message || error?.response?.data?.message || fallbackMessage;

  const normalizedError = new Error(message);

  normalizedError.statusCode =
    typeof status === "number" ? status : status ? Number(status) || 503 : 503;

  normalizedError.originalError = error;

  return normalizedError;
};

// ============================================================
// GEMINI GENERATION WITH RETRY + FALLBACK
// ============================================================

const generateWithRetry = async ({ prompt, schema, operationName }) => {
  if (!ai) {
    const error = new Error(
      "AI service is not configured. Add GEMINI_API_KEY to server/.env.",
    );

    error.statusCode = 503;

    throw error;
  }

  // Build unique model list.
  const modelsToTry = [modelName, fallbackModelName].filter(
    (model, index, array) => model && array.indexOf(model) === index,
  );

  let lastError = null;

  // ==========================================================
  // TRY EACH MODEL
  // ==========================================================

  for (let modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
    const currentModel = modelsToTry[modelIndex];

    console.log(
      `[${operationName}] Trying model ${modelIndex + 1}/${modelsToTry.length}: ${currentModel}`,
    );

    // ========================================================
    // RETRY SAME MODEL
    // ========================================================

    for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        console.log(
          `[${operationName}] Attempt ${attempt}/${MAX_RETRIES_PER_MODEL} using ${currentModel}`,
        );

        const response = await ai.models.generateContent({
          model: currentModel,

          contents: prompt,

          config: {
            abortSignal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS),
            maxOutputTokens: 4000,

            thinkingConfig: {
              thinkingLevel: "low",
            },

            responseMimeType: "application/json",

            responseSchema: schema,
          },
        });

        // ====================================================
        // VALIDATE RESPONSE
        // ====================================================

        if (!response?.text) {
          const emptyError = new Error(
            "AI service returned an empty response.",
          );

          emptyError.statusCode = 502;

          throw emptyError;
        }

        console.log(`[${operationName}] Success using ${currentModel}`);

        return {
          response,
          model: currentModel,
        };
      } catch (error) {
        lastError = error;

        const status = getErrorStatus(error);
        const message = error?.message || "Unknown AI error";

        console.error(
          `[${operationName}] ${currentModel} attempt ${attempt} failed`,
        );

        console.error(`[${operationName}] Status:`, status || "unknown");

        console.error(`[${operationName}] Message:`, message);

        const retryable = isRetryableAIError(error);

        // ----------------------------------------------------
        // Permanent error
        // ----------------------------------------------------

        if (!retryable) {
          console.error(
            `[${operationName}] Non-retryable error. Stopping model attempts.`,
          );

          throw createAIError(
            error,
            "AI service failed to generate a response.",
          );
        }

        // ----------------------------------------------------
        // Retry same model
        // ----------------------------------------------------

        if (attempt < MAX_RETRIES_PER_MODEL) {
          const delay = RETRY_DELAYS[attempt - 1] || 5000;

          console.log(
            `[${operationName}] Temporary AI error. Retrying ${currentModel} in ${delay}ms...`,
          );

          await sleep(delay);
        }
      }
    }

    // ========================================================
    // SWITCH TO FALLBACK
    // ========================================================

    if (modelIndex < modelsToTry.length - 1) {
      const nextModel = modelsToTry[modelIndex + 1];

      console.warn(`[${operationName}] ${currentModel} remains unavailable.`);

      console.warn(
        `[${operationName}] Switching to fallback model: ${nextModel}`,
      );
    }
  }

  // ==========================================================
  // ALL MODELS FAILED
  // ==========================================================

  console.error(`[${operationName}] All configured Gemini models failed.`);

  const finalError = createAIError(
    lastError,
    "AI service is temporarily unavailable. Please try again later.",
  );

  // Preserve a useful HTTP status.
  if (!finalError.statusCode) {
    finalError.statusCode = 503;
  }

  throw finalError;
};

// ============================================================
// EVENT PLAN SCHEMA
// ============================================================

const eventPlanSchema = {
  type: "object",

  properties: {
    title: {
      type: "string",
      description: "A concise title for the generated event plan.",
    },

    summary: {
      type: "string",
      description: "A practical summary of how the event should be planned.",
    },

    objectives: {
      type: "array",

      items: {
        type: "string",
      },

      description: "Three to six important planning objectives.",
    },

    itinerary: {
      type: "array",

      items: {
        type: "object",

        properties: {
          time: {
            type: "string",
            description: "Time or time range such as 09:00 or 09:00-09:30.",
          },

          activity: {
            type: "string",
            description: "Name of the activity.",
          },

          description: {
            type: "string",
            description: "Practical description of the activity.",
          },

          durationMinutes: {
            type: "integer",
            description: "Approximate duration in minutes.",
          },
        },

        required: ["time", "activity", "description", "durationMinutes"],
      },

      description:
        "A realistic chronological itinerary that fits the event time.",
    },

    recommendations: {
      type: "array",

      items: {
        type: "object",

        properties: {
          category: {
            type: "string",
          },

          recommendation: {
            type: "string",
          },

          reason: {
            type: "string",
          },
        },

        required: ["category", "recommendation", "reason"],
      },

      description: "Practical recommendations based on event preferences.",
    },

    notes: {
      type: "array",

      items: {
        type: "string",
      },

      description: "Important planning notes and reminders.",
    },
  },

  required: [
    "title",
    "summary",
    "objectives",
    "itinerary",
    "recommendations",
    "notes",
  ],
};

// ============================================================
// AI TASK SCHEMA
// ============================================================

const aiTaskSchema = {
  type: "object",

  properties: {
    tasks: {
      type: "array",

      items: {
        type: "object",

        properties: {
          title: {
            type: "string",
            description: "Short actionable task title.",
          },

          description: {
            type: "string",
            description:
              "Practical instructions explaining what needs to be done.",
          },

          dueDate: {
            type: "string",
            description: "Task deadline in YYYY-MM-DD format.",
          },

          priority: {
            type: "string",

            enum: ["Low", "Medium", "High", "Critical"],

            description: "Importance of the task.",
          },

          category: {
            type: "string",

            enum: [
              "Venue",
              "Food",
              "Decoration",
              "Entertainment",
              "Photography",
              "Guests",
              "Transportation",
              "Budget",
              "Other",
            ],

            description: "Event planning category.",
          },
        },

        required: ["title", "description", "dueDate", "priority", "category"],
      },

      description: "Actionable event preparation tasks.",
    },
  },

  required: ["tasks"],
};

// ============================================================
// EVENT PLAN PROMPT
// ============================================================

const buildPrompt = (event) => {
  const preferences = event.planningPreferences || {};

  const eventDate = new Date(event.eventDate).toISOString().split("T")[0];

  return `
You are EventWise AI Planner, an expert event planning assistant.

Create a practical and realistic event plan based ONLY on the event information supplied below.

============================================================
EVENT INFORMATION
============================================================

Event Name:
${event.title}

Event Type:
${event.eventType}

Description:
${event.description || "Not provided"}

Event Date:
${eventDate}

Start Time:
${event.startTime}

End Time:
${event.endTime}

Location:
${event.location}

Expected Guests:
${event.guestCount}

Budget:
${event.currency} ${event.budget}

============================================================
PLANNING PREFERENCES
============================================================

Style:
${preferences.style || "No Preference"}

Food:
${preferences.food || "No Preference"}

Decoration:
${preferences.decoration || "No Preference"}

Entertainment:
${preferences.entertainment || "No Preference"}

Main Priority:
${preferences.priority || "Balanced"}

Special Requirements:
${preferences.specialRequirements || "None"}

============================================================
INSTRUCTIONS
============================================================

1. Create a realistic event plan.

2. Create a chronological itinerary that fits between the provided start and end times.

3. Consider guest count, event type, location, style, food, decoration, entertainment, and priority.

4. Respect the special requirements.

5. Do not invent specific vendors, prices, phone numbers, addresses, or bookings.

6. Do not claim that anything has already been booked or confirmed.

7. Keep recommendations practical.

8. Do not provide a detailed budget allocation yet.
   Budget optimization will be handled separately by EventWise.

9. Return ONLY the requested structured JSON response.
`;
};

// ============================================================
// AI TASK PROMPT
// ============================================================

const buildTaskPrompt = (event) => {
  const preferences = event.planningPreferences || {};

  const eventDate = new Date(event.eventDate).toISOString().split("T")[0];

  return `
You are EventWise AI Task Planner.

Generate practical, realistic, and time-aware event preparation tasks.

The most important requirement is that every task due date must be calculated relative to the EVENT DATE provided below.

============================================================
EVENT INFORMATION
============================================================

Event Name:
${event.title}

Event Type:
${event.eventType}

Description:
${event.description || "Not provided"}

EVENT DATE:
${eventDate}

Start Time:
${event.startTime}

End Time:
${event.endTime}

Location:
${event.location}

Expected Guests:
${event.guestCount}

Budget:
${event.currency} ${event.budget}

============================================================
PLANNING PREFERENCES
============================================================

Style:
${preferences.style || "No Preference"}

Food:
${preferences.food || "No Preference"}

Decoration:
${preferences.decoration || "No Preference"}

Entertainment:
${preferences.entertainment || "No Preference"}

Main Priority:
${preferences.priority || "Balanced"}

Special Requirements:
${preferences.specialRequirements || "None"}

============================================================
TASK GENERATION RULES
============================================================

1. Generate 8 to 15 useful event preparation tasks.

2. Every task must be actionable.

3. Generate tasks across different relevant categories.

4. Avoid duplicate or nearly identical tasks.

5. Calculate task due dates backward from the EVENT DATE.

6. Do NOT randomly choose dates.

7. Do NOT use dates unrelated to the supplied EVENT DATE.

8. Every dueDate MUST be calculated from the EVENT DATE.

9. Every dueDate must use exactly:

YYYY-MM-DD

10. No task may have a dueDate after:

${eventDate}

11. Prefer earlier deadlines for important tasks.

12. Critical tasks should normally be completed before the final week.

13. If the event date is close, compress the schedule logically.

14. Keep the tasks in a logical planning order.

15. Keep task descriptions short but useful.

16. Use only these priority values:

Low
Medium
High
Critical

17. Use only these categories:

Venue
Food
Decoration
Entertainment
Photography
Guests
Transportation
Budget
Other

18. Consider event type, guest count, location, budget,
planning preferences, and special requirements.

19. Do not invent specific vendors, phone numbers,
bookings, addresses, fake prices, or confirmations.

20. Do not claim that a task has already been completed.

21. Return ONLY the requested structured JSON response.

============================================================
FINAL DATE REQUIREMENT
============================================================

The EVENT DATE is:

${eventDate}

All generated task due dates must be on or before this date.

Calculate the dates carefully before returning the JSON.
`;
};

// ============================================================
// GENERATE EVENT PLAN
// ============================================================

const generateEventPlan = async (event) => {
  const prompt = buildPrompt(event);

  const result = await generateWithRetry({
    prompt,
    schema: eventPlanSchema,
    operationName: "AI Plan",
  });

  const response = result.response;

  let plan;

  try {
    plan = JSON.parse(response.text);
  } catch (error) {
    console.error("[AI Planner] Invalid JSON returned by model:", error);

    const parseError = new Error("AI service returned an invalid plan format.");

    parseError.statusCode = 502;

    throw parseError;
  }

  return {
    ...plan,
    model: result.model,
  };
};

// ============================================================
// GENERATE AI TASKS
// ============================================================

const generateAITasks = async (event) => {
  const prompt = buildTaskPrompt(event);

  const result = await generateWithRetry({
    prompt,
    schema: aiTaskSchema,
    operationName: "AI Tasks",
  });

  const response = result.response;

  let taskResult;

  try {
    taskResult = JSON.parse(response.text);
  } catch (error) {
    console.error("[AI Tasks] Invalid JSON returned by model:", error);

    const parseError = new Error("AI service returned an invalid task format.");

    parseError.statusCode = 502;

    throw parseError;
  }

  if (!taskResult || !Array.isArray(taskResult.tasks)) {
    const error = new Error("AI service returned an invalid task list.");

    error.statusCode = 502;

    throw error;
  }

  return {
    tasks: taskResult.tasks,
    model: result.model,
  };
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  generateEventPlan,
  generateAITasks,
};
