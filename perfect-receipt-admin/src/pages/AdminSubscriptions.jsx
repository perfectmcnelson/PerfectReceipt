import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import { Search, ChevronLeft, ChevronRight, AlertCircle, Edit2, CheckCircle } from "lucide-react";

const AdminSubscriptions = () => {
    const { hasPermission } = useAdmin();
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [plan, setPlan] = useState("");
    const [status, setStatus] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ plan: "", status: "" });
    const [breakdown, setBreakdown] = useState({});

    const fetchSubscriptions = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(ADMIN_API_PATHS.SUBSCRIPTIONS.GET_ALL, {
                params: { page, limit: 20, plan, status }
            });
            setSubscriptions(response.data.subscriptions);
            setTotalPages(response.data.pagination.pages);
            setCurrentPage(page);
            setBreakdown(response.data.breakdown);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch subscriptions");
            setTimeout(() => setError(""), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions(1);
    }, [plan, status]);

    const handleEditSubscription = async (subscriptionId) => {
        try {
            setIsLoading(true);
            await axiosInstance.put(ADMIN_API_PATHS.SUBSCRIPTIONS.EDIT(subscriptionId), editForm);
            setSuccess("Subscription updated successfully");
            setEditingId(null);
            fetchSubscriptions(currentPage);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update subscription");
            setTimeout(() => setError(""), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasPermission("subscriptionManagement", "view")) {
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
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
                    <p className="text-gray-600 mt-1">Monitor and manage user subscriptions</p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle className="text-green-600" />
                        <p className="text-green-800">{success}</p>
                    </div>
                )}

                {/* Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(breakdown).map(([planName, count]) => (
                        <div key={planName} className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-medium capitalize">{planName} Subscriptions</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 flex gap-4 flex-wrap">
                    <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Plans</option>
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="business">Business</option>
                    </select>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                        <option value="past_due">Past Due</option>
                    </select>
                </div>

                {/* Subscriptions Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cycle</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Period</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : subscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No subscriptions found
                                        </td>
                                    </tr>
                                ) : (
                                    subscriptions.map((sub) => (
                                        <tr key={sub._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{sub.user?.email}</p>
                                                    <p className="text-xs text-gray-500">{sub.user?.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm capitalize font-medium text-gray-900">
                                                {editingId === sub._id ? (
                                                    <select
                                                        value={editForm.plan}
                                                        onChange={(e) => setEditForm({...editForm, plan: e.target.value})}
                                                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                                                    >
                                                        <option value="free">Free</option>
                                                        <option value="premium">Premium</option>
                                                        <option value="business">Business</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        sub.plan === "premium" ? "bg-green-100 text-green-800" :
                                                        sub.plan === "business" ? "bg-blue-100 text-blue-800" :
                                                        "bg-gray-100 text-gray-800"
                                                    }`}>
                                                        {sub.plan}
                                                    </span>
                                                )}
                                                {/* {sub.plan} */}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {editingId === sub._id ? (
                                                    <select
                                                        value={editForm.status}
                                                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="cancelled">Cancelled</option>
                                                        <option value="expired">Expired</option>
                                                        <option value="past_due">Past Due</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        sub.status === "active" ? "bg-green-100 text-green-800" :
                                                        sub.status === "cancelled" ? "bg-red-100 text-red-800" :
                                                        "bg-gray-100 text-gray-800"
                                                    }`}>
                                                        {sub.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm capitalize text-gray-600">{sub.billingCycle}</td>
                                            <td className="px-6 py-4 text-xs text-gray-600">
                                                {sub.currentPeriodStart && sub.currentPeriodEnd ? (
                                                    <div>
                                                        <p>{new Date(sub.currentPeriodStart).toLocaleDateString()}</p>
                                                        <p>to {new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
                                                    </div>
                                                ) : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {editingId === sub._id ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditSubscription(sub._id)}
                                                            disabled={isLoading}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-100"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(sub._id);
                                                            setEditForm({ plan: sub.plan, status: sub.status });
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition"
                                                    >
                                                        <Edit2 size={14} />
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <button
                            onClick={() => fetchSubscriptions(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => fetchSubscriptions(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSubscriptions;