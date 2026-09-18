const assert = require("assert");

const vendorRouter = require("./routes/vendorRoutes");
const { adminOnly } = require("./middleware/adminMiddleware");

const mutationLayers = vendorRouter.stack.filter(
  (layer) => layer.route && ["post", "put", "delete"].some((method) => layer.route.methods[method]),
);

assert.equal(mutationLayers.length, 3);
mutationLayers.forEach((layer) => {
  assert(
    layer.route.stack.some((handler) => handler.handle === adminOnly),
    `${layer.route.path} is missing admin authorization`,
  );
});

const response = {
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
};
let receivedError;
adminOnly({ user: { role: "user" } }, response, (error) => {
  receivedError = error;
});

assert.equal(response.statusCode, 403);
assert.equal(receivedError.message, "Admin access required");
console.log("Vendor authorization checks passed.");
