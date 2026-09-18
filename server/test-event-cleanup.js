const assert = require("assert");

const { deleteEvent } = require("./controllers/eventController");
const { deleteAdminEvent, deleteUser } = require("./controllers/adminController");
const Event = require("./models/Event");
const User = require("./models/User");
const EventPlan = require("./models/EventPlan");
const EventBudget = require("./models/EventBudget");
const EventTask = require("./models/EventTask");

const eventId = "507f1f77bcf86cd799439011";
const userId = "507f191e810c19729de860ea";

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

const run = async () => {
  const original = {
    findOne: Event.findOne,
    find: Event.find,
    findById: Event.findById,
    deleteOne: Event.deleteOne,
    deleteMany: Event.deleteMany,
    userFindById: User.findById,
    userDeleteOne: User.deleteOne,
    planDeleteMany: EventPlan.deleteMany,
    budgetDeleteMany: EventBudget.deleteMany,
    taskDeleteMany: EventTask.deleteMany,
  };

  try {
    const ownerDeletes = [];
    const ownerEvent = {
      _id: eventId,
      deleteOne: async () => ownerDeletes.push(["event", { _id: eventId }]),
    };
    Event.findOne = async () => ownerEvent;
    EventPlan.deleteMany = async (filter) => ownerDeletes.push(["plan", filter]);
    EventBudget.deleteMany = async (filter) => ownerDeletes.push(["budget", filter]);
    EventTask.deleteMany = async (filter) => ownerDeletes.push(["task", filter]);

    const ownerResponse = createResponse();
    await deleteEvent(
      { params: { id: eventId }, user: { _id: userId } },
      ownerResponse,
      (error) => {
        throw error;
      },
    );

    assert.equal(ownerResponse.statusCode, 200);
    assert.deepEqual(ownerDeletes.map(([type]) => type), ["plan", "budget", "task", "event"]);

    const adminDeletes = [];
    Event.findById = async () => ({ _id: eventId });
    EventPlan.deleteMany = async (filter) => adminDeletes.push(["plan", filter]);
    EventBudget.deleteMany = async (filter) => adminDeletes.push(["budget", filter]);
    EventTask.deleteMany = async (filter) => adminDeletes.push(["task", filter]);
    Event.deleteOne = async () => adminDeletes.push(["event", { _id: eventId }]);

    const adminResponse = createResponse();
    await deleteAdminEvent(
      { params: { eventId } },
      adminResponse,
      (error) => {
        throw error;
      },
    );

    assert.equal(adminResponse.statusCode, 200);
    assert.deepEqual(adminDeletes.map(([type]) => type), ["task", "plan", "budget", "event"]);

    const userDeletes = [];
    User.findById = async () => ({ _id: userId, role: "user" });
    User.deleteOne = async () => userDeletes.push(["user", { _id: userId }]);
    Event.find = () => ({ select: async () => [{ _id: eventId }] });
    Event.deleteMany = async (filter) => userDeletes.push(["event", filter]);
    EventPlan.deleteMany = async (filter) => userDeletes.push(["plan", filter]);
    EventBudget.deleteMany = async (filter) => userDeletes.push(["budget", filter]);
    EventTask.deleteMany = async (filter) => userDeletes.push(["task", filter]);

    const userResponse = createResponse();
    await deleteUser(
      { params: { userId }, user: { _id: "507f1f77bcf86cd799439099" } },
      userResponse,
      (error) => {
        throw error;
      },
    );

    assert.equal(userResponse.statusCode, 200);
    assert.deepEqual(userDeletes.map(([type]) => type), ["task", "plan", "budget", "event", "user"]);
    console.log("Event cleanup checks passed.");
  } finally {
    Event.findOne = original.findOne;
    Event.find = original.find;
    Event.findById = original.findById;
    Event.deleteOne = original.deleteOne;
    Event.deleteMany = original.deleteMany;
    User.findById = original.userFindById;
    User.deleteOne = original.userDeleteOne;
    EventPlan.deleteMany = original.planDeleteMany;
    EventBudget.deleteMany = original.budgetDeleteMany;
    EventTask.deleteMany = original.taskDeleteMany;
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
