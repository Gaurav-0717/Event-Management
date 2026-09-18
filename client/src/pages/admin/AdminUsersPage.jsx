import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  User,
  RefreshCw,
  UserPlus,
  UserMinus,
  Trash2,
} from "lucide-react";

import {
  fetchAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
} from "../../services/adminService";

import { useAuth } from "../../context/AuthContext";

const AdminUsersPage = () => {
  const { currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchAdminUsers();

      setUsers(data.users || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";

    const action =
      newRole === "admin"
        ? "promote this user to administrator"
        : "demote this administrator to regular user";

    const confirmed = window.confirm(`Are you sure you want to ${action}?`);

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`role-${user._id}`);

      setError("");

      await updateAdminUserRole(user._id, newRole);

      await loadUsers();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update user role.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name || "this user"} permanently?\n\nThis will also delete the user's events, AI plans and timeline tasks.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`delete-${user._id}`);

      setError("");

      await deleteAdminUser(user._id);

      await loadUsers();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete user.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const adminCount = users.filter((user) => user.role === "admin").length;

  const regularUserCount = users.filter((user) => user.role !== "admin").length;

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
                <Users size={25} className="text-indigo-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-indigo-600">ADMIN</p>

                <h1 className="text-3xl font-bold text-slate-900">
                  User Management
                </h1>

                <p className="text-slate-500 mt-1">
                  Manage registered EventWise users and administrators.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadUsers}
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
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <StatCard title="Total Users" value={users.length} icon={Users} />

          <StatCard
            title="Administrators"
            value={adminCount}
            icon={ShieldCheck}
          />

          <StatCard
            title="Regular Users"
            value={regularUserCount}
            icon={User}
          />
        </div>

        {/* Users */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Registered Users
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {loading
                ? "Loading users..."
                : `${users.length} registered user${
                    users.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-9 h-9 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

              <p className="text-slate-500 mt-4">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={42} className="text-slate-300 mx-auto" />

              <p className="text-slate-600 mt-4">No users found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {users.map((user) => {
                const userId = user._id || user.id;

                const isCurrentUser =
                  String(userId) ===
                  String(currentUser?._id || currentUser?.id);

                const roleActionLoading = actionLoading === `role-${userId}`;

                const deleteActionLoading =
                  actionLoading === `delete-${userId}`;

                return (
                  <div
                    key={userId}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      {/* User information */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-indigo-700">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {user.name}
                            </h3>

                            {isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                                You
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-slate-500 mt-1 truncate">
                            {user.email}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            Joined{" "}
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "en-IN",
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Role + actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                            <ShieldCheck size={15} />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                            <User size={15} />
                            User
                          </span>
                        )}

                        {!isCurrentUser && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRoleChange(user)}
                              disabled={
                                roleActionLoading || deleteActionLoading
                              }
                              className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                user.role === "admin"
                                  ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              }`}
                            >
                              {roleActionLoading ? (
                                <RefreshCw size={15} className="animate-spin" />
                              ) : user.role === "admin" ? (
                                <UserMinus size={15} />
                              ) : (
                                <UserPlus size={15} />
                              )}

                              {user.role === "admin" ? "Demote" : "Make Admin"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              disabled={
                                roleActionLoading || deleteActionLoading
                              }
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {deleteActionLoading ? (
                                <RefreshCw size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                              Delete
                            </button>
                          </>
                        )}
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

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>

        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Icon size={22} className="text-indigo-600" />
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
