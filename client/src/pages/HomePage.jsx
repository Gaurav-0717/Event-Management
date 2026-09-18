import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  IndianRupee,
  MapPin,
  Plus,
  Sparkles,
  Users,
  Wallet,
  PartyPopper,
  ListChecks,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

import { fetchEvents } from "../services/eventService";
import { useAuth } from "../context/AuthContext";

// ============================================================
// HOME / OVERVIEW PAGE
// ============================================================

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ------------------------------------------------------------
  // Load user's events
  // ------------------------------------------------------------

  useEffect(() => {
    const loadEvents = async () => {
      // Do not request private events when the user is logged out.
      if (!currentUser) {
        setEvents([]);
        setError("");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetchEvents();

        const eventList = Array.isArray(response)
          ? response
          : Array.isArray(response?.events)
            ? response.events
            : Array.isArray(response?.data)
              ? response.data
              : [];

        setEvents(eventList);
      } catch (err) {
        console.error("Failed to load events:", err);

        setError(
          err?.message ||
            err?.response?.data?.message ||
            "Unable to load your events.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentUser]);

  // ------------------------------------------------------------
  // User name
  // ------------------------------------------------------------

  const userName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.firstName ||
    currentUser?.email?.split("@")[0] ||
    "there";

  // ------------------------------------------------------------
  // Date helpers
  // ------------------------------------------------------------

  const getEventDate = (event) => {
    if (!event?.eventDate) return null;

    const date = new Date(event.eventDate);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const isUpcoming = (event) => {
    const date = getEventDate(event);

    if (!date) return false;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return date >= todayStart;
  };

  const formatDate = (dateValue) => {
    const date = getEventDate({
      eventDate: dateValue,
    });

    if (!date) return "Date not set";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ------------------------------------------------------------
  // Currency
  // ------------------------------------------------------------

  const formatCurrency = (amount, currency = "INR") => {
    const numericAmount = Number(amount) || 0;

    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(numericAmount);
    } catch {
      return `${currency} ${numericAmount.toLocaleString("en-IN")}`;
    }
  };

  // ------------------------------------------------------------
  // Statistics
  // ------------------------------------------------------------

  const upcomingEvents = useMemo(() => events.filter(isUpcoming), [events]);

  const planningEvents = useMemo(
    () =>
      events.filter((event) =>
        ["draft", "planning"].includes(
          String(event?.status || "").toLowerCase(),
        ),
      ),
    [events],
  );

  const totalBudget = useMemo(
    () =>
      events.reduce((total, event) => total + (Number(event?.budget) || 0), 0),
    [events],
  );

  // ------------------------------------------------------------
  // Next event
  // ------------------------------------------------------------

  const nextEvent = useMemo(() => {
    return [...upcomingEvents].sort((a, b) => {
      const dateA = getEventDate(a)?.getTime() || Infinity;
      const dateB = getEventDate(b)?.getTime() || Infinity;

      return dateA - dateB;
    })[0];
  }, [upcomingEvents]);

  // ------------------------------------------------------------
  // Recent events
  // ------------------------------------------------------------

  const recentEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => {
        const dateA = getEventDate(a)?.getTime() || 0;
        const dateB = getEventDate(b)?.getTime() || 0;

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [events]);

  // ------------------------------------------------------------
  // Status styling
  // ------------------------------------------------------------

  const getStatusStyle = (status) => {
    const normalized = String(status || "draft").toLowerCase();

    if (normalized === "confirmed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (normalized === "completed") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    if (normalized === "cancelled") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (normalized === "planning") {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Draft";

    return String(status)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ------------------------------------------------------------
  // Open event
  // ------------------------------------------------------------

  const openEvent = (event) => {
    const eventId = event?._id || event?.id;

    if (!eventId) return;

    navigate(`/events/${eventId}`);
  };

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-indigo-600" />

          <p className="text-sm">Loading your EventWise overview...</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Page
  // ------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white p-6 sm:p-8 lg:p-10 mb-8">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-violet-300/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm mb-4">
                <Sparkles size={15} />
                EventWise AI Planner
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Welcome back,{" "}
                <span className="text-indigo-100">{userName}</span>!
              </h1>

              <p className="mt-3 text-indigo-100 text-base sm:text-lg leading-relaxed">
                Plan your events, organize your preparation, manage your budget,
                and keep everything in one place with EventWise.
              </p>
            </div>

            <Link
              to="/events/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-700 font-semibold shadow-lg hover:bg-indigo-50 transition shrink-0"
            >
              <Plus size={19} />
              Create Event
            </Link>
          </div>
        </section>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />

              <div>
                <p className="font-semibold">Unable to load events</p>

                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            STATISTICS
        ====================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<CalendarDays size={21} />}
            label="Total Events"
            value={events.length}
            description="Events you've created"
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            icon={<Clock3 size={21} />}
            label="Upcoming Events"
            value={upcomingEvents.length}
            description="Scheduled ahead"
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={<Wallet size={21} />}
            label="Total Planned Budget"
            value={formatCurrency(totalBudget)}
            description="Across your events"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            icon={<ListChecks size={21} />}
            label="In Planning"
            value={planningEvents.length}
            description="Events being prepared"
            iconClass="bg-amber-50 text-amber-600"
          />
        </section>

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {events.length === 0 ? (
          <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <PartyPopper size={30} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Your event planning starts here
            </h2>

            <p className="max-w-xl mx-auto mt-3 text-slate-500">
              Create your first event and use EventWise to organize your
              planning, budget, timeline, and vendor discovery.
            </p>

            <Link
              to="/events/new"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              <Plus size={18} />
              Create Your First Event
            </Link>
          </section>
        ) : (
          <>
            {/* ==================================================
                NEXT EVENT
            ================================================== */}

            {nextEvent && (
              <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-8">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-indigo-600" />

                      <h2 className="text-lg font-bold text-slate-900">
                        Your Next Event
                      </h2>
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      Here's the event coming up next.
                    </p>
                  </div>

                  <button
                    onClick={() => openEvent(nextEvent)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Open Event
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-slate-900">
                          {nextEvent.title}
                        </h3>

                        <span
                          className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusStyle(
                            nextEvent.status,
                          )}`}
                        >
                          {getStatusLabel(nextEvent.status)}
                        </span>
                      </div>

                      <p className="text-sm text-indigo-600 font-medium">
                        {nextEvent.eventType || "Event"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0 lg:min-w-[520px]">
                      <EventMeta
                        icon={<CalendarDays size={17} />}
                        label="Date"
                        value={formatDate(nextEvent.eventDate)}
                      />

                      <EventMeta
                        icon={<MapPin size={17} />}
                        label="Location"
                        value={nextEvent.location || "Not specified"}
                      />

                      <EventMeta
                        icon={<Users size={17} />}
                        label="Guests"
                        value={Number(nextEvent.guestCount || 0).toLocaleString(
                          "en-IN",
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                        Event Budget
                      </p>

                      <p className="text-lg font-bold text-slate-900 mt-1">
                        {formatCurrency(
                          nextEvent.budget,
                          nextEvent.currency || "INR",
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => openEvent(nextEvent)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                    >
                      Manage Event
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                RECENT EVENTS
            ================================================== */}

            <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    My Events
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Manage your events and continue planning.
                  </p>
                </div>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View All
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recentEvents.map((event) => {
                    const eventId = event?._id || event?.id;

                    return (
                      <div
                        key={eventId}
                        className="group border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                              {event.eventType || "Event"}
                            </p>

                            <h3 className="font-bold text-slate-900 mt-1 truncate">
                              {event.title || "Untitled Event"}
                            </h3>
                          </div>

                          <span
                            className={`shrink-0 px-2 py-1 rounded-full border text-[11px] font-semibold ${getStatusStyle(
                              event.status,
                            )}`}
                          >
                            {getStatusLabel(event.status)}
                          </span>
                        </div>

                        <div className="mt-5 space-y-3">
                          <SmallMeta
                            icon={<CalendarDays size={15} />}
                            value={formatDate(event.eventDate)}
                          />

                          <SmallMeta
                            icon={<MapPin size={15} />}
                            value={event.location || "Location not specified"}
                          />

                          <SmallMeta
                            icon={<Users size={15} />}
                            value={`${Number(
                              event.guestCount || 0,
                            ).toLocaleString("en-IN")} guests`}
                          />

                          <SmallMeta
                            icon={<IndianRupee size={15} />}
                            value={formatCurrency(
                              event.budget,
                              event.currency || "INR",
                            )}
                          />
                        </div>

                        <button
                          onClick={() => openEvent(event)}
                          className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition"
                        >
                          Open Event
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({ icon, label, value, description, iconClass }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>

          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>

          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// EVENT META
// ============================================================

const EventMeta = ({ icon, label, value }) => {
  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
        {value}
      </p>
    </div>
  );
};

// ============================================================
// SMALL META
// ============================================================

const SmallMeta = ({ icon, value }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="text-slate-400 shrink-0">{icon}</span>

      <span className="truncate">{value}</span>
    </div>
  );
};

export default HomePage;
