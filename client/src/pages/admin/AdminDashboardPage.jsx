import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CalendarDays,
  Store,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserCog,
  Activity,
  RefreshCw,
} from "lucide-react";

import { fetchAdminStats } from "../../services/adminService";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchAdminStats();
      setStats(data.stats);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load admin statistics.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      description: "Registered users",
      link: "/admin/users",
    },
    {
      title: "Total Events",
      value: stats?.totalEvents ?? 0,
      icon: CalendarDays,
      description: "Events created",
      link: "/admin/events",
    },
    {
      title: "Total Vendors",
      value: stats?.totalVendors ?? 0,
      icon: Store,
      description: `${stats?.activeVendors ?? 0} active vendors`,
      link: "/admin/vendors",
    },
    {
      title: "AI Plans",
      value: stats?.totalAIPlans ?? 0,
      icon: Sparkles,
      description: "Generated event plans",
      link: "/admin/ai-plans",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <ShieldCheck className="text-indigo-600" size={26} />
              </div>

              <div>
                <p className="text-sm font-semibold text-indigo-600">
                  EVENTWISE ADMIN
                </p>

                <h1 className="text-3xl font-bold text-slate-900">
                  Admin Dashboard
                </h1>
              </div>
            </div>

            <p className="text-slate-500 mt-3">
              Monitor users, events, vendors and AI activity from one place.
            </p>
          </div>

          <button
            onClick={loadStats}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.link}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {loading ? "—" : card.value}
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Icon size={22} className="text-indigo-600" />
                  </div>
                </div>

                <p className="text-sm text-slate-500 mt-4">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AdminSection
            icon={UserCog}
            title="User Management"
            description="View registered users and administrator accounts."
            to="/admin/users"
          />

          <AdminSection
            icon={CalendarDays}
            title="Event Management"
            description="Monitor events created across EventWise."
            to="/admin/events"
          />

          <AdminSection
            icon={Store}
            title="Vendor Management"
            description="Review vendors and their availability."
            to="/admin/vendors"
          />

          <AdminSection
            icon={Sparkles}
            title="AI Plan Monitoring"
            description="Review generated AI event plans."
            to="/admin/ai-plans"
          />
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Activity size={21} className="text-emerald-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                System Overview
              </h2>

              <p className="text-sm text-slate-500">
                Current EventWise platform statistics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatusItem
              label="Administrators"
              value={stats?.totalAdmins ?? 0}
            />

            <StatusItem
              label="Active Vendors"
              value={stats?.activeVendors ?? 0}
            />

            <StatusItem
              label="AI Plans Generated"
              value={stats?.totalAIPlans ?? 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminSection = ({ icon: Icon, title, description, to }) => {
  return (
    <Link
      to={to}
      className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Icon size={21} className="text-indigo-600" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>

            <p className="text-sm text-slate-500 mt-1">{description}</p>
          </div>
        </div>

        <ArrowRight
          size={19}
          className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
        />
      </div>
    </Link>
  );
};

const StatusItem = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
};

export default AdminDashboardPage;
