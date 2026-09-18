import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Wallet,
  Pencil,
  Trash2,
  Download,
  Sparkles,
  TrendingUp,
  CheckSquare,
  Store,
  Loader2,
  AlertCircle,
  FileText,
  PartyPopper,
} from "lucide-react";

import { fetchEvent, deleteEvent } from "../services/eventService";
import { downloadEventDossier } from "../services/dossierService";

const EventDetailsPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  // ============================================================
  // State
  // ============================================================

  const [event, setEvent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [downloadingDossier, setDownloadingDossier] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // ============================================================
  // Load Event
  // ============================================================

  useEffect(() => {
    if (!eventId) return;

    loadEvent();
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

  // ============================================================
  // Delete Event
  // ============================================================

  const handleDelete = async () => {
    if (!event) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setActionError("");

      await deleteEvent(eventId);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Failed to delete event:", err);

      setActionError(err.message || "Failed to delete event.");
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // Download Dossier
  // ============================================================

  const handleDownloadDossier = async () => {
    try {
      setDownloadingDossier(true);
      setActionError("");

      await downloadEventDossier(eventId);
    } catch (err) {
      console.error("Failed to download dossier:", err);

      setActionError(err.message || "Failed to download the event dossier.");
    } finally {
      setDownloadingDossier(false);
    }
  };

  // ============================================================
  // Format Date
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "Not specified";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  // ============================================================
  // Format Currency
  // ============================================================

  const formatCurrency = (amount, currency = "INR") => {
    if (amount === undefined || amount === null) {
      return "Not specified";
    }

    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${Number(amount).toLocaleString("en-IN")}`;
    }
  };

  // ============================================================
  // Loading State
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin text-indigo-600" size={36} />

          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Error State
  // ============================================================

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="bg-white border border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-3 text-red-600">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />

              <div>
                <h2 className="font-semibold">Unable to load event</h2>

                <p className="text-sm mt-1">{error || "Event not found."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // Status
  // ============================================================

  const status = event.status || "Draft";

  const statusStyles = {
    Draft: "bg-amber-50 text-amber-700 border-amber-200",
    Planning: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Completed: "bg-slate-100 text-slate-700 border-slate-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  const statusClass =
    statusStyles[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ======================================================
            Back
        ====================================================== */}

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* ======================================================
            Action Error
        ====================================================== */}

        {actionError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />

              <div>
                <p className="font-medium">Action failed</p>

                <p className="text-sm mt-1">{actionError}</p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            Event Header
        ====================================================== */}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Event Title */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <PartyPopper className="text-indigo-600" size={28} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-indigo-600">
                      {event.eventType || "EVENT"}
                    </span>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusClass}`}
                    >
                      {status}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                    {event.title}
                  </h1>

                  {event.description && (
                    <p className="text-slate-500 mt-3 max-w-3xl leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/events/${eventId}/edit`)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  <Pencil size={17} />
                  Edit
                </button>

                <button
                  onClick={handleDownloadDossier}
                  disabled={downloadingDossier}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {downloadingDossier ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Download size={17} />
                  )}

                  {downloadingDossier ? "Preparing..." : "Download Dossier"}
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Trash2 size={17} />
                  )}

                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            Event Information
        ====================================================== */}

        <section className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard
              icon={<CalendarDays size={21} />}
              label="Event Date"
              value={formatDate(event.eventDate)}
            />

            <InfoCard
              icon={<Clock size={21} />}
              label="Time"
              value={
                event.startTime
                  ? `${event.startTime}${
                      event.endTime ? ` – ${event.endTime}` : ""
                    }`
                  : "Not specified"
              }
            />

            <InfoCard
              icon={<MapPin size={21} />}
              label="Location"
              value={event.location || "Not specified"}
            />

            <InfoCard
              icon={<Users size={21} />}
              label="Guests"
              value={
                event.guestCount
                  ? `${Number(event.guestCount).toLocaleString("en-IN")} guests`
                  : "Not specified"
              }
            />
          </div>
        </section>

        {/* ======================================================
            Budget Summary
        ====================================================== */}

        <section className="mt-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Wallet className="text-emerald-600" size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Event Budget</p>

                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(event.budget, event.currency || "INR")}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/events/${eventId}/budget`)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                <TrendingUp size={17} />
                Open Budget Optimization
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================
            Event Planning Tools
        ====================================================== */}

        <section className="mt-8">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={21} />

              <h2 className="text-2xl font-bold text-slate-900">
                Event Planning Tools
              </h2>
            </div>

            <p className="text-slate-500 mt-1">
              Manage each part of your event from dedicated planning tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ==================================================
                AI Plan
            ================================================== */}

            <PlanningToolCard
              icon={<Sparkles size={25} />}
              iconWrapper="bg-indigo-50 text-indigo-600"
              title="AI Event Plan"
              description="Generate an AI-powered event plan with objectives, itinerary, recommendations, and planning notes."
              buttonText="Open AI Plan"
              buttonClass="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate(`/events/${eventId}/ai-plan`)}
            />

            {/* ==================================================
                Budget
            ================================================== */}

            <PlanningToolCard
              icon={<TrendingUp size={25} />}
              iconWrapper="bg-emerald-50 text-emerald-600"
              title="Budget Optimization"
              description="Optimize your event budget, review category allocations, edit amounts, and visualize spending."
              buttonText="Open Budget"
              buttonClass="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate(`/events/${eventId}/budget`)}
            />

            {/* ==================================================
                Timeline
            ================================================== */}

            <PlanningToolCard
              icon={<CheckSquare size={25} />}
              iconWrapper="bg-amber-50 text-amber-600"
              title="Timeline & Checklist"
              description="Manage AI-generated preparation tasks, deadlines, task status, and your event checklist."
              buttonText="Open Timeline"
              buttonClass="bg-amber-500 hover:bg-amber-600"
              onClick={() => navigate(`/events/${eventId}/timeline`)}
            />

            {/* ==================================================
                Vendors
            ================================================== */}

            <PlanningToolCard
              icon={<Store size={25} />}
              iconWrapper="bg-purple-50 text-purple-600"
              title="AI Vendor Matching"
              description="Discover vendors matched to your event type, location, guest count, budget, and preferences."
              buttonText="Find Vendors"
              buttonClass="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate(`/events/${eventId}/vendors`)}
            />
          </div>
        </section>

        {/* ======================================================
            Quick Navigation
        ====================================================== */}

        <section className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-indigo-600" size={21} />

            <h2 className="text-lg font-semibold text-slate-900">
              Event Resources
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadDossier}
              disabled={downloadingDossier}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {downloadingDossier ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}

              {downloadingDossier
                ? "Preparing Dossier..."
                : "Download Complete Event Dossier"}
            </button>

            <button
              onClick={() => navigate(`/events/${eventId}/ai-plan`)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            >
              <Sparkles size={18} />
              Review AI Plan
            </button>
          </div>
        </section>

        {/* ======================================================
            Footer Navigation
        ====================================================== */}

        <div className="flex justify-center mt-8 pb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// Info Card
// =================================================================

const InfoCard = ({ icon, label, value }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            {label}
          </p>

          <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// Planning Tool Card
// =================================================================

const PlanningToolCard = ({
  icon,
  iconWrapper,
  title,
  description,
  buttonText,
  buttonClass,
  onClick,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconWrapper}`}
        >
          {icon}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {description}
          </p>

          <button
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-2 mt-5 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${buttonClass}`}
          >
            {buttonText}
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
