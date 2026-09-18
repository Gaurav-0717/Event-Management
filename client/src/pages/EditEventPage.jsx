import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Palette,
  Utensils,
  PartyPopper,
  Star,
  FileText,
} from "lucide-react";
import { fetchEvent, updateEvent } from "../services/eventService";

const initialForm = {
  title: "",
  eventType: "Birthday",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  location: "",
  guestCount: "",
  budget: "",
  currency: "INR",
  status: "draft",

  planningPreferences: {
    style: "Modern",
    food: "No Preference",
    decoration: "No Preference",
    entertainment: "No Preference",
    priority: "Balanced",
    specialRequirements: "",
  },
};

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await fetchEvent(id);
        const event = data.event;

        setFormData({
          title: event.title || "",
          eventType: event.eventType || "Birthday",
          description: event.description || "",
          eventDate: event.eventDate
            ? new Date(event.eventDate).toISOString().split("T")[0]
            : "",
          startTime: event.startTime || "",
          endTime: event.endTime || "",
          location: event.location || "",
          guestCount: event.guestCount || "",
          budget: event.budget || "",
          currency: event.currency || "INR",
          status: event.status || "draft",

          planningPreferences: {
            style: event.planningPreferences?.style || "Modern",
            food: event.planningPreferences?.food || "No Preference",
            decoration:
              event.planningPreferences?.decoration || "No Preference",
            entertainment:
              event.planningPreferences?.entertainment || "No Preference",
            priority: event.planningPreferences?.priority || "Balanced",
            specialRequirements:
              event.planningPreferences?.specialRequirements || "",
          },
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load event.");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      planningPreferences: {
        ...previous.planningPreferences,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.startTime >= formData.endTime) {
      setError("End time must be later than start time.");
      return;
    }

    setSaving(true);

    try {
      await updateEvent(id, {
        ...formData,
        guestCount: Number(formData.guestCount),
        budget: Number(formData.budget),
      });

      navigate(`/events/${id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update event.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        Loading event...
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-3">
          Unable to Load Event
        </h1>

        <p className="text-red-400 mb-6">{error}</p>

        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(`/events/${id}`)}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Event
      </button>

      <div className="glass-panel rounded-2xl border border-slate-800 p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold text-white">Edit Event</h1>

        <p className="text-slate-400 mt-2 mb-8">
          Update your event information and planning preferences.
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ================= BASIC INFORMATION ================= */}

          <section>
            <h2 className="text-lg font-bold text-white mb-5">
              1. Basic Event Information
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={120}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Type
                </label>

                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                >
                  <option>Wedding</option>
                  <option>Birthday</option>
                  <option>Corporate</option>
                  <option>Conference</option>
                  <option>Workshop</option>
                  <option>Party</option>
                  <option>College Event</option>
                  <option>Festival</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={4}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Date
                </label>

                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* Guests + Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Number of Guests
                  </label>

                  <input
                    type="number"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleChange}
                    required
                    min="1"
                    max="100000"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Budget
                  </label>

                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Currency
                </label>

                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                >
                  <option value="draft">Draft</option>
                  <option value="planning">Planning</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </section>

          {/* ================= PLANNING PREFERENCES ================= */}

          <section className="border-t border-slate-800 pt-8">
            <h2 className="text-lg font-bold text-white">
              2. Planning Preferences
            </h2>

            <p className="text-sm text-slate-400 mt-1 mb-6">
              Update the preferences that will be used by the AI planning
              system.
            </p>

            <div className="space-y-6">
              {/* Style */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Palette className="w-4 h-4 text-violet-400" />
                  Event Style
                </label>

                <select
                  name="style"
                  value={formData.planningPreferences.style}
                  onChange={handlePreferenceChange}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                >
                  <option>Traditional</option>
                  <option>Modern</option>
                  <option>Minimal</option>
                  <option>Luxury</option>
                  <option>Casual</option>
                  <option>Theme-Based</option>
                  <option>Eco-Friendly</option>
                </select>
              </div>

              {/* Food */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Utensils className="w-4 h-4 text-violet-400" />
                  Food Preference
                </label>

                <select
                  name="food"
                  value={formData.planningPreferences.food}
                  onChange={handlePreferenceChange}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                >
                  <option>Vegetarian</option>
                  <option>Non-Vegetarian</option>
                  <option>Vegan</option>
                  <option>Mixed</option>
                  <option>No Preference</option>
                </select>
              </div>

              {/* Decoration */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <SparklesIcon />
                  Decoration Preference
                </label>

                <select
                  name="decoration"
                  value={formData.planningPreferences.decoration}
                  onChange={handlePreferenceChange}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                >
                  <option>Simple</option>
                  <option>Elegant</option>
                  <option>Traditional</option>
                  <option>Theme-Based</option>
                  <option>Luxury</option>
                  <option>No Preference</option>
                </select>
              </div>

              {/* Entertainment */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <PartyPopper className="w-4 h-4 text-violet-400" />
                  Entertainment
                </label>

                <select
                  name="entertainment"
                  value={formData.planningPreferences.entertainment}
                  onChange={handlePreferenceChange}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                >
                  <option>DJ</option>
                  <option>Live Music</option>
                  <option>Games</option>
                  <option>Dance</option>
                  <option>Cultural Program</option>
                  <option>Photography</option>
                  <option>No Preference</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Star className="w-4 h-4 text-violet-400" />
                  Main Planning Priority
                </label>

                <select
                  name="priority"
                  value={formData.planningPreferences.priority}
                  onChange={handlePreferenceChange}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                >
                  <option>Budget</option>
                  <option>Guest Experience</option>
                  <option>Food</option>
                  <option>Decoration</option>
                  <option>Entertainment</option>
                  <option>Balanced</option>
                </select>
              </div>

              {/* Special Requirements */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <FileText className="w-4 h-4 text-violet-400" />
                  Special Requirements
                </label>

                <textarea
                  name="specialRequirements"
                  value={formData.planningPreferences.specialRequirements}
                  onChange={handlePreferenceChange}
                  rows={5}
                  maxLength={1500}
                  placeholder="Example: Need wheelchair accessibility, vegetarian catering, child-friendly activities..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500 resize-none"
                />

                <p className="text-xs text-slate-500 mt-2">
                  {formData.planningPreferences.specialRequirements.length}
                  /1500 characters
                </p>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`/events/${id}`)}
              className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* Small reusable icon component */
const SparklesIcon = () => <span className="text-violet-400">✨</span>;

export default EditEventPage;
