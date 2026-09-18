import { useEffect, useState } from "react";

import {
  Building2,
  Utensils,
  Sparkles,
  Music,
  Camera,
  Car,
  Star,
  MapPin,
  Users,
  IndianRupee,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { fetchMatchedVendors } from "../services/vendorService";

// ============================================================
// CATEGORY ICONS
// ============================================================

const categoryIcons = {
  Venue: Building2,
  Food: Utensils,
  Decoration: Sparkles,
  Entertainment: Music,
  Photography: Camera,
  Transportation: Car,
  Other: Sparkles,
};

// ============================================================
// CATEGORIES
// ============================================================

const categories = [
  "All",
  "Venue",
  "Food",
  "Decoration",
  "Entertainment",
  "Photography",
  "Transportation",
  "Other",
];

// ============================================================
// COMPONENT
// ============================================================

const VendorMatching = ({ eventId }) => {
  const [vendors, setVendors] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD MATCHED VENDORS
  // ==========================================================

  const loadVendors = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError("");

      const category = selectedCategory === "All" ? "" : selectedCategory;

      const response = await fetchMatchedVendors(eventId, category, 20);

      setVendors(Array.isArray(response?.vendors) ? response.vendors : []);
    } catch (err) {
      console.error("Failed to load matched vendors:", err);

      setError(err?.message || "Failed to load matched vendors.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD WHEN EVENT / CATEGORY CHANGES
  // ==========================================================

  useEffect(() => {
    loadVendors();
  }, [eventId, selectedCategory]);

  // ==========================================================
  // FORMAT CURRENCY
  // ==========================================================

  const formatCurrency = (amount, currency = "INR") => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(amount) || 0);
    } catch {
      return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    }
  };

  // ==========================================================
  // MATCH COLOR
  // ==========================================================

  const getMatchColor = (percentage) => {
    if (percentage >= 80) {
      return "bg-emerald-100 text-emerald-700";
    }

    if (percentage >= 60) {
      return "bg-blue-100 text-blue-700";
    }

    if (percentage >= 40) {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="mt-8 mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-600" size={23} />

            <h2 className="text-xl font-semibold text-slate-900">
              AI Vendor Matching
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Find vendors that match your event requirements, budget, guests,
            location and preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={loadVendors}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ======================================================
          CATEGORY FILTER
      ====================================================== */}

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedCategory === category
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="flex min-h-[220px] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 size={34} className="animate-spin text-purple-600" />

            <p className="text-sm">Finding suitable vendors...</p>
          </div>
        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />

            <div>
              <h3 className="font-semibold text-red-800">
                Unable to load vendors
              </h3>

              <p className="mt-1 text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={loadVendors}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {!loading && !error && vendors.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <Building2 size={42} className="mx-auto text-slate-400" />

          <h3 className="mt-3 font-semibold text-slate-800">
            No matching vendors found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try another category or update your event requirements.
          </p>
        </div>
      )}

      {/* ======================================================
          VENDOR CARDS
      ====================================================== */}

      {!loading && !error && vendors.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vendors.map((vendor) => {
            const Icon = categoryIcons[vendor.category] || Sparkles;

            const matchPercentage = Math.max(
              0,
              Math.min(100, Number(vendor.matchPercentage || 0)),
            );

            return (
              <div
                key={vendor._id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* ------------------------------------------------
                      CARD HEADER
                  ------------------------------------------------ */}

                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <Icon size={17} className="text-purple-600" />
                    </div>

                    <span className="text-sm font-semibold text-slate-800">
                      {vendor.category}
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getMatchColor(
                      matchPercentage,
                    )}`}
                  >
                    {matchPercentage}% Match
                  </span>
                </div>

                {/* ------------------------------------------------
                      CARD BODY
                  ------------------------------------------------ */}

                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    {vendor.name}
                  </h3>

                  {vendor.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                      {vendor.description}
                    </p>
                  )}

                  {/* Location */}

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={16} className="shrink-0 text-slate-400" />

                    <span>
                      {vendor.area
                        ? `${vendor.area}, ${vendor.city}`
                        : vendor.city || "Location not available"}
                    </span>
                  </div>

                  {/* Guests */}

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <Users size={16} className="shrink-0 text-slate-400" />

                    <span>
                      {vendor.minGuests || 0} – {vendor.maxGuests || "Any"}{" "}
                      guests
                    </span>
                  </div>

                  {/* Budget */}

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <IndianRupee
                      size={16}
                      className="shrink-0 text-slate-400"
                    />

                    <span>
                      {formatCurrency(
                        vendor.minBudget,
                        vendor.currency || "INR",
                      )}{" "}
                      –{" "}
                      {formatCurrency(
                        vendor.maxBudget,
                        vendor.currency || "INR",
                      )}
                    </span>
                  </div>

                  {/* Rating */}

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />

                      <span className="text-sm font-semibold text-slate-800">
                        {Number(vendor.rating || 0).toFixed(1)}
                      </span>
                    </div>

                    <span className="text-xs text-slate-500">
                      ({vendor.reviewCount || 0} reviews)
                    </span>
                  </div>

                  {/* Match Score */}

                  <div className="mt-5">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Match Score
                      </span>

                      <span className="text-xs font-semibold text-slate-700">
                        {matchPercentage}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-purple-600 transition-all duration-500"
                        style={{
                          width: `${matchPercentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* ------------------------------------------------
                        MATCH BREAKDOWN
                    ------------------------------------------------ */}

                  {vendor.matchBreakdown && (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Match Breakdown
                      </p>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <BreakdownItem
                          label="Event Type"
                          value={vendor.matchBreakdown.eventType}
                        />

                        <BreakdownItem
                          label="Location"
                          value={vendor.matchBreakdown.location}
                        />

                        <BreakdownItem
                          label="Guests"
                          value={vendor.matchBreakdown.guests}
                        />

                        <BreakdownItem
                          label="Budget"
                          value={vendor.matchBreakdown.budget}
                        />

                        <BreakdownItem
                          label="Style"
                          value={vendor.matchBreakdown.style}
                        />

                        <BreakdownItem
                          label="Food"
                          value={vendor.matchBreakdown.food}
                        />

                        <BreakdownItem
                          label="Entertainment"
                          value={vendor.matchBreakdown.entertainment}
                        />
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------
                        CONTACT BUTTONS
                    ------------------------------------------------ */}

                  {(vendor.website || vendor.phone || vendor.email) && (
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      {vendor.website && (
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Website
                        </a>
                      )}

                      {vendor.phone && (
                        <a
                          href={`tel:${vendor.phone}`}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Call
                        </a>
                      )}

                      {vendor.email && (
                        <a
                          href={`mailto:${vendor.email}`}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Email
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

// ============================================================
// BREAKDOWN ITEM
// ============================================================

const BreakdownItem = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5">
      <span className="text-xs text-slate-500">{label}</span>

      <span className="text-xs font-semibold text-slate-800">
        {Number(value || 0)}
      </span>
    </div>
  );
};

export default VendorMatching;
