import React from "react";
import { Routes, Route } from "react-router-dom";

// Auth Pages
import AdminLogin from "../pages/AdminLogin";

// Dashboard & Main Pages
import AdminDashboard from "../pages/AdminDashboard";
import AdminLayout from "../pages/AdminLayout";

// User Management Pages
import AdminUsers from "../pages/AdminUsers";
import AdminUserDetails from "../pages/AdminUserDetails";
import AdminSuspendedUsers from "../pages/AdminSuspendedUsers";

// Analytics Pages
import AdminAnalytics from "../pages/AdminAnalytics";
import AdminUserGrowth from "../pages/AdminUserGrowth";
import AdminDocumentsAnalytics from "../pages/AdminDocumentsAnalytics";
import AdminRevenueAnalytics from "../pages/AdminRevenueAnalytics";
import AdminEngagementAnalytics from "../pages/AdminEngagementAnalytics";
import AdminPaymentHealth from "../pages/AdminPaymentHealth";

// Other Pages
import AdminPayments from "../pages/AdminPayments";
import AdminSubscriptions from "../pages/AdminSubscriptions";
import AdminActivityLogs from "../pages/AdminActivityLogs";
import AdminSystemHealth from "../pages/AdminSystemHealth";
import AdminSettings from "../pages/AdminSettings";

const AdminRoutes = () => {
    return (
        <Routes>
            {/* Login - No Layout */}
            <Route path="login" element={<AdminLogin />} />

            {/* Dashboard - With Layout */}
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* User Management Routes */}
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetails />} />
            <Route path="users/suspended" element={<AdminSuspendedUsers />} />
            {/* <Route path="users/details" element={<AdminUsers />} /> Fallback to users */}

            {/* Analytics Routes */}
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="analytics/user-growth" element={<AdminUserGrowth />} />
            <Route path="analytics/documents" element={<AdminDocumentsAnalytics />} />
            <Route path="analytics/revenue" element={<AdminRevenueAnalytics />} /> {/* Reuse main analytics */}
            <Route path="analytics/engagement" element={<AdminEngagementAnalytics />} />
            <Route path="analytics/payment-health" element={<AdminPaymentHealth />} />

            {/* Payment & Subscription Routes */}
            <Route path="payments" element={<AdminPayments />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />

            {/* System Routes */}
            <Route path="activity-logs" element={<AdminActivityLogs />} />
            <Route path="system-health" element={<AdminSystemHealth />} />
            <Route path="settings" element={<AdminSettings />} />

            {/* Catch-all - Redirect to dashboard */}
            <Route path="*" element={<AdminDashboard />} />
        </Routes>
    );
};

export default AdminRoutes;