import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import {
    CheckCircle,
    AlertCircle,
    XCircle,
    TrendingUp
} from "lucide-react";

const AdminPaymentHealth = () => {
    const { hasPermission } = useAdmin();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPaymentHealth();
    }, []);

    const fetchPaymentHealth = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                ADMIN_API_PATHS.ANALYTICS.PAYMENT_HEALTH
            );
            setAnalytics(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch payment health data");
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
                    <h1 className="text-3xl font-bold text-gray-900">Payment Health Monitor</h1>
                    <p className="text-gray-600 mt-1">Track payment success rates and transaction status</p>
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
                            <p className="text-gray-600">Loading payment health...</p>
                        </div>
                    </div>
                ) : analytics ? (
                    <>
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                                <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
                                <p className="text-4xl font-bold text-gray-900 mt-2">
                                    {analytics.successMetrics?.totalTransactions || 0}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                                <p className="text-gray-600 text-sm font-medium">Successful</p>
                                <p className="text-4xl font-bold text-green-600 mt-2">
                                    {analytics.successMetrics?.successfulTransactions || 0}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                                <p className="text-gray-600 text-sm font-medium">Failed</p>
                                <p className="text-4xl font-bold text-red-600 mt-2">
                                    {analytics.paymentStatus?.find(p => p._id === "failed")?.count || 0}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                                <p className="text-gray-600 text-sm font-medium">Abandoned</p>
                                <p className="text-4xl font-bold text-orange-600 mt-2">
                                    {analytics.successMetrics?.abandonedCount || 0}
                                </p>
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8">
                            <div className="text-center">
                                <p className="text-gray-600 font-medium mb-2">Payment Success Rate</p>
                                <p className="text-6xl font-bold text-green-600 mb-4">
                                    {analytics.successMetrics?.successRate || "0%"}
                                </p>
                                <div className="w-full bg-green-200 rounded-full h-3">
                                    <div
                                        className="bg-green-600 h-3 rounded-full transition-all"
                                        style={{
                                            width: analytics.successMetrics?.successRate
                                                ? analytics.successMetrics.successRate.replace('%', '')
                                                : "0"
                                        }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 mt-4">
                                    {analytics.successMetrics?.successfulTransactions} successful out of {analytics.successMetrics?.totalTransactions} total
                                </p>
                            </div>
                        </div>

                        {/* Payment Status Breakdown */}
                        {analytics.paymentStatus && analytics.paymentStatus.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Transaction Status</h2>
                                <div className="space-y-4">
                                    {analytics.paymentStatus.map((status, idx) => {
                                        const getIcon = (s) => {
                                            if (s === "success") return <CheckCircle className="text-green-600" size={24} />;
                                            if (s === "failed") return <XCircle className="text-red-600" size={24} />;
                                            if (s === "pending") return <AlertCircle className="text-yellow-600" size={24} />;
                                            return <AlertCircle className="text-gray-600" size={24} />;
                                        };

                                        const getColor = (s) => {
                                            if (s === "success") return "bg-green-100";
                                            if (s === "failed") return "bg-red-100";
                                            if (s === "pending") return "bg-yellow-100";
                                            return "bg-gray-100";
                                        };

                                        return (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-lg ${getColor(status._id)}`}>
                                                        {getIcon(status._id)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 capitalize">{status._id}</p>
                                                        <p className="text-xs text-gray-500">
                                                            ₦{status.totalAmount?.toLocaleString() || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {((status.count / (analytics.successMetrics?.totalTransactions || 1)) * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Failed Payments Trend */}
                        {analytics.failedPaymentsTrend && analytics.failedPaymentsTrend.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Failed Payments Trend</h2>
                                <div className="space-y-4">
                                    {analytics.failedPaymentsTrend.map((month, idx) => {
                                        const maxCount = Math.max(...analytics.failedPaymentsTrend.map(m => m.count));
                                        const percentage = (month.count / maxCount) * 100;
                                        const monthName = new Date(2024, month._id.month - 1).toLocaleString('default', { month: 'short' });

                                        return (
                                            <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
                                                <div className="flex justify-between mb-2">
                                                    <p className="font-medium text-gray-900">
                                                        {monthName} {month._id.year}
                                                    </p>
                                                    <span className="text-sm font-semibold text-red-600">{month.count} failed</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-red-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Health Status */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                                    <TrendingUp className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">System Health</h3>
                                    <p className="text-gray-700 mt-1">
                                        Payment system is operating at <strong>{analytics.successMetrics?.successRate || "0%"}</strong> success rate. 
                                        {parseFloat(analytics.successMetrics?.successRate || "0") >= 95 
                                            ? " System health is excellent." 
                                            : " Consider investigating failed transactions."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </AdminLayout>
    );
};

export default AdminPaymentHealth;