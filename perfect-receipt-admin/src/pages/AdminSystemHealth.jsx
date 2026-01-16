import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import {
    AlertCircle,
    Activity,
    TrendingUp,
    Users,
    CheckCircle,
    AlertTriangle,
    RefreshCw
} from "lucide-react";

const AdminSystemHealth = () => {
    const { hasPermission } = useAdmin();
    const [health, setHealth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        fetchSystemHealth();
        const interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchSystemHealth = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                ADMIN_API_PATHS.ANALYTICS.SYSTEM_HEALTH
            );
            setHealth(response.data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch system health");
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
                        <p className="text-gray-600 mt-1">Monitor platform performance and status</p>
                    </div>
                    <button
                        onClick={fetchSystemHealth}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>

                {/* Last Updated */}
                <div className="text-sm text-gray-600">
                    Last updated: {lastUpdated.toLocaleTimeString()}
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
                            <p className="text-gray-600">Loading system health...</p>
                        </div>
                    </div>
                ) : health ? (
                    <>
                        {/* Health Status Badge */}
                        <div className={`rounded-lg p-6 text-white ${
                            health.healthStatus === "good"
                                ? "bg-linear-to-r from-green-500 to-emerald-600"
                                : "bg-linear-to-r from-yellow-500 to-orange-600"
                        }`}>
                            <div className="flex items-center gap-3 mb-2">
                                {health.healthStatus === "good" ? (
                                    <CheckCircle size={32} />
                                ) : (
                                    <AlertTriangle size={32} />
                                )}
                                <div>
                                    <p className="text-2xl font-bold capitalize">{health.healthStatus} Health</p>
                                    <p className="text-sm opacity-90">System is operating {health.healthStatus}</p>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Failed Operations (30d)</h3>
                                    <AlertCircle className="text-red-600" size={24} />
                                </div>
                                <p className="text-4xl font-bold text-red-600 mb-2">
                                    {health.failedOperations?.reduce((sum, op) => sum + op.count, 0) || 0}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {health.failedOperations?.length || 0} different operation types
                                </p>

                                {health.failedOperations && health.failedOperations.length > 0 && (
                                    <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                                        {health.failedOperations.slice(0, 3).map((op, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{op._id}</span>
                                                <span className="font-semibold text-red-600">{op.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Permission Denied (30d)</h3>
                                    <AlertTriangle className="text-orange-600" size={24} />
                                </div>
                                <p className="text-4xl font-bold text-orange-600 mb-2">
                                    {health.permissionDenied || 0}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Unauthorized access attempts
                                </p>
                            </div>
                        </div>

                        {/* Top Actions */}
                        {health.topActions && health.topActions.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Admin Actions (30d)</h2>
                                <div className="space-y-4">
                                    {health.topActions.map((action, idx) => {
                                        const maxCount = Math.max(...health.topActions.map(a => a.count));
                                        const percentage = (action.count / maxCount) * 100;

                                        return (
                                            <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
                                                <div className="flex justify-between mb-2">
                                                    <p className="font-medium text-gray-900">{action._id.replace(/_/g, " ")}</p>
                                                    <span className="text-sm font-semibold text-blue-600">{action.count}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Active Admins */}
                        {health.activeAdmins && health.activeAdmins.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Most Active Admins (30d)</h2>
                                <div className="space-y-4">
                                    {health.activeAdmins.map((admin, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{admin.admin}</p>
                                                    <p className="text-xs text-gray-500">Administrator</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600">{admin.actionCount}</p>
                                                <p className="text-xs text-gray-500">actions</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* System Recommendations */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                <Activity className="text-blue-600 shrink-0 mt-1" size={24} />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">System Recommendations</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        {health.permissionDenied > 5 && (
                                            <li>🔒 High permission denial count detected. Review admin access controls.</li>
                                        )}
                                        {health.failedOperations && health.failedOperations.length > 0 && (
                                            <li>⚠️ Failed operations detected. Investigate system logs for errors.</li>
                                        )}
                                        {health.healthStatus === "good" && (
                                            <li>✅ System health is excellent. No immediate action required.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Period Information */}
                        <div className="text-sm text-gray-600 text-center">
                            <p>Metrics shown for: {health.period}</p>
                        </div>
                    </>
                ) : null}
            </div>
        </AdminLayout>
    );
};

export default AdminSystemHealth;