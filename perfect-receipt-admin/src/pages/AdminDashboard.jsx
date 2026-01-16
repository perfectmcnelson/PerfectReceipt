import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import AdminLayout from "./AdminLayout";
import {
    Users,
    FileText,
    TrendingUp,
    CreditCard,
    BarChart3,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    CheckCircle,
    Clock
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, change, isPositive, color = "blue" }) => {
    const colorClasses = {
        blue: "border-blue-500 bg-blue-100 text-blue-600",
        green: "border-green-500 bg-green-100 text-green-600",
        purple: "border-purple-500 bg-purple-100 text-purple-600",
        orange: "border-orange-500 bg-orange-100 text-orange-600"
    };

    return (
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {change && (
                        <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {change}
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon size={28} />
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { isLoading: authLoading } = useAdmin();
    const [stats, setStats] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [systemHealth, setSystemHealth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboardData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            setError("");

            // Fetch all dashboard data in parallel
            const [overviewRes, logsRes, healthRes] = await Promise.all([
                axiosInstance.get(ADMIN_API_PATHS.DASHBOARD.OVERVIEW),
                axiosInstance.get(ADMIN_API_PATHS.ACTIVITY_LOGS.GET_ALL, {
                    params: { page: 1, limit: 5, sortBy: "createdAt", order: "desc" }
                }),
                axiosInstance.get(ADMIN_API_PATHS.ANALYTICS.SYSTEM_HEALTH)
            ]);

            setStats(overviewRes.data);
            setActivityLogs(logsRes.data.logs);
            setSystemHealth(healthRes.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load dashboard data");
            console.error("Dashboard error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
                    </div>
                    <button
                        onClick={loadDashboardData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <BarChart3 size={18} />
                        Refresh
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Key Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={Users}
                            label="Total Users"
                            value={stats.users?.total || 0}
                            change={`${stats.users?.verified || 0} verified`}
                            isPositive={true}
                            color="blue"
                        />
                        <StatCard
                            icon={FileText}
                            label="Total Invoices"
                            value={stats.documents?.invoices || 0}
                            change={`${stats.users?.unverified || 0} unverified`}
                            isPositive={stats.users?.unverified <= 10}
                            color="green"
                        />
                        <StatCard
                            icon={FileText}
                            label="Total Receipts"
                            value={stats.documents?.receipts || 0}
                            change="From invoices"
                            isPositive={true}
                            color="purple"
                        />
                        <StatCard
                            icon={CreditCard}
                            label="Total Revenue"
                            value={`₦${(stats.revenue?.total || 0).toLocaleString()}`}
                            change={`${stats.revenue?.currency || "NGN"}`}
                            isPositive={true}
                            color="orange"
                        />
                    </div>
                )}

                {/* Subscription Breakdown */}
                {stats?.subscriptions && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {Object.entries(stats.subscriptions).map(([plan, count]) => {
                            const planColors = {
                                free: "from-gray-500 to-gray-600",
                                premium: "from-blue-500 to-blue-600",
                                business: "from-purple-500 to-purple-600"
                            };

                            return (
                                <div key={plan} className={`bg-linear-to-br ${planColors[plan]} rounded-lg shadow p-6 text-white cursor-pointer hover:shadow-lg transition`}
                                    onClick={() => navigate("/subscriptions")}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold capitalize">{plan} Plan</h3>
                                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                            <TrendingUp size={24} />
                                        </div>
                                    </div>
                                    <p className="text-4xl font-bold">{count}</p>
                                    <p className="text-sm text-white text-opacity-90 mt-2">Active subscribers</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-blue-600" />
                            Recent Admin Activity
                        </h2>
                        <div className="space-y-4">
                            {activityLogs && activityLogs.length > 0 ? (
                                activityLogs.map((log, idx) => {
                                    const actionIcons = {
                                        "LOGIN": "🔓",
                                        "VIEW_USERS": "👁️",
                                        "EDIT_USER": "✏️",
                                        "DELETE_USER": "🗑️",
                                        "VIEW_ANALYTICS": "📊",
                                        "VIEW_PAYMENTS": "💳"
                                    };

                                    return (
                                        <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-lg">
                                                {actionIcons[log.action] || "📋"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {log.admin?.name} - {log.action.replace(/_/g, " ")}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(log.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-semibold shrink-0 ${
                                                log.status === "success"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                                {log.status}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No recent activity</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate("/activity-logs")}
                            className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
                        >
                            View All Activity →
                        </button>
                    </div>

                    {/* System Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <BarChart3 size={20} className="text-green-600" />
                            System Status
                        </h2>
                        <div className="space-y-4">
                            {/* Health Status */}
                            {systemHealth && (
                                <>
                                    <div className={`p-3 rounded-lg ${
                                        systemHealth.healthStatus === "good"
                                            ? "bg-green-50 border border-green-200"
                                            : "bg-yellow-50 border border-yellow-200"
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {systemHealth.healthStatus === "good" ? (
                                                <CheckCircle className="text-green-600" size={20} />
                                            ) : (
                                                <AlertCircle className="text-yellow-600" size={20} />
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900 capitalize">
                                                    {systemHealth.healthStatus} Health
                                                </p>
                                                <p className="text-xs text-gray-600">System is operating normally</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Failed Operations</span>
                                            <span className="font-semibold text-red-600">
                                                {systemHealth.failedOperations?.reduce((sum, op) => sum + op.count, 0) || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Permission Denied</span>
                                            <span className="font-semibold text-orange-600">
                                                {systemHealth.permissionDenied || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Active Admins</span>
                                            <span className="font-semibold text-blue-600">
                                                {systemHealth.activeAdmins?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={() => navigate("/system-health")}
                                className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition text-sm"
                            >
                                View Details →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-lg shadow p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate("/users")}
                            className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-medium transition text-left"
                        >
                            👥 View All Users
                        </button>
                        <button
                            onClick={() => navigate("/payments")}
                            className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-medium transition text-left"
                        >
                            💳 View Payments
                        </button>
                        <button
                            onClick={() => navigate("/analytics")}
                            className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-medium transition text-left"
                        >
                            📊 Analytics Report
                        </button>
                        <button
                            onClick={() => navigate("/analytics/revenue")}
                            className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-medium transition text-left"
                        >
                            💰 Revenue Analytics
                        </button>
                    </div>
                </div>

                {/* Last Updated */}
                <div className="text-center text-sm text-gray-500">
                    <p className="flex items-center justify-center gap-2">
                        <Clock size={16} />
                        Last updated: {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;