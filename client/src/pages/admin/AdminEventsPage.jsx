import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Wallet,
  RefreshCw,
  Eye,
  Trash2,
} from "lucide-react";

import {
  fetchAdminEvents,
  deleteAdminEvent,
} from "../../services/adminService";

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchAdminEvents();

      setEvents(data.events || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load events.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Delete "${event.title}" permanently?\n\nThis will remove the event and its related planning data.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(event._id);
      setError("");
      setSuccess("");

      await deleteAdminEvent(event._id);

      setSuccess(`"${event.title}" was deleted successfully.`);

      await loadEvents();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete event.",
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const upcomingEvents = events.filter((event) => {
    if (!event.eventDate) {
      return false;
    }

    return new Date(event.eventDate) >= new Date();
  });

  const completedEvents = events.filter(
    (event) => event.status === "completed",
  );

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
                <CalendarDays size={25} className="text-indigo-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-indigo-600">ADMIN</p>

                <h1 className="text-3xl font-bold text-slate-900">
                  Event Management
                </h1>

                <p className="text-slate-500 mt-1">
                  Monitor and manage events created across EventWise.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadEvents}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {success}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <SummaryCard title="Total Events" value={events.length} />

          <SummaryCard title="Upcoming Events" value={upcomingEvents.length} />

          <SummaryCard
            title="Completed Events"
            value={completedEvents.length}
          />
        </div>

        {/* Events */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">All Events</h2>

            <p className="text-sm text-slate-500 mt-1">
              {loading
                ? "Loading events..."
                : `${events.length} event${
                    events.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-9 h-9 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

              <p className="text-slate-500 mt-4">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays size={42} className="text-slate-300 mx-auto" />

              <p className="text-slate-600 mt-4">No events found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {events.map((event) => {
                const deleting = deleteLoading === event._id;

                return (
                  <div
                    key={event._id}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      {/* Event information */}
                      <div className="flex gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <CalendarDays size={21} className="text-indigo-600" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {event.title}
                          </h3>

                          <p className="text-sm text-indigo-600 font-medium mt-1">
                            {event.eventType || "Event"}
                          </p>

                          {event.description && (
                            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                              {event.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={15} />
                              {formatDate(event.eventDate)}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={15} />
                              {event.location || "Not specified"}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <Users size={15} />
                              {event.guestCount || 0} guests
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <Wallet size={15} />
                              {formatCurrency(event.budget, event.currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                        <StatusBadge status={event.status} />

                        <div className="text-sm text-slate-500 text-left lg:text-right">
                          <p className="font-medium text-slate-700">
                            Created by
                          </p>

                          <p className="mt-1">
                            {event.user?.name || "Unknown user"}
                          </p>

                          {event.user?.email && (
                            <p className="text-xs text-slate-400">
                              {event.user.email}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Link
                            to={`/events/${event._id}`}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium transition-colors"
                          >
                            <Eye size={15} />
                            View
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(event)}
                            disabled={deleting}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {deleting ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
    <p className="text-sm font-medium text-slate-500">{title}</p>

    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const normalized = String(status || "draft").toLowerCase();

  const styles = {
    draft: "bg-slate-100 text-slate-700",
    planned: "bg-indigo-50 text-indigo-700",
    upcoming: "bg-blue-50 text-blue-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
  };

  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
        styles[normalized] || "bg-slate-100 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
};

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

const formatCurrency = (amount, currency = "INR") => {
  if (amount === undefined || amount === null) {
    return "Budget not set";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default AdminEventsPage;
