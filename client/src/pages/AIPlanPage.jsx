import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Target,
  ListChecks,
  Lightbulb,
  StickyNote,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  CalendarDays,
  Users,
  Wallet,
  MapPin,
} from "lucide-react";

import { fetchEvent } from "../services/eventService";
import { generateAIPlan, fetchAIPlan } from "../services/aiPlanService";

const AIPlanPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");

  // ============================================================
  // LOAD EVENT + AI PLAN
  // ============================================================

  useEffect(() => {
    if (!eventId) return;

    loadEvent();
    loadAIPlan();
  }, [eventId]);

  // ============================================================
  // LOAD EVENT
  // ============================================================

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

  // ============================================================
  // LOAD EXISTING AI PLAN
  // ============================================================

  const loadAIPlan = async () => {
    try {
      setLoadingPlan(true);
      setAiError("");

      const response = await fetchAIPlan(eventId);

      setAiPlan(response.plan);
    } catch (err) {
      // 404 means there is no generated plan yet.
      if (err.status !== 404) {
        console.error("Failed to load AI plan:", err);

        setAiError(err.message || "Unable to load the AI plan.");
      }

      setAiPlan(null);
    } finally {
      setLoadingPlan(false);
    }
  };

  // ============================================================
  // FRIENDLY AI ERROR
  // ============================================================

  const getFriendlyAIError = (err) => {
    const message = String(err?.message || "").toLowerCase();

    const status = err?.status || err?.statusCode || err?.data?.status;

    if (
      status === 503 ||
      message.includes("503") ||
      message.includes("unavailable") ||
      message.includes("high demand") ||
      message.includes("try again later")
    ) {
      return "The AI service is temporarily busy. EventWise automatically retries temporary AI failures. Please try generating the plan again in a moment.";
    }

    if (
      status === 429 ||
      message.includes("rate limit") ||
      message.includes("resource_exhausted")
    ) {
      return "The AI service has temporarily reached its usage limit. Please try again shortly.";
    }

    if (message.includes("timeout") || message.includes("timed out")) {
      return "AI generation took too long to complete. Please try again.";
    }

    if (status === 401 || status === 403) {
      return "The AI service could not be authenticated. Please check the AI service configuration.";
    }

    return err?.message || "Unable to generate the AI plan. Please try again.";
  };

  // ============================================================
  // GENERATE / REGENERATE AI PLAN
  // ============================================================

  const handleGenerateAIPlan = async () => {
    if (generatingPlan || loadingPlan || !eventId) {
      return;
    }

    try {
      setGeneratingPlan(true);
      setAiError("");

      const response = await generateAIPlan(eventId);

      if (response?.plan) {
        setAiPlan(response.plan);
      } else {
        throw new Error("The AI service returned an invalid plan.");
      }
    } catch (err) {
      console.error("Failed to generate AI plan:", err);

      // IMPORTANT:
      // Do not clear the existing plan.
      // The previous successful plan remains visible.
      setAiError(getFriendlyAIError(err));
    } finally {
      setGeneratingPlan(false);
    }
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
            <Loader2 className="animate-spin text-indigo-600" size={28} />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // EVENT ERROR
  // ============================================================

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(`/events/${eventId}`)}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors mb-6"
          >
            <ArrowLeft size={18} />
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

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ======================================================
            BACK
        ====================================================== */}

        <button
          type="button"
          onClick={() => navigate(`/events/${eventId}`)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          Back to Event
        </button>

        {/* ======================================================
            HEADER
        ====================================================== */}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Sparkles size={19} className="text-indigo-600" />
                </div>

                <span className="text-xs font-bold tracking-wide text-indigo-600">
                  AI EVENT PLANNER
                </span>
              </div>

              <h1 className="text-3xl font-bold text-slate-900">
                AI Event Plan
              </h1>

              <p className="text-slate-500 mt-2">
                {event.title} <span className="text-slate-300">•</span>{" "}
                {event.eventType}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateAIPlan}
              disabled={generatingPlan || loadingPlan}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generatingPlan ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating AI Plan...
                </>
              ) : aiPlan ? (
                <>
                  <RefreshCw size={18} />
                  Regenerate Plan
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate AI Plan
                </>
              )}
            </button>
          </div>

          {/* Event information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <CalendarDays size={18} className="text-indigo-600 shrink-0" />

              <div className="min-w-0">
                <p className="text-xs text-slate-400">Date</p>

                <p className="text-sm font-medium text-slate-700 truncate">
                  {event.eventDate
                    ? new Date(event.eventDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Clock size={18} className="text-indigo-600 shrink-0" />

              <div className="min-w-0">
                <p className="text-xs text-slate-400">Time</p>

                <p className="text-sm font-medium text-slate-700 truncate">
                  {event.startTime || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Users size={18} className="text-indigo-600 shrink-0" />

              <div className="min-w-0">
                <p className="text-xs text-slate-400">Guests</p>

                <p className="text-sm font-medium text-slate-700 truncate">
                  {event.guestCount || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Wallet size={18} className="text-indigo-600 shrink-0" />

              <div className="min-w-0">
                <p className="text-xs text-slate-400">Budget</p>

                <p className="text-sm font-medium text-slate-700 truncate">
                  {event.currency || "INR"} {event.budget || 0}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            GENERATING STATUS
        ====================================================== */}

        {generatingPlan && (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-indigo-600" />
              </div>

              <div>
                <p className="font-semibold text-indigo-900">
                  EventWise is creating your plan
                </p>

                <p className="text-sm text-indigo-700 mt-1">
                  AI is analyzing your event details, guest count, budget,
                  timing, and preferences.
                </p>

                <div className="flex items-center gap-2 mt-3 text-xs font-medium text-indigo-600">
                  <Loader2 size={14} className="animate-spin" />
                  This may take a few moments...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            AI ERROR
        ====================================================== */}

        {aiError && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-amber-600 mt-0.5 shrink-0"
              />

              <div className="flex-1">
                <p className="font-semibold text-amber-900">
                  AI generation issue
                </p>

                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                  {aiError}
                </p>

                {aiPlan && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700 mt-3">
                    <CheckCircle2 size={14} />
                    Your previous AI plan is still available below.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            LOADING EXISTING PLAN
        ====================================================== */}

        {loadingPlan && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
              <Loader2 size={26} className="animate-spin text-indigo-600" />
            </div>

            <p className="mt-4 font-medium text-slate-700">
              Loading your AI plan...
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Preparing your personalized event planning workspace.
            </p>
          </div>
        )}

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {!loadingPlan && !aiPlan && !aiError && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 sm:p-14 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Sparkles size={32} className="text-indigo-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-6">
              Create your AI event plan
            </h2>

            <p className="max-w-lg mx-auto text-slate-500 mt-3 leading-relaxed">
              EventWise will analyze your event details and create a practical
              plan with objectives, itinerary, recommendations, and planning
              notes.
            </p>

            <button
              type="button"
              onClick={handleGenerateAIPlan}
              disabled={generatingPlan}
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generatingPlan ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate AI Plan
                </>
              )}
            </button>
          </div>
        )}

        {/* ======================================================
            AI PLAN CONTENT
        ====================================================== */}

        {aiPlan && !loadingPlan && (
          <div className="space-y-6">
            {/* ==================================================
                SUMMARY
            ================================================== */}

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-indigo-600" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-1">
                    Personalized Plan
                  </p>

                  <h2 className="text-xl font-bold text-slate-900">
                    {aiPlan.title}
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed mt-5">
                {aiPlan.summary}
              </p>
            </section>

            {/* ==================================================
                OBJECTIVES
            ================================================== */}

            {aiPlan.objectives?.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Target size={21} className="text-indigo-600" />

                  <h2 className="text-xl font-bold text-slate-900">
                    Objectives
                  </h2>
                </div>

                <div className="grid gap-3">
                  {aiPlan.objectives.map((objective, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm shrink-0">
                        {index + 1}
                      </span>

                      <span className="text-slate-600 leading-relaxed pt-1">
                        {objective}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ==================================================
                ITINERARY
            ================================================== */}

            {aiPlan.itinerary?.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ListChecks size={21} className="text-indigo-600" />

                  <h2 className="text-xl font-bold text-slate-900">
                    Itinerary
                  </h2>
                </div>

                <div className="relative">
                  <div className="hidden md:block absolute left-[64px] top-6 bottom-6 w-px bg-indigo-100" />

                  <div className="space-y-4">
                    {aiPlan.itinerary.map((item, index) => (
                      <div
                        key={index}
                        className="relative flex flex-col md:flex-row gap-4"
                      >
                        <div className="md:w-[130px] shrink-0">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold">
                            <Clock size={14} />
                            {item.time}
                          </span>
                        </div>

                        <div className="hidden md:flex relative z-10 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50 mt-2 shrink-0" />

                        <div className="flex-1 p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all">
                          <h3 className="font-bold text-slate-900">
                            {item.activity}
                          </h3>

                          {item.description && (
                            <p className="text-slate-600 mt-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {item.durationMinutes !== undefined && (
                            <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-slate-500">
                              <Clock size={13} />
                              {item.durationMinutes} minutes
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                RECOMMENDATIONS
            ================================================== */}

            {aiPlan.recommendations?.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Lightbulb size={21} className="text-indigo-600" />

                  <h2 className="text-xl font-bold text-slate-900">
                    Recommendations
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiPlan.recommendations.map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl bg-indigo-50/60 border border-indigo-100 hover:border-indigo-200 transition-colors"
                    >
                      {item.category && (
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-white border border-indigo-100 text-xs font-bold uppercase tracking-wide text-indigo-600">
                          {item.category}
                        </span>
                      )}

                      <h3 className="font-bold text-slate-900 mt-3">
                        {item.recommendation}
                      </h3>

                      {item.reason && (
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {item.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ==================================================
                NOTES
            ================================================== */}

            {aiPlan.notes?.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <StickyNote size={21} className="text-indigo-600" />

                  <h2 className="text-xl font-bold text-slate-900">
                    Planning Notes
                  </h2>
                </div>

                <div className="space-y-3">
                  {aiPlan.notes.map((note, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50"
                    >
                      <CheckCircle2
                        size={17}
                        className="text-indigo-600 mt-0.5 shrink-0"
                      />

                      <span className="text-slate-600 leading-relaxed">
                        {note}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ==================================================
                EVENT LOCATION
            ================================================== */}

            {event.location && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <MapPin size={18} className="text-slate-600" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Event Location
                    </p>

                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {event.location}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                BOTTOM NAVIGATION
            ================================================== */}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/events/${eventId}`)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Event
              </button>

              <button
                type="button"
                onClick={() => navigate(`/events/${eventId}/budget`)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Continue to Budget
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPlanPage;
