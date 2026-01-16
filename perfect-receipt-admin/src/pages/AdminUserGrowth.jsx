import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import {
    TrendingUp,
    Users,
    CheckCircle,
    AlertCircle
} from "lucide-react";

const AdminUserGrowth = () => {
    const { hasPermission } = useAdmin();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [months, setMonths] = useState(12);

    useEffect(() => {
        fetchUserGrowth();
    }, [months]);

    const fetchUserGrowth = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                ADMIN_API_PATHS.ANALYTICS.USER_GROWTH,
                { params: { months } }
            );
            setAnalytics(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch user growth data");
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
                        <h1 className="text-3xl font-bold text-gray-900">User Growth Analytics</h1>
                        <p className="text-gray-600 mt-1">Track user acquisition and verification trends</p>
                    </div>
                    <select
                        value={months}
                        onChange={(e) => setMonths(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="3">Last 3 Months</option>
                        <option value="6">Last 6 Months</option>
                        <option value="12">Last 12 Months</option>
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
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading analytics...</p>
                        </div>
                    </div>
                ) : analytics ? (
                    <>
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total New Users</p>
                                        <p className="text-4xl font-bold text-gray-900 mt-2">
                                            {analytics.totalNewUsers || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Users size={32} className="text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Verified Users</p>
                                        <p className="text-4xl font-bold text-green-600 mt-2">
                                            {analytics.verifiedCount || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle size={32} className="text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Verification Rate</p>
                                        <p className="text-4xl font-bold text-purple-600 mt-2">
                                            {analytics.verificationRate || 0}%
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <TrendingUp size={32} className="text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Breakdown */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Signups</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Month</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Signups</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Visual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {analytics.monthlySignups && analytics.monthlySignups.length > 0 ? (
                                            analytics.monthlySignups.map((month, idx) => {
                                                const maxCount = Math.max(
                                                    ...analytics.monthlySignups.map(m => m.count)
                                                );
                                                const percentage = (month.count / maxCount) * 100;
                                                const monthName = new Date(2024, month._id.month - 1).toLocaleString('default', { month: 'long' });

                                                return (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-medium text-gray-900">
                                                            {monthName} {month._id.year}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-2xl font-bold text-blue-600">{month.count}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                                                    <div
                                                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Period Information */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-900">
                                <strong>Period:</strong> {new Date(analytics.period.startDate).toLocaleDateString()} to {new Date(analytics.period.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </>
                ) : null}
            </div>
        </AdminLayout>
    );
};

export default AdminUserGrowth;