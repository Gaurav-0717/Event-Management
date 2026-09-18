const assert = require("assert");

const sdkPath = require.resolve("@google/genai");
const servicePath = require.resolve("./services/aiPlannerService");
const originalSdk = require.cache[sdkPath];
const originalApiKey = process.env.GEMINI_API_KEY;
let receivedConfig;
let generateContent;

const validPlan = () => ({
  text: JSON.stringify({
    title: "Plan",
    summary: "Summary",
    objectives: [],
    itinerary: [],
    recommendations: [],
    notes: [],
  }),
});

class FakeGoogleGenAI {
  constructor() {
    this.models = {
      generateContent: async ({ model, config }) => {
        receivedConfig = config;
        return generateContent({ model, config });
      },
    };
  }
}

const event = {
  title: "Test event",
  eventType: "Party",
  eventDate: "2030-01-01",
  startTime: "10:00",
  endTime: "12:00",
  location: "Test city",
  guestCount: 10,
  currency: "INR",
  budget: 1000,
  planningPreferences: {},
};

const loadService = () => {
  delete require.cache[servicePath];
  return require("./services/aiPlannerService");
};

const run = async () => {
  try {
    process.env.GEMINI_API_KEY = "test-key";
    require.cache[sdkPath] = {
      id: sdkPath,
      filename: sdkPath,
      loaded: true,
      exports: { GoogleGenAI: FakeGoogleGenAI },
    };

    generateContent = async () => validPlan();
    let { generateEventPlan } = loadService();
    const plan = await generateEventPlan(event);

    assert.equal(plan.model, "gemini-3.6-flash");
    assert(receivedConfig.abortSignal instanceof AbortSignal);
    assert.equal(receivedConfig.abortSignal.aborted, false);
    assert.equal(receivedConfig.maxOutputTokens, 4000);

    let attempts = 0;
    generateContent = async () => {
      attempts += 1;
      if (attempts === 1) {
        const error = new Error("Service unavailable");
        error.status = 503;
        throw error;
      }
      return validPlan();
    };
    ({ generateEventPlan } = loadService());
    await generateEventPlan(event);
    assert.equal(attempts, 2, "a temporary 503 should be retried");

    const attemptedModels = [];
    generateContent = async ({ model }) => {
      attemptedModels.push(model);
      if (model === "gemini-3.6-flash") {
        const error = new Error("Service unavailable");
        error.status = 503;
        throw error;
      }
      return validPlan();
    };
    ({ generateEventPlan } = loadService());
    await generateEventPlan(event);
    assert.deepEqual(attemptedModels, [
      "gemini-3.6-flash",
      "gemini-3.6-flash",
      "gemini-3.8-flash",
    ]);

    generateContent = async () => {
      const error = new Error("This operation was aborted");
      error.name = "AbortError";
      throw error;
    };
    ({ generateEventPlan } = loadService());
    await assert.rejects(generateEventPlan(event), (error) => {
      assert.equal(error.statusCode, 504);
      assert.match(error.message, /timed out/i);
      return true;
    });

    console.log("AI timeout configuration checks passed.");
  } finally {
    if (originalSdk) {
      require.cache[sdkPath] = originalSdk;
    } else {
      delete require.cache[sdkPath];
    }
    delete require.cache[servicePath];
    if (originalApiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalApiKey;
    }
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
