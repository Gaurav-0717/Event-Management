import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Wallet,
  TrendingUp,
  Loader2,
  RefreshCw,
  PieChart,
  AlertCircle,
  Save,
  X,
  Edit3,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { fetchEvent } from "../services/eventService";

import {
  generateBudget,
  fetchBudget,
  updateBudget,
} from "../services/budgetService";

const CHART_COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

const BudgetPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [budgetPlan, setBudgetPlan] = useState(null);

  const [editableCategories, setEditableCategories] = useState([]);
  const [editingBudget, setEditingBudget] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);
  const [budgetValidationError, setBudgetValidationError] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [generatingBudget, setGeneratingBudget] = useState(false);

  const [error, setError] = useState("");
  const [budgetError, setBudgetError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    loadEvent();
    loadBudget();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchEvent(eventId);
      setEvent(response.event);
    } catch (err) {
      console.error("Failed to load event:", err);
      setError(err.message || "Failed to load event.");
    } finally {
      setLoading(false);
    }
  };

  const loadBudget = async () => {
    try {
      setLoadingBudget(true);
      setBudgetError("");

      const response = await fetchBudget(eventId);
      setBudgetPlan(response.budget);
    } catch (err) {
      if (err.status !== 404) {
        console.error("Failed to load budget:", err);
        setBudgetError(err.message || "Failed to load optimized budget.");
      }

      setBudgetPlan(null);
    } finally {
      setLoadingBudget(false);
    }
  };

  useEffect(() => {
    if (budgetPlan?.categories) {
      setEditableCategories(
        budgetPlan.categories.map((category) => ({
          ...category,
          allocatedAmount: Number(category.allocatedAmount) || 0,
          percentage: Number(category.percentage) || 0,
        })),
      );

      setEditingBudget(false);
      setBudgetValidationError("");
    } else {
      setEditableCategories([]);
    }
  }, [budgetPlan]);

  const handleGenerateBudget = async () => {
    try {
      setGeneratingBudget(true);
      setBudgetError("");
      setBudgetValidationError("");

      const response = await generateBudget(eventId);
      setBudgetPlan(response.budget);
    } catch (err) {
      console.error("Failed to generate budget:", err);
      setBudgetError(err.message || "Failed to generate optimized budget.");
    } finally {
      setGeneratingBudget(false);
    }
  };

  const handleStartBudgetEdit = () => {
    if (!budgetPlan?.categories) return;

    setEditableCategories(
      budgetPlan.categories.map((category) => ({
        ...category,
        allocatedAmount: Number(category.allocatedAmount) || 0,
        percentage: Number(category.percentage) || 0,
      })),
    );

    setBudgetValidationError("");
    setEditingBudget(true);
  };

  const handleCancelBudgetEdit = () => {
    if (!budgetPlan?.categories) return;

    setEditableCategories(
      budgetPlan.categories.map((category) => ({
        ...category,
        allocatedAmount: Number(category.allocatedAmount) || 0,
        percentage: Number(category.percentage) || 0,
      })),
    );

    setBudgetValidationError("");
    setEditingBudget(false);
  };

  const calculateEditableTotal = () => {
    return editableCategories.reduce(
      (sum, category) => sum + (Number(category.allocatedAmount) || 0),
      0,
    );
  };

  const editableTotal = calculateEditableTotal();
  const totalBudget = Number(budgetPlan?.totalBudget) || 0;
  const editableRemaining = totalBudget - editableTotal;
  const isOverBudget = editableTotal > totalBudget;

  const editablePercentageTotal =
    totalBudget > 0 ? (editableTotal / totalBudget) * 100 : 0;

  const handleAmountChange = (index, value) => {
    const amount = value === "" ? 0 : Number(value);

    if (!Number.isFinite(amount) || amount < 0) return;

    const roundedAmount = Math.round(amount);

    setEditableCategories((current) =>
      current.map((category, categoryIndex) => {
        if (categoryIndex !== index) return category;

        const percentage =
          totalBudget > 0
            ? Math.round((roundedAmount / totalBudget) * 10000) / 100
            : 0;

        return {
          ...category,
          allocatedAmount: roundedAmount,
          percentage,
        };
      }),
    );

    setBudgetValidationError("");
  };

  const handlePercentageChange = (index, value) => {
    const percentage = value === "" ? 0 : Number(value);

    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      return;
    }

    const roundedPercentage = Math.round(percentage * 100) / 100;

    const amount =
      totalBudget > 0 ? Math.round(totalBudget * (roundedPercentage / 100)) : 0;

    setEditableCategories((current) =>
      current.map((category, categoryIndex) => {
        if (categoryIndex !== index) return category;

        return {
          ...category,
          percentage: roundedPercentage,
          allocatedAmount: amount,
        };
      }),
    );

    setBudgetValidationError("");
  };

  const formatCurrency = (amount, currency = event?.currency || "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getPercentage = (allocated, total) => {
    if (!total) return 0;
    return Math.round((allocated / total) * 100);
  };

  const validateBudget = () => {
    if (!editableCategories.length) {
      return "At least one budget category is required.";
    }

    if (totalBudget < 0) {
      return "Event budget cannot be negative.";
    }

    for (const category of editableCategories) {
      const amount = Number(category.allocatedAmount);
      const percentage = Number(category.percentage);

      if (!Number.isFinite(amount) || amount < 0) {
        return `Invalid amount for ${category.category}.`;
      }

      if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
        return `Invalid percentage for ${category.category}.`;
      }
    }

    if (editableTotal > totalBudget) {
      return `Total allocation exceeds your event budget by ${formatCurrency(
        editableTotal - totalBudget,
        budgetPlan?.currency,
      )}.`;
    }

    return "";
  };

  const handleSaveBudget = async () => {
    const validationError = validateBudget();

    if (validationError) {
      setBudgetValidationError(validationError);
      return;
    }

    try {
      setSavingBudget(true);
      setBudgetValidationError("");
      setBudgetError("");

      const categories = editableCategories.map((category) => ({
        category: category.category,
        allocatedAmount: Number(category.allocatedAmount) || 0,
        percentage: Number(category.percentage) || 0,
        description: category.description || "",
      }));

      const response = await updateBudget(eventId, categories);

      setBudgetPlan(response.budget);
      setEditingBudget(false);
      setBudgetValidationError("");
    } catch (err) {
      console.error("Failed to update budget:", err);

      setBudgetValidationError(
        err.message || "Failed to save budget allocation.",
      );
    } finally {
      setSavingBudget(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin text-emerald-600" size={36} />
          <p className="text-sm">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="group flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 mb-6"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Event
          </button>

          <div className="bg-white border border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-3 text-red-600">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Unable to load event</p>
                <p className="text-sm mt-1 text-red-500">
                  {error || "Event not found."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chartCategories =
    editingBudget && editableCategories.length
      ? editableCategories
      : budgetPlan?.categories || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors mb-6"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Event
        </button>

        {/* Header */}
        <section className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-emerald-100 rounded-full blur-3xl opacity-60" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Wallet className="text-emerald-600" size={27} />
              </div>

              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-600 mb-2">
                  <Sparkles size={14} />
                  BUDGET OPTIMIZATION
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Budget Optimization
                </h1>

                <p className="text-slate-500 mt-2">
                  {event.title} • {event.eventType}
                </p>

                <div className="inline-flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
                  <Wallet size={16} className="text-emerald-600" />
                  Total event budget:
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(event.budget, event.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {budgetPlan && !editingBudget && (
                <button
                  onClick={handleStartBudgetEdit}
                  disabled={generatingBudget || loadingBudget}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Edit3 size={18} />
                  Edit Allocation
                </button>
              )}

              <button
                onClick={handleGenerateBudget}
                disabled={
                  generatingBudget ||
                  loadingBudget ||
                  savingBudget ||
                  editingBudget
                }
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generatingBudget ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : budgetPlan ? (
                  <RefreshCw size={18} />
                ) : (
                  <TrendingUp size={18} />
                )}

                {generatingBudget
                  ? "Optimizing..."
                  : budgetPlan
                    ? "Regenerate Budget"
                    : "Optimize Budget"}
              </button>
            </div>
          </div>
        </section>

        {/* Errors */}
        {budgetError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Budget error</p>
                <p className="text-sm mt-1">{budgetError}</p>
              </div>
            </div>
          </div>
        )}

        {budgetValidationError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Budget validation failed</p>
                <p className="text-sm mt-1">{budgetValidationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loadingBudget && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader2
                className="animate-spin text-emerald-600 mb-3"
                size={28}
              />
              <p className="font-medium">Loading optimized budget...</p>
              <p className="text-sm text-slate-400 mt-1">
                Preparing your budget breakdown
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loadingBudget && !budgetPlan && !budgetError && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 sm:p-14 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
              <PieChart className="text-emerald-600" size={32} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              No optimized budget yet
            </h2>

            <p className="text-slate-500 max-w-md mx-auto mt-2">
              Let EventWise create a structured budget distribution based on
              your event requirements.
            </p>

            <button
              onClick={handleGenerateBudget}
              disabled={generatingBudget}
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {generatingBudget ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <TrendingUp size={18} />
              )}

              {generatingBudget ? "Optimizing..." : "Optimize Budget"}
            </button>
          </div>
        )}

        {/* Budget */}
        {budgetPlan && !loadingBudget && (
          <div className="space-y-6">
            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BudgetStat
                label="Total Budget"
                value={formatCurrency(
                  budgetPlan.totalBudget,
                  budgetPlan.currency,
                )}
                icon={<Wallet size={18} />}
              />

              <BudgetStat
                label={editingBudget ? "Current Allocation" : "Allocated"}
                value={formatCurrency(
                  editingBudget ? editableTotal : budgetPlan.totalAllocated,
                  budgetPlan.currency,
                )}
                positive={editingBudget ? !isOverBudget : true}
                icon={<TrendingUp size={18} />}
              />

              <BudgetStat
                label="Remaining"
                value={formatCurrency(
                  editingBudget
                    ? editableRemaining
                    : budgetPlan.remainingBudget,
                  budgetPlan.currency,
                )}
                positive={
                  editingBudget
                    ? editableRemaining >= 0
                    : budgetPlan.remainingBudget >= 0
                }
                icon={<PieChart size={18} />}
              />
            </section>

            {/* Editing summary */}
            {editingBudget && (
              <section
                className={`p-5 rounded-2xl border ${
                  isOverBudget
                    ? "bg-red-50 border-red-200"
                    : editableRemaining === 0
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isOverBudget
                          ? "text-red-700"
                          : editableRemaining === 0
                            ? "text-emerald-700"
                            : "text-amber-700"
                      }`}
                    >
                      {isOverBudget
                        ? "Budget exceeded"
                        : editableRemaining === 0
                          ? "Budget fully allocated"
                          : "Budget partially allocated"}
                    </p>

                    <p className="text-sm text-slate-600 mt-1">
                      {isOverBudget
                        ? `Reduce allocation by ${formatCurrency(
                            editableTotal - totalBudget,
                            budgetPlan.currency,
                          )}.`
                        : editableRemaining > 0
                          ? `${formatCurrency(
                              editableRemaining,
                              budgetPlan.currency,
                            )} remains available for allocation.`
                          : "Your complete event budget is allocated."}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-500">Allocation</p>
                    <p
                      className={`text-xl font-bold ${
                        isOverBudget ? "text-red-600" : "text-slate-900"
                      }`}
                    >
                      {editablePercentageTotal.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Optimization strategy */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-emerald-600" size={21} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-700 font-bold">
                    Optimization Strategy
                  </p>

                  <p className="font-semibold text-slate-900 mt-1">
                    {budgetPlan.optimizationStrategy}
                  </p>
                </div>
              </div>
            </section>

            {/* Category allocation */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Category Allocation
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {editingBudget
                      ? "Adjust amounts or percentages. Changes are reflected automatically."
                      : "Review how your event budget is distributed."}
                  </p>
                </div>

                {editingBudget && (
                  <span className="text-xs font-medium text-slate-500 px-3 py-2 bg-slate-50 rounded-lg">
                    Total: {formatCurrency(totalBudget, budgetPlan.currency)}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {chartCategories.map((category, index) => {
                  const percentage = editingBudget
                    ? Number(category.percentage) || 0
                    : getPercentage(
                        category.allocatedAmount,
                        budgetPlan.totalBudget,
                      );

                  return (
                    <div
                      key={category.category}
                      className={`rounded-xl border p-4 transition-all ${
                        editingBudget
                          ? "border-emerald-200 bg-emerald-50/30"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  CHART_COLORS[index % CHART_COLORS.length],
                              }}
                            />

                            <h3 className="font-semibold text-slate-900">
                              {category.category}
                            </h3>
                          </div>

                          {category.description && (
                            <p className="text-sm text-slate-500 mt-2">
                              {category.description}
                            </p>
                          )}
                        </div>

                        {editingBudget ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-[380px]">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                Amount ({budgetPlan.currency})
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={category.allocatedAmount}
                                onChange={(e) =>
                                  handleAmountChange(index, e.target.value)
                                }
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                Percentage
                              </label>

                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={category.percentage}
                                  onChange={(e) =>
                                    handlePercentageChange(
                                      index,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2.5 pr-8 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />

                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-left lg:text-right shrink-0">
                            <p className="font-bold text-slate-900">
                              {formatCurrency(
                                category.allocatedAmount,
                                budgetPlan.currency,
                              )}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {category.percentage}%
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                          <span>Allocation</span>
                          <span className="font-medium">
                            {percentage.toFixed(2)}%
                          </span>
                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                Math.max(percentage, 0),
                                100,
                              )}%`,
                              backgroundColor:
                                CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Save / Cancel */}
            {editingBudget && (
              <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-900">
                    Review your allocation
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    You can leave part of the budget unallocated, but the
                    allocation cannot exceed the total budget.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCancelBudgetEdit}
                    disabled={savingBudget}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-50"
                  >
                    <X size={18} />
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveBudget}
                    disabled={savingBudget || isOverBudget}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {savingBudget ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}

                    {savingBudget ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </section>
            )}

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <PieChart className="text-indigo-600" size={18} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Budget Distribution
                    </h2>
                    <p className="text-xs text-slate-500">
                      Visual breakdown by category
                    </p>
                  </div>
                </div>

                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartCategories}
                        dataKey="allocatedAmount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                      >
                        {chartCategories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(value, budgetPlan.currency)
                        }
                      />

                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="text-emerald-600" size={18} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Category Comparison
                    </h2>
                    <p className="text-xs text-slate-500">
                      Compare allocated amounts
                    </p>
                  </div>
                </div>

                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartCategories}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 10,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="category"
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        height={80}
                      />

                      <YAxis />

                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(value, budgetPlan.currency)
                        }
                      />

                      <Bar
                        dataKey="allocatedAmount"
                        name="Allocated"
                        fill="#10b981"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Total */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-600" size={20} />
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900">
                      {editingBudget ? "Current Allocation" : "Total Allocated"}
                    </span>

                    {editingBudget && (
                      <p className="text-xs text-slate-500 mt-1">
                        {editablePercentageTotal.toFixed(2)}% of total budget
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`text-2xl font-bold ${
                    editingBudget && isOverBudget
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(
                    editingBudget ? editableTotal : budgetPlan.totalAllocated,
                    budgetPlan.currency,
                  )}
                </span>
              </div>
            </section>

            {/* Bottom navigation */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/events/${eventId}`)}
                className="group flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-all"
              >
                <ArrowLeft
                  size={18}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
                Back to Event
              </button>

              <button
                onClick={() => navigate(`/events/${eventId}/timeline`)}
                className="group flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm transition-all"
              >
                Continue to Timeline
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BudgetStat = ({ label, value, positive = true, icon }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {icon}
        </div>
      </div>

      <p
        className={`text-2xl font-bold mt-3 ${
          positive ? "text-slate-900" : "text-red-600"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default BudgetPage;
