import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Wallet,
  Sparkles,
  Palette,
  Utensils,
  PartyPopper,
  Star,
  FileText,
} from "lucide-react";
import { createEvent } from "../services/eventService";

const initialForm = {
  title: "",
  eventType: "Wedding",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  location: "",
  guestCount: "",
  budget: "",
  currency: "INR",

  planningPreferences: {
    style: "Modern",
    food: "No Preference",
    decoration: "No Preference",
    entertainment: "No Preference",
    priority: "Balanced",
    specialRequirements: "",
  },
};

const CreateEventPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      planningPreferences: {
        ...previous.planningPreferences,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (form.startTime >= form.endTime) {
      setError("End time must be later than start time.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await createEvent({
        ...form,
        guestCount: Number(form.guestCount),
        budget: Number(form.budget),
      });

      navigate(`/events/${response.event._id}`);
    } catch (err) {
      setError(err.message || "Unable to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="glass-panel rounded-2xl border-slate-800 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-violet-600/15 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Create New Event</h1>

            <p className="text-sm text-slate-400 mt-1">
              Tell us about your event so EventWise can build a personalized
              plan.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ================= BASIC INFORMATION ================= */}
          <section>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-white">
                1. Basic Event Information
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Enter the basic information about your event.
              </p>
            </div>

            <div className="space-y-6">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Name
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Gaurav & Priya Wedding"
                  required
                  minLength={3}
                  maxLength={120}
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* Event Type + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Event Type
                  </label>

                  <select
                    name="eventType"
                    value={form.eventType}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
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

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />

                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Event venue"
                      required
                      maxLength={200}
                      className="w-full rounded-xl bg-slate-900/70 border border-slate-700 pl-10 pr-4 py-3 text-white outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={1000}
                  placeholder="Describe your event..."
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <CalendarDays className="inline w-4 h-4 mr-1" />
                    Date
                  </label>

                  <input
                    type="date"
                    name="eventDate"
                    value={form.eventDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Guests + Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Users className="inline w-4 h-4 mr-1" />
                    Expected Guests
                  </label>

                  <input
                    type="number"
                    name="guestCount"
                    value={form.guestCount}
                    onChange={handleChange}
                    min="1"
                    max="100000"
                    required
                    placeholder="100"
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Wallet className="inline w-4 h-4 mr-1" />
                    Total Budget
                  </label>

                  <div className="flex">
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="rounded-l-xl bg-slate-800 border border-slate-700 px-3 text-white outline-none"
                    >
                      <option value="INR">₹ INR</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                      <option value="GBP">£ GBP</option>
                    </select>

                    <input
                      type="number"
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      placeholder="500000"
                      className="w-full rounded-r-xl bg-slate-900/70 border border-l-0 border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= PLANNING PREFERENCES ================= */}
          <section className="border-t border-slate-800 pt-8">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-white">
                2. Planning Preferences
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                These preferences will help EventWise generate a more
                personalized AI event plan.
              </p>
            </div>

            <div className="space-y-6">
              {/* Style */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Palette className="w-4 h-4 text-violet-400" />
                  Event Style
                </label>

                <select
                  name="style"
                  value={form.planningPreferences.style}
                  onChange={handlePreferenceChange}
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
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
                  value={form.planningPreferences.food}
                  onChange={handlePreferenceChange}
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
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
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Decoration Preference
                </label>

                <select
                  name="decoration"
                  value={form.planningPreferences.decoration}
                  onChange={handlePreferenceChange}
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
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
                  value={form.planningPreferences.entertainment}
                  onChange={handlePreferenceChange}
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
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
                  value={form.planningPreferences.priority}
                  onChange={handlePreferenceChange}
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500"
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
                  value={form.planningPreferences.specialRequirements}
                  onChange={handlePreferenceChange}
                  rows={5}
                  maxLength={1500}
                  placeholder="Example: Need wheelchair accessibility, vegetarian catering, child-friendly activities, stage for 50 people..."
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500 resize-none"
                />

                <p className="text-xs text-slate-500 mt-2">
                  {form.planningPreferences.specialRequirements.length}/1500
                  characters
                </p>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-6 py-3 text-white font-semibold transition"
            >
              <Sparkles className="w-4 h-4" />
              {submitting ? "Creating..." : "Create Event & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
