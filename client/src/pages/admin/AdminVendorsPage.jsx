import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  RefreshCw,
  Pencil,
  Trash2,
  Power,
  MapPin,
  Star,
} from "lucide-react";

import {
  fetchAdminVendors,
  updateAdminVendor,
  deleteAdminVendor,
} from "../../services/adminService";

const AdminVendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingVendor, setEditingVendor] = useState(null);

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchAdminVendors();

      setVendors(data.vendors || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load vendors.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleToggleActive = async (vendor) => {
    const newStatus = !vendor.isActive;

    const confirmed = window.confirm(
      `${newStatus ? "Activate" : "Deactivate"} "${vendor.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`toggle-${vendor._id}`);
      setError("");
      setSuccess("");

      await updateAdminVendor(vendor._id, {
        isActive: newStatus,
      });

      setSuccess(`${vendor.name} is now ${newStatus ? "active" : "inactive"}.`);

      await loadVendors();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update vendor.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (vendor) => {
    const confirmed = window.confirm(
      `Delete "${vendor.name}" permanently?\n\nThis vendor will be removed from EventWise.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`delete-${vendor._id}`);
      setError("");
      setSuccess("");

      await deleteAdminVendor(vendor._id);

      setSuccess(`${vendor.name} was deleted successfully.`);

      await loadVendors();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete vendor.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSave = async (vendorData) => {
    try {
      setActionLoading(`edit-${editingVendor._id}`);
      setError("");
      setSuccess("");

      await updateAdminVendor(editingVendor._id, vendorData);

      setSuccess(`${vendorData.name} was updated successfully.`);

      setEditingVendor(null);

      await loadVendors();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update vendor.",
      );
    } finally {
      setActionLoading(null);
    }
  };

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
                <Store size={25} className="text-indigo-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-indigo-600">ADMIN</p>

                <h1 className="text-3xl font-bold text-slate-900">
                  Vendor Management
                </h1>

                <p className="text-slate-500 mt-1">
                  Manage vendors available for AI matching.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadVendors}
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

        {/* Success */}
        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {success}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <StatCard title="Total Vendors" value={vendors.length} />

          <StatCard
            title="Active Vendors"
            value={vendors.filter((vendor) => vendor.isActive).length}
          />

          <StatCard
            title="Inactive Vendors"
            value={vendors.filter((vendor) => !vendor.isActive).length}
          />
        </div>

        {/* Vendor List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              All Vendors
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {loading
                ? "Loading vendors..."
                : `${vendors.length} vendor${
                    vendors.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-9 h-9 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

              <p className="text-slate-500 mt-4">Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="p-12 text-center">
              <Store size={42} className="text-slate-300 mx-auto" />

              <p className="text-slate-600 mt-4">No vendors found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {vendors.map((vendor) => {
                const toggleLoading = actionLoading === `toggle-${vendor._id}`;

                const deleteLoading = actionLoading === `delete-${vendor._id}`;

                return (
                  <div
                    key={vendor._id}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      {/* Vendor Information */}
                      <div className="flex gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <Store size={21} className="text-indigo-600" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {vendor.name}
                            </h3>

                            <StatusBadge active={vendor.isActive} />
                          </div>

                          <p className="text-sm text-indigo-600 font-medium mt-1">
                            {vendor.category || "Other"}
                          </p>

                          {vendor.description && (
                            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                              {vendor.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={15} />
                              {vendor.city || "Location not specified"}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <Star size={15} className="fill-current" />

                              {vendor.rating ?? "N/A"}

                              {vendor.reviewCount
                                ? ` (${vendor.reviewCount})`
                                : ""}
                            </span>

                            <span>
                              {vendor.minGuests ?? 0} -{" "}
                              {vendor.maxGuests ?? "∞"} guests
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingVendor(vendor)}
                          disabled={toggleLoading || deleteLoading}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium disabled:opacity-50"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(vendor)}
                          disabled={toggleLoading || deleteLoading}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-medium disabled:opacity-50"
                        >
                          {toggleLoading ? (
                            <RefreshCw size={15} className="animate-spin" />
                          ) : (
                            <Power size={15} />
                          )}

                          {vendor.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(vendor)}
                          disabled={toggleLoading || deleteLoading}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium disabled:opacity-50"
                        >
                          {deleteLoading ? (
                            <RefreshCw size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Vendor Modal */}
        {editingVendor && (
          <VendorEditModal
            vendor={editingVendor}
            loading={actionLoading === `edit-${editingVendor._id}`}
            onClose={() => setEditingVendor(null)}
            onSave={handleEditSave}
          />
        )}
      </div>
    </div>
  );
};

/* =========================================================
   EDIT VENDOR MODAL
========================================================= */

const VendorEditModal = ({ vendor, loading, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: vendor.name || "",
    description: vendor.description || "",
    city: vendor.city || "",
    area: vendor.area || "",
    address: vendor.address || "",
    phone: vendor.phone || "",
    email: vendor.email || "",
    website: vendor.website || "",
    rating: vendor.rating ?? 0,
    reviewCount: vendor.reviewCount ?? 0,
    minGuests: vendor.minGuests ?? 0,
    maxGuests: vendor.maxGuests ?? 0,
    minBudget: vendor.minBudget ?? 0,
    maxBudget: vendor.maxBudget ?? 0,
    available: vendor.available ?? true,
    isActive: vendor.isActive ?? true,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      ...form,

      rating: Number(form.rating),

      reviewCount: Number(form.reviewCount),

      minGuests: Number(form.minGuests),

      maxGuests: Number(form.maxGuests),

      minBudget: Number(form.minBudget),

      maxBudget: Number(form.maxBudget),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Vendor</h2>

            <p className="text-sm text-slate-500 mt-1">
              Update vendor information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Vendor Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Field
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
            />

            <Field
              label="Area"
              name="area"
              value={form.area}
              onChange={handleChange}
            />

            <Field
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <Field
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
            />

            <Field
              label="Minimum Guests"
              name="minGuests"
              type="number"
              value={form.minGuests}
              onChange={handleChange}
              min="0"
            />

            <Field
              label="Maximum Guests"
              name="maxGuests"
              type="number"
              value={form.maxGuests}
              onChange={handleChange}
              min="0"
            />

            <Field
              label="Minimum Budget"
              name="minBudget"
              type="number"
              value={form.minBudget}
              onChange={handleChange}
              min="0"
            />

            <Field
              label="Maximum Budget"
              name="maxBudget"
              type="number"
              value={form.maxBudget}
              onChange={handleChange}
              min="0"
            />

            <Field
              label="Rating"
              name="rating"
              type="number"
              value={form.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
            />

            <Field
              label="Review Count"
              name="reviewCount"
              type="number"
              value={form.reviewCount}
              onChange={handleChange}
              min="0"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Status */}
          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
                className="w-4 h-4 accent-indigo-600"
              />
              Available
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4 accent-indigo-600"
              />
              Active
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   INPUT FIELD
========================================================= */

const Field = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  max,
  step,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label}
    </label>

    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      max={max}
      step={step}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
  </div>
);

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ active }) => (
  <span
    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
      active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ title, value }) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
    <p className="text-sm font-medium text-slate-500">{title}</p>

    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
  </div>
);

export default AdminVendorsPage;
