import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  LogIn,
  Wallet,
  CheckSquare,
  Store,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ------------------------------------------------------------
  // Detect currently opened event
  // ------------------------------------------------------------

  const eventMatch = location.pathname.match(/^\/events\/([^/]+)/);

  const eventId = eventMatch && eventMatch[1] !== "new" ? eventMatch[1] : null;

  // ------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // ------------------------------------------------------------
  // Navigation styles
  // ------------------------------------------------------------

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 gap-4">
          {/* ==================================================
              BRAND
          ================================================== */}

          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">
                  EventWise
                </span>

                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  AI Planner
                </span>
              </div>
            </div>
          </Link>

          {/* ==================================================
              NAVIGATION
          ================================================== */}

          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
            {/* Overview */}
            <NavLink to="/" className={navLinkClass}>
              Overview
            </NavLink>

            {isAuthenticated ? (
              <>
                {/* Dashboard */}
                <NavLink to="/dashboard" className={navLinkClass}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </NavLink>

                {/* Admin */}
                {currentUser?.role === "admin" && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <ShieldCheck size={16} />
                    <span>Admin</span>
                  </NavLink>
                )}

                {/* ==================================================
                    EVENT-SPECIFIC NAVIGATION
                ================================================== */}

                {eventId && (
                  <>
                    <NavLink
                      to={`/events/${eventId}/ai-plan`}
                      className={navLinkClass}
                    >
                      <Sparkles size={16} />
                      <span>AI Plan</span>
                    </NavLink>

                    <NavLink
                      to={`/events/${eventId}/budget`}
                      className={navLinkClass}
                    >
                      <Wallet size={16} />
                      <span>Budget</span>
                    </NavLink>

                    <NavLink
                      to={`/events/${eventId}/timeline`}
                      className={navLinkClass}
                    >
                      <CheckSquare size={16} />
                      <span>Timeline</span>
                    </NavLink>

                    <NavLink
                      to={`/events/${eventId}/vendors`}
                      className={navLinkClass}
                    >
                      <Store size={16} />
                      <span>Vendors</span>
                    </NavLink>

                    <NavLink to={`/events/${eventId}`} className={navLinkClass}>
                      <CalendarDays size={16} />
                      <span>Event</span>
                    </NavLink>
                  </>
                )}

                {/* ==================================================
                    USER
                ================================================== */}

                <div className="hidden xl:flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <span className="max-w-[140px] truncate text-sm font-medium text-slate-700">
                    {currentUser?.name || "User"}
                  </span>
                </div>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 whitespace-nowrap transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login */}
                <NavLink to="/login" className={navLinkClass}>
                  <LogIn size={16} />
                  <span>Login</span>
                </NavLink>

                {/* Register */}
                <NavLink
                  to="/register"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white whitespace-nowrap shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
