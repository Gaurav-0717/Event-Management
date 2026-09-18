require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { connectDB } = require("./config/db");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Root Route
app.get("/", (req, res) => {
  res.json({
    name: "EventWise API",
    description: "AI-Powered Event Planning & Budget Optimization System API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
    },
  });
});

// Mount API Routes
app.use("/api", routes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log("=============================================");
  console.log(` EventWise Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Environment:  ${process.env.NODE_ENV || "development"}`);
  console.log(
    " Gemini API Key:",
    process.env.GEMINI_API_KEY ? "LOADED" : "MISSING",
  );
  console.log(
    ` Gemini Model: ${process.env.GEMINI_MODEL || "gemini-3.8-flash"}`,
  );
  console.log("=============================================");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = app;
