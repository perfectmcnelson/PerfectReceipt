import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import { TrendingUp, Users, FileText, BarChart3, AlertCircle } from "lucide-react";

const AnalyticsCard = ({ title, value, icon: Icon, trend, description }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon size={24} className="text-blue-600" />
                </div>
            </div>
            {trend && (
                <p className={`text-sm font-semibold ${trend.positive ? "text-green-600" : "text-red-600"}`}>
                    {trend.positive ? "↑" : "↓"} {trend.value}
                </p>
            )}
        </div>
    );
};

const AdminAnalytics = () => {
    const { hasPermission } = useAdmin();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [dateRange, setDateRange] = useState("month");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setIsLoading(true);
                const response = await axiosInstance.get(ADMIN_API_PATHS.ANALYTICS.REVENUE);
                setAnalytics(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch analytics");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (!hasPermission("analyticsAccess", "view")) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">You don't have permission to access this page</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-gray-600 mt-1">Detailed business insights and metrics</p>
                    </div>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading analytics...</p>
                        </div>
                    </div>
                ) : analytics ? (
                    <>
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <AnalyticsCard
                                title="Total Revenue"
                                value={`₦${(analytics.totalRevenue?.total || 0).toLocaleString()}`}
                                icon={TrendingUp}
                                description={`${analytics.totalRevenue?.count || 0} transactions`}
                            />
                            <AnalyticsCard
                                title="Active Subscriptions"
                                value={analytics.activeSubscriptions?.reduce((sum, sub) => sum + sub.count, 0) || 0}
                                icon={Users}
                                description="Current subscribers"
                            />
                            <AnalyticsCard
                                title="Churn Rate"
                                value={analytics.churnMetrics?.churnRate || "0%"}
                                icon={BarChart3}
                                description={`${analytics.churnMetrics?.cancelledCount || 0} cancellations`}
                                trend={{ value: analytics.churnMetrics?.churnRate || "0%", positive: false }}
                            />
                            <AnalyticsCard
                                title="Payment Success Rate"
                                value={analytics.successMetrics?.successRate || "0%"}
                                icon={FileText}
                                description={`${analytics.successMetrics?.successfulTransactions || 0} successful`}
                            />
                        </div>

                        {/* Revenue by Plan */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Plan</h2>
                                <div className="space-y-4">
                                    {analytics.revenueByPlan?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0">
                                            <div>
                                                <p className="font-medium text-gray-900 capitalize">{item._id} Plan</p>
                                                <p className="text-xs text-gray-500">{item.count} transactions</p>
                                            </div>
                                            <p className="font-bold text-gray-900">₦{item.total.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Subscriptions</h2>
                                <div className="space-y-4">
                                    {analytics.activeSubscriptions?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0">
                                            <div>
                                                <p className="font-medium text-gray-900 capitalize">{item._id} Plan</p>
                                                <p className="text-xs text-gray-500">MRR: ₦{item.totalMRR.toLocaleString()}</p>
                                            </div>
                                            <p className="font-bold text-gray-900">{item.count}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;