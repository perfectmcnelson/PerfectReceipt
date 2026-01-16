import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import {
    Users,
    TrendingDown,
    AlertCircle,
    Eye,
    LogIn
} from "lucide-react";

const AdminEngagementAnalytics = () => {
    const { hasPermission } = useAdmin();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEngagementMetrics();
    }, []);

    const fetchEngagementMetrics = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                ADMIN_API_PATHS.ANALYTICS.ENGAGEMENT
            );
            setAnalytics(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch engagement metrics");
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasPermission("analyticsAccess", "view")) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">Access denied</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Engagement Metrics</h1>
                    <p className="text-gray-600 mt-1">Analyze user behavior and activity</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading metrics...</p>
                        </div>
                    </div>
                ) : analytics ? (
                    <>
                        {/* Auth Methods */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Authentication Methods</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {analytics.authMethods && analytics.authMethods.length > 0 ? (
                                    analytics.authMethods.map((method, idx) => (
                                        <div key={idx} className="p-6 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="font-semibold text-gray-900 capitalize">{method._id} Auth</p>
                                                <span className="text-3xl font-bold text-blue-600">{method.count}</span>
                                            </div>
                                            <div className="w-full bg-blue-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${(method.count / Math.max(...analytics.authMethods.map(m => m.count))) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 col-span-2">No data available</p>
                                )}
                            </div>
                        </div>

                        {/* Most Active Users */}
                        {analytics.mostActiveUsers && analytics.mostActiveUsers.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Active Users</h2>
                                <div className="space-y-4">
                                    {analytics.mostActiveUsers.slice(0, 10).map((user, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    #{idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{user.user}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {user.invoiceCount} invoices • ₦{user.totalAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600">{user.invoiceCount}</p>
                                                <p className="text-xs text-gray-500">invoices</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Inactive Users */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Users Without Invoices</p>
                                        <p className="text-4xl font-bold text-red-600 mt-2">
                                            {analytics.inactiveUsers?.withoutInvoices || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <Users size={32} className="text-red-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Never Logged In</p>
                                        <p className="text-4xl font-bold text-orange-600 mt-2">
                                            {analytics.inactiveUsers?.neverLoggedIn || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <LogIn size={32} className="text-orange-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Inactive (30+ days)</p>
                                        <p className="text-4xl font-bold text-yellow-600 mt-2">
                                            {analytics.inactiveUsers?.inactiveForMonth || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <TrendingDown size={32} className="text-yellow-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Engagement Summary */}
                        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Engagement Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {(analytics.inactiveUsers && (
                                            ((1 - (analytics.inactiveUsers.neverLoggedIn / (analytics.inactiveUsers.neverLoggedIn + analytics.inactiveUsers.withoutInvoices + analytics.inactiveUsers.inactiveForMonth + 100))) * 100)
                                        ).toFixed(1)) || "N/A"}%
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">Active Rate</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">High</p>
                                    <p className="text-xs text-gray-600 mt-1">Platform Usage</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">Positive</p>
                                    <p className="text-xs text-gray-600 mt-1">Trend</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-indigo-600">Good</p>
                                    <p className="text-xs text-gray-600 mt-1">Health Score</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </AdminLayout>
    );
};

export default AdminEngagementAnalytics;