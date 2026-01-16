import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    Activity,
    Filter
} from "lucide-react";

const ACTION_ICONS = {
    "LOGIN": "🔓",
    "LOGOUT": "🔒",
    "VIEW_USERS": "👁️",
    "EDIT_USER": "✏️",
    "SUSPEND_USER": "🚫",
    "DELETE_USER": "🗑️",
    "VIEW_ANALYTICS": "📊",
    "VIEW_PAYMENTS": "💳",
    "EDIT_SUBSCRIPTION": "📝",
    "CANCEL_SUBSCRIPTION": "❌",
    "EXPORT_DATA": "📥",
    "ADMIN_LOGIN_FAILED": "⚠️",
    "PERMISSION_DENIED": "🛑",
    "SYSTEM_ERROR": "❌"
};

const AdminActivityLogs = () => {
    const { hasPermission } = useAdmin();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [action, setAction] = useState("");
    const [resource, setResource] = useState("");
    const [search, setSearch] = useState("");

    const actions = [
        "LOGIN", "LOGOUT", "VIEW_USERS", "EDIT_USER", "SUSPEND_USER", 
        "DELETE_USER", "VIEW_ANALYTICS", "VIEW_PAYMENTS", "EDIT_SUBSCRIPTION",
        "CANCEL_SUBSCRIPTION", "EXPORT_DATA", "ADMIN_LOGIN_FAILED", 
        "PERMISSION_DENIED", "SYSTEM_ERROR"
    ];

    const resources = ["User", "Subscription", "Invoice", "Receipt", "Admin", "Payment", "System"];

    const fetchActivityLogs = async (page = 1) => {
        try {
            setIsLoading(true);
            setError("");
            const response = await axiosInstance.get(ADMIN_API_PATHS.ACTIVITY_LOGS.GET_ALL, {
                params: {
                    page,
                    limit: 25,
                    action,
                    resource,
                    sortBy: "createdAt",
                    order: "desc"
                }
            });
            setLogs(response.data.logs);
            setTotalPages(response.data.pagination.pages);
            setCurrentPage(page);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch activity logs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivityLogs(1);
    }, [action, resource]);

    if (!hasPermission("userManagement", "view")) {
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
                    <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-gray-600 mt-1">Track all admin actions on the platform</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={20} className="text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                            <select
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Actions</option>
                                {actions.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Resource</label>
                            <select
                                value={resource}
                                onChange={(e) => setResource(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Resources</option>
                                {resources.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search admin..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Logs Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Admin</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Resource</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-gray-600">Loading logs...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No activity logs found
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="font-medium text-gray-900">{log.admin?.name || "Unknown"}</p>
                                                    <p className="text-xs text-gray-500">{log.admin?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">
                                                        {ACTION_ICONS[log.action] || "📋"}
                                                    </span>
                                                    <span className="font-medium text-gray-900 text-sm">
                                                        {log.action.replace(/_/g, " ")}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                    {log.resource}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {log.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {log.status === "success" ? (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle size={16} />
                                                        <span className="text-xs font-semibold">Success</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-red-600">
                                                        <AlertCircle size={16} />
                                                        <span className="text-xs font-semibold">Failed</span>
                                                    </div>
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
                            onClick={() => fetchActivityLogs(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => fetchActivityLogs(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Action Legend</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(ACTION_ICONS).slice(0, 8).map(([action, icon]) => (
                            <div key={action} className="flex items-center gap-2">
                                <span className="text-lg">{icon}</span>
                                <span className="text-xs text-gray-700">{action.replace(/_/g, " ")}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminActivityLogs;