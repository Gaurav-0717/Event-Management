import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  CalendarDays,
  MapPin,
  Users,
  Wallet,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { fetchEvents } from "../services/eventService";

const DashboardPage = () => {
  const { currentUser } = useAuth();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  const details = [
    {
      label: "Email",
      value: currentUser?.email || "—",
      icon: Mail,
    },
    {
      label: "Role",
      value: currentUser?.role || "—",
      icon: ShieldCheck,
      capitalize: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* =====================================================
            Welcome Header
        ===================================================== */}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-indigo-600" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-indigo-600 font-semibold mb-1">
                Authenticated Workspace
              </p>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 truncate">
                Welcome, {currentUser?.name || "User"}
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Manage your events and planning workspace from one place.
              </p>
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">
            {details.map(
              ({ label, value, icon: IconComponent, capitalize }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                    <IconComponent className="w-4 h-4 text-slate-400" />
                    <span>{label}</span>
                  </div>

                  <div
                    className={`text-base font-semibold text-slate-900 truncate ${
                      capitalize ? "capitalize" : ""
                    }`}
                  >
                    {value}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        {/* =====================================================
            Events Workspace
        ===================================================== */}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Events Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="text-indigo-600" size={21} />

                <h2 className="text-xl font-bold text-slate-900">
                  Your Events
                </h2>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Manage your event planning workspace.
              </p>
            </div>

            <Link
              to="/events/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Create Event
            </Link>
          </div>

          {/* ===================================================
              Loading State
          =================================================== */}

          {loadingEvents && (
            <div className="py-14 text-center">
              <div className="inline-flex items-center gap-2 text-slate-500">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin" />
                Loading your events...
              </div>
            </div>
          )}

          {/* ===================================================
              Empty State
          =================================================== */}

          {!loadingEvents && events.length === 0 && (
            <div className="py-14 px-6 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-5">
                <Sparkles className="w-7 h-7" />
              </div>

              <h3 className="text-slate-900 font-semibold mb-1">
                No events yet
              </h3>

              <p className="text-sm text-slate-500 mb-5">
                Create your first event to start planning.
              </p>

              <Link
                to="/events/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Create Your First Event
              </Link>
            </div>
          )}

          {/* ===================================================
              Event Cards
          =================================================== */}

          {!loadingEvents && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {events.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 block"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-slate-900 font-semibold truncate group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </h3>

                      <p className="text-sm text-indigo-600 font-medium mt-1">
                        {event.eventType || "Event"}
                      </p>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 capitalize shrink-0">
                      {event.status || "Planning"}
                    </span>
                  </div>

                  {/* Event Information */}
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin size={16} className="text-slate-400 shrink-0" />

                      <span className="truncate">
                        {event.location || "Location not specified"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                      <Users size={16} className="text-slate-400 shrink-0" />

                      <span>{event.guestCount || 0} guests</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                      <Wallet size={16} className="text-slate-400 shrink-0" />

                      <span>
                        {event.currency || "INR"}{" "}
                        {Number(event.budget || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Open Event */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm font-medium text-indigo-600">
                      <span>View event details</span>

                      <ArrowRight
                        size={17}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ===================================================
              Footer
          =================================================== */}

          <div className="mt-8 pt-6 border-t border-slate-200">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
            >
              ← Back to Overview
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
