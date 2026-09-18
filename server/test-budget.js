const assert = require("assert");

const { generateBudget, updateBudget } = require("./controllers/budgetController");
const Event = require("./models/Event");
const EventBudget = require("./models/EventBudget");

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const categoryNames = [
  "Venue",
  "Food",
  "Decoration",
  "Entertainment",
  "Photography",
  "Transportation",
  "Miscellaneous",
];

const createCategories = () =>
  categoryNames.map((category) => ({
    category,
    allocatedAmount: 0,
    percentage: 0,
    description: "",
  }));

const run = async () => {
  let response = createResponse();
  await generateBudget({ params: { eventId: "invalid" } }, response);
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, "Invalid event ID.");

  const validStrategies = [
    "Budget",
    "Budget Focused",
    "Guest Experience",
    "Food",
    "Food Priority",
    "Decoration",
    "Decoration Priority",
    "Entertainment",
    "Entertainment Priority",
    "Balanced",
  ];

  validStrategies.forEach((optimizationStrategy) => {
    const budget = new EventBudget({
      event: "507f1f77bcf86cd799439011",
      user: "507f191e810c19729de860ea",
      totalBudget: 1000,
      optimizationStrategy,
    });
    assert.equal(budget.validateSync(), undefined, optimizationStrategy);
  });

  const originalFindOne = Event.findOne;
  const originalBudgetFindOne = EventBudget.findOne;
  const budgetDocument = {
    categories: createCategories(),
    save: async function save() {
      return this;
    },
  };

  Event.findOne = async () => ({
    _id: "507f1f77bcf86cd799439011",
    budget: 1000,
    currency: "INR",
  });
  EventBudget.findOne = async () => budgetDocument;

  response = createResponse();
  await updateBudget(
    {
      params: { eventId: "507f1f77bcf86cd799439011" },
      user: { _id: "507f191e810c19729de860ea" },
      body: {
        categories: createCategories().map((item) =>
          item.category === "Venue" ? { ...item, allocatedAmount: null } : item,
        ),
      },
    },
    response,
  );
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /Invalid allocated amount for Venue/);

  response = createResponse();
  await updateBudget(
    {
      params: { eventId: "507f1f77bcf86cd799439011" },
      user: { _id: "507f191e810c19729de860ea" },
      body: { categories: [null] },
    },
    response,
  );
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, "Every budget category must be a valid object.");

  response = createResponse();
  await updateBudget(
    {
      params: { eventId: "507f1f77bcf86cd799439011" },
      user: { _id: "507f191e810c19729de860ea" },
      body: {
        categories: createCategories().map((item) =>
          item.category === "Venue" ? { ...item, allocatedAmount: 1000 } : item,
        ),
      },
    },
    response,
  );
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.budget.totalAllocated, 1000);
  assert.equal(response.body.budget.remainingBudget, 0);

  Event.findOne = originalFindOne;
  EventBudget.findOne = originalBudgetFindOne;
  console.log("Budget controller/model checks passed.");
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
