/**
 * EventWise Backend Services Registry
 * Business logic services for Event Planning, AI Suggestions,
 * and Budget Optimization will be implemented here in future phases.
 */

const aiAssistantService = require("./aiAssistantService");
const budgetOptimizationService =
  require("./budgetOptimizationService");

module.exports = {
  aiAssistantService,
  budgetOptimizationService,
};
