import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import {
    TrendingUp,
    DollarSign,
    Users,
    AlertCircle,
    Calendar,
    PieChart
} from "lucide-react";

const AdminRevenueAnalytics = () => {
    const { hasPermission } = useAdmin();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

    useEffect(() => {
        fetchRevenueData();
    }, []);

    const fetchRevenueData = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                ADMIN_API_PATHS.ANALYTICS.REVENUE,
                { params: dateRange }
            );
            setAnalytics(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch revenue data");
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
                    <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
                    <p className="text-gray-600 mt-1">Track platform revenue and subscription metrics</p>
                </div>

                {/* Date Filter */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex gap-4 flex-wrap items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={fetchRevenueData}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            Apply Filter
                        </button>
                    </div>
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
                            <p className="text-gray-600">Loading revenue data...</p>
                        </div>
                    </div>
                ) : analytics ? (
                    <>
                        {/* Total Revenue Card */}
                        <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-lg shadow p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                                    <p className="text-5xl font-bold mt-2">
                                        ₦{(analytics.totalRevenue?.total || 0).toLocaleString()}
                                    </p>
                                    <p className="text-blue-100 text-sm mt-2">
                                        {analytics.totalRevenue?.count || 0} transactions
                                    </p>
                                </div>
                                <div className="p-4 bg-white bg-opacity-20 rounded-lg">
                                    <DollarSign size={48} />
                                </div>
                            </div>
                        </div>

                        {/* Revenue by Plan */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {analytics.revenueByPlan && analytics.revenueByPlan.length > 0 ? (
                                analytics.revenueByPlan.map((plan, idx) => {
                                    const colors = ["from-purple-500 to-purple-600", "from-green-500 to-green-600", "from-orange-500 to-orange-600"];
                                    return (
                                        <div key={idx} className={`bg-linear-to-br ${colors[idx]} rounded-lg shadow p-6 text-white`}>
                                            <p className="text-white text-opacity-90 text-sm font-medium mb-2 capitalize">
                                                {plan._id} Plan
                                            </p>
                                            <p className="text-3xl font-bold mb-4">
                                                ₦{plan.total.toLocaleString()}
                                            </p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>{plan.count} transactions</span>
                                                <span>Avg: ₦{Math.floor(plan.total / plan.count).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-3 text-center text-gray-500 p-8">No plan data available</div>
                            )}
                        </div>

                        {/* Revenue by Billing Cycle */}
                        {analytics.revenueByBillingCycle && analytics.revenueByBillingCycle.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <TrendingUp size={24} className="text-blue-600" />
                                    Revenue by Billing Cycle
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {analytics.revenueByBillingCycle.map((cycle, idx) => {
                                        const maxTotal = Math.max(...analytics.revenueByBillingCycle.map(c => c.total));
                                        const percentage = (cycle.total / maxTotal) * 100;

                                        return (
                                            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex justify-between items-center mb-3">
                                                    <p className="font-medium text-gray-900 capitalize">{cycle._id}</p>
                                                    <span className="text-2xl font-bold text-blue-600">
                                                        ₦{cycle.total.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                    <span>{cycle.count} transactions</span>
                                                    <span>{percentage.toFixed(1)}% of total</span>
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

                        {/* Active Subscriptions MRR */}
                        {analytics.activeSubscriptions && analytics.activeSubscriptions.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <Users size={24} className="text-green-600" />
                                    Active Subscriptions & MRR
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {analytics.activeSubscriptions.map((sub, idx) => {
                                        const mrrPercentage = sub.totalMRR > 0 ? 
                                            ((sub.totalMRR / analytics.activeSubscriptions.reduce((sum, s) => sum + s.totalMRR, 0)) * 100).toFixed(1) 
                                            : 0;

                                        return (
                                            <div key={idx} className="p-6 bg-linear-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1 capitalize">{sub._id} Plan</p>
                                                        <p className="text-3xl font-bold text-gray-900">{sub.count}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Active subscribers</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600 mb-1">Monthly Recurring</p>
                                                        <p className="text-2xl font-bold text-green-600">₦{sub.totalMRR.toLocaleString()}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{mrrPercentage}% of total MRR</p>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-green-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${mrrPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-900">
                                        <strong>Total MRR:</strong> ₦{analytics.activeSubscriptions.reduce((sum, sub) => sum + sub.totalMRR, 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Churn Metrics */}
                        {analytics.churnMetrics && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                                    <p className="text-gray-600 text-sm font-medium">Churn Rate</p>
                                    <p className="text-4xl font-bold text-orange-600 mt-2">
                                        {analytics.churnMetrics.churnRate}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {analytics.churnMetrics.cancelledCount} of {analytics.churnMetrics.totalSubscriptions} cancelled
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                                    <p className="text-gray-600 text-sm font-medium">Cancelled Subscriptions</p>
                                    <p className="text-4xl font-bold text-red-600 mt-2">
                                        {analytics.churnMetrics.cancelledCount}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Total: {analytics.churnMetrics.totalSubscriptions}
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                                    <p className="text-gray-600 text-sm font-medium">Retention Rate</p>
                                    <p className="text-4xl font-bold text-green-600 mt-2">
                                        {(100 - parseFloat(analytics.churnMetrics.churnRate)).toFixed(2)}%
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">Active subscriptions</p>
                                </div>
                            </div>
                        )}

                        {/* Revenue Summary */}
                        <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <PieChart size={20} className="text-green-600" />
                                Revenue Summary
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {analytics.totalRevenue?.count || 0}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">Total Transactions</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">
                                        {analytics.revenueByPlan?.length || 0}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">Plans Generating Revenue</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">
                                        ₦{analytics.activeSubscriptions?.reduce((sum, sub) => sum + sub.totalMRR, 0).toLocaleString() || 0}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">Monthly Recurring</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-orange-600">
                                        {analytics.churnMetrics?.churnRate || "0%"}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">Churn Rate</p>
                                </div>
                            </div>
                        </div>

                        {/* Period Information */}
                        <div className="text-sm text-gray-600 text-center">
                            <p>Period: {dateRange.startDate ? new Date(dateRange.startDate).toLocaleDateString() : "All Time"} 
                               {dateRange.endDate ? ` to ${new Date(dateRange.endDate).toLocaleDateString()}` : ""}</p>
                        </div>
                    </>
                ) : null}
            </div>
        </AdminLayout>
    );
};

export default AdminRevenueAnalytics;