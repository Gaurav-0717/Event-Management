import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminRoute from "./components/AdminRoute";

import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminVendorsPage from "./pages/admin/AdminVendorsPage";
import AdminAIPlansPage from "./pages/admin/AdminAIPlansPage";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CreateEventPage from "./pages/CreateEventPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import EditEventPage from "./pages/EditEventPage";

import AIPlanPage from "./pages/AIPlanPage";
import BudgetPage from "./pages/BudgetPage";
import TimelinePage from "./pages/TimelinePage";
import VendorMatchingPage from "./pages/VendorMatchingPage";

import NotFoundPage from "./pages/NotFoundPage";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* =====================================================
            Home
        ====================================================== */}
        <Route index element={<HomePage />} />

        {/* =====================================================
            Public-only routes
        ====================================================== */}
        <Route
          path="login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        <Route
          path="register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* =====================================================
            Dashboard
        ====================================================== */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            Create Event
        ====================================================== */}
        <Route
          path="events/new"
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            Event Overview
        ====================================================== */}
        <Route
          path="events/:id"
          element={
            <ProtectedRoute>
              <EventDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            Edit Event
        ====================================================== */}
        <Route
          path="events/:id/edit"
          element={
            <ProtectedRoute>
              <EditEventPage />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            AI Event Plan
        ====================================================== */}
        <Route
          path="events/:id/ai-plan"
          element={
            <ProtectedRoute>
              <AIPlanPage />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            Budget Optimization
        ====================================================== */}
        <Route
          path="events/:id/budget"
          element={
            <ProtectedRoute>
              <BudgetPage />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            Timeline & Checklist
        ====================================================== */}
        <Route
          path="events/:id/timeline"
          element={
            <ProtectedRoute>
              <TimelinePage />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            AI Vendor Matching
        ====================================================== */}
        <Route
          path="events/:id/vendors"
          element={
            <ProtectedRoute>
              <VendorMatchingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />

        <Route
          path="admin/events"
          element={
            <AdminRoute>
              <AdminEventsPage />
            </AdminRoute>
          }
        />

        <Route
          path="admin/vendors"
          element={
            <AdminRoute>
              <AdminVendorsPage />
            </AdminRoute>
          }
        />

        <Route
          path="admin/ai-plans"
          element={
            <AdminRoute>
              <AdminAIPlansPage />
            </AdminRoute>
          }
        />

        {/* =====================================================
            404
        ====================================================== */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
