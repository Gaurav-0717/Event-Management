import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  CalendarDays,
  Eye,
  FileText,
} from "lucide-react";

import { fetchAdminAIPlans } from "../../services/adminService";

const AdminAIPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [totalPlans, setTotalPlans] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchAdminAIPlans();

      setPlans(data.recentPlans || []);
      setTotalPlans(data.totalPlans || 0);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load AI plans.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Admin Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Sparkles size={25} className="text-indigo-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-indigo-600">ADMIN</p>

                <h1 className="text-3xl font-bold text-slate-900">
                  AI Plan Monitoring
                </h1>

                <p className="text-slate-500 mt-1">
                  Monitor AI-generated event plans across EventWise.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadPlans}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <StatCard title="Total AI Plans" value={totalPlans} />

          <StatCard title="Recently Loaded" value={plans.length} />

          <StatCard title="AI Service" value="Active" />
        </div>

        {/* Plans */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-indigo-600" />

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent AI Plans
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Latest generated plans available in EventWise.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-9 h-9 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

              <p className="text-slate-500 mt-4">Loading AI plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="p-12 text-center">
              <Sparkles size={42} className="text-slate-300 mx-auto" />

              <p className="text-slate-600 mt-4">
                No AI plans have been generated yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    {/* Plan information */}
                    <div className="flex gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Sparkles size={21} className="text-indigo-600" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {plan.title || plan.event?.title || "AI Event Plan"}
                        </h3>

                        <p className="text-sm text-indigo-600 font-medium mt-1">
                          {plan.event?.eventType || "Event"}
                        </p>

                        {plan.summary && (
                          <p className="text-sm text-slate-500 mt-2 max-w-3xl">
                            {plan.summary}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={15} />

                            {formatDate(plan.event?.eventDate)}
                          </span>

                          <span>
                            Generated {formatDateTime(plan.createdAt)}
                          </span>

                          <span>
                            {Array.isArray(plan.objectives)
                              ? `${plan.objectives.length} objectives`
                              : "AI generated"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium shrink-0"
                    >
                      <Eye size={16} />
                      View Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan details modal */}
        {selectedPlan && (
          <PlanDetailsModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
          />
        )}
      </div>
    </div>
  );
};

/* =========================================================
   PLAN DETAILS MODAL
========================================================= */

const PlanDetailsModal = ({ plan, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              AI GENERATED PLAN
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {plan.title || plan.event?.title || "Event Plan"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          {plan.summary && (
            <section>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Summary
              </h3>

              <p className="text-sm leading-6 text-slate-600">{plan.summary}</p>
            </section>
          )}

          {/* Objectives */}
          {Array.isArray(plan.objectives) && plan.objectives.length > 0 && (
            <section>
              <h3 className="text-base font-semibold text-slate-900 mb-3">
                Objectives
              </h3>

              <ul className="space-y-2">
                {plan.objectives.map((objective, index) => (
                  <li key={index} className="flex gap-3 text-sm text-slate-600">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {index + 1}
                    </span>

                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Itinerary */}
          {Array.isArray(plan.itinerary) && plan.itinerary.length > 0 && (
            <section>
              <h3 className="text-base font-semibold text-slate-900 mb-3">
                Itinerary
              </h3>

              <div className="space-y-3">
                {plan.itinerary.map((item, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {item.activity || `Activity ${index + 1}`}
                      </h4>

                      {item.time && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                          {item.time}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-sm text-slate-600 mt-2">
                        {item.description}
                      </p>
                    )}

                    {item.durationMinutes && (
                      <p className="text-xs text-slate-400 mt-2">
                        Duration: {item.durationMinutes} minutes
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recommendations */}
          {Array.isArray(plan.recommendations) &&
            plan.recommendations.length > 0 && (
              <section>
                <h3 className="text-base font-semibold text-slate-900 mb-3">
                  Recommendations
                </h3>

                <div className="space-y-3">
                  {plan.recommendations.map((item, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      {item.category && (
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                          {item.category}
                        </span>
                      )}

                      <h4 className="font-semibold text-slate-900 mt-1">
                        {item.recommendation || "Recommendation"}
                      </h4>

                      {item.reason && (
                        <p className="text-sm text-slate-600 mt-2">
                          {item.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Notes */}
          {Array.isArray(plan.notes) && plan.notes.length > 0 && (
            <section>
              <h3 className="text-base font-semibold text-slate-900 mb-3">
                Notes
              </h3>

              <ul className="space-y-2">
                {plan.notes.map((note, index) => (
                  <li
                    key={index}
                    className="text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-3"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ title, value }) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
    <p className="text-sm font-medium text-slate-500">{title}</p>

    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
  </div>
);

/* =========================================================
   DATE HELPERS
========================================================= */

const formatDate = (date) => {
  if (!date) {
    return "Date not set";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) {
    return "Unknown";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default AdminAIPlansPage;
