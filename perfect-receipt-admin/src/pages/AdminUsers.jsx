import React, { useState, useEffect } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Trash2,
    Eye,
    MoreVertical,
    AlertCircle,
    CheckCircle,
    Filter,
    Download
} from "lucide-react";

const AdminUsers = () => {
    const { hasPermission, isSuperAdmin } = useAdmin();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(20);

    // Filters
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [order, setOrder] = useState("desc");

    // Modals
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Edit form
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        businessName: "",
        address: "",
        phone: "",
        emailVerified: false
    });

    const [sub, setSub] = useState({
        plan: "",
        status: ""
    });

    // Fetch users
    const fetchUsers = async (page = 1) => {
        try {
            setIsLoading(true);
            setError("");
            const response = await axiosInstance.get(ADMIN_API_PATHS.USERS.GET_ALL, {
                params: {
                    page,
                    limit,
                    search,
                    status,
                    sortBy,
                    order
                }
            });
            setUsers(response.data.users);
            setTotalPages(response.data.pagination.pages);
            setCurrentPage(page);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubscription = async (userId) => {
        const res = await axiosInstance.get(ADMIN_API_PATHS.SUBSCRIPTIONS.GET_BY_USER_ID(userId));

        setSub({
            plan: res.data.plan,
            status: res.data.status
        });
    };


    useEffect(() => {
        fetchUsers(1);
    }, [search, status, sortBy, order, limit]);

    // Open edit modal
    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            businessName: user.businessName || "",
            address: user.address || "",
            phone: user.phone || "",
            emailVerified: user.emailVerified
        });
        fetchSubscription(user._id);
        setShowEditModal(true);
    };

    // Save user changes
    const handleSaveUser = async () => {
        try {
            setIsLoading(true);
            await axiosInstance.put(ADMIN_API_PATHS.USERS.EDIT(editingUser._id), editForm);
            await axiosInstance.put(ADMIN_API_PATHS.SUBSCRIPTIONS.UPDATE_BY_USER_ID(editingUser._id), sub);
            setSuccess("User updated successfully");
            setShowEditModal(false);
            fetchUsers(currentPage);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update user");
        } finally {
            setIsLoading(false);
        }
    };

    // Suspend user
    const handleSuspendUser = async (userId) => {
        try {
            setIsLoading(true);
            await axiosInstance.post(ADMIN_API_PATHS.USERS.SUSPEND(userId));
            setSuccess("User suspended successfully");
            fetchUsers(currentPage);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to suspend user");
        } finally {
            setIsLoading(false);
        }
    };

    // Activate user
    const handleActivateUser = async (userId) => {
        try {
            setIsLoading(true);
            await axiosInstance.post(ADMIN_API_PATHS.USERS.ACTIVATE(userId));
            setSuccess("User activated successfully");
            fetchUsers(currentPage);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to activate user");
        } finally {
            setIsLoading(false);
        }
    };

    // Delete user
    const handleDeleteUser = async () => {
        if (!isSuperAdmin()) {
            setError("Only super admins can delete users");
            return;
        }

        try {
            setIsLoading(true);
            await axiosInstance.delete(ADMIN_API_PATHS.USERS.DELETE(selectedUser._id));
            setSuccess("User deleted successfully");
            setShowDeleteModal(false);
            fetchUsers(currentPage);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete user");
        } finally {
            setIsLoading(false);
        }
    };

    // Export users
    const handleExportUsers = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(ADMIN_API_PATHS.EXPORT.USERS);
            
            // Create a blob from the response
            const jsonString = JSON.stringify(response.data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            setSuccess("Users exported successfully");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to export users");
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasPermission("userManagement", "view")) {
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

    useEffect(() => {
        const handleClickOutside = () => {
            // if (activeDropdown !== null) {
            //     setActiveDropdown(null);
            // }
            setActiveDropdown(null);

        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [activeDropdown])

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-1">Manage and view all platform users</p>
                    </div>
                    {isSuperAdmin() && (
                        <button
                            onClick={handleExportUsers}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            <Download size={18} />
                            Export Users
                        </button>
                    )}
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600 shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle className="text-green-600 shrink-0" />
                        <p className="text-green-800">{success}</p>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Search */}
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Users</option>
                            <option value="suspended">Suspended</option>
                            <option value="active">Active</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="createdAt">Date Created</option>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                        </select>

                        {/* Limit */}
                        <select
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Business Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-gray-600">Loading users...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-600 font-bold text-sm">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.businessName || "-"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.suspended ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Suspended</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Active</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="">
                                                    <button
                                                        onClick={(e) => {e.stopPropagation(); setActiveDropdown(activeDropdown === user._id ? null : user._id);}}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {activeDropdown === user._id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                                            <button
                                                                onClick={() => {
                                                                    openEditModal(user);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700 transition"
                                                            >
                                                                <Edit2 size={16} />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (user.suspended) {
                                                                        handleActivateUser(user._id);
                                                                    } else {
                                                                        handleSuspendUser(user._id);
                                                                    }
                                                                    setActiveDropdown(null);
                                                                }}
                                                                disabled={isLoading}
                                                                className="w-full text-left px-4 py-2 hover:bg-orange-100 flex items-center gap-2 text-orange-700 transition disabled:opacity-50"
                                                            >
                                                                <AlertCircle size={16} />
                                                                {user.suspended ? "Activate" : "Suspend"}
                                                            </button>
                                                            {isSuperAdmin() && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setShowDeleteModal(true);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 hover:bg-red-100 flex items-center gap-2 text-red-700 transition border-t border-gray-200"
                                                                >
                                                                    <Trash2 size={16} />
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-3 md:px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <button
                            onClick={() => fetchUsers(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="flex items-center max-sm:text-sm gap-1 md:gap-2 px-1 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>
                        <span className="text-xs md:text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => fetchUsers(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                            className="flex items-center max-sm:text-sm gap-1 md:gap-2 px-1 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Edit Modal */}
                {showEditModal && editingUser && (
                    <div className="fixed inset-0 bg-black/70 backdrop-opacity-80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[calc(100vh-4rem)] flex flex-col overflow-auto">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                    <input
                                        type="text"
                                        value={editForm.businessName}
                                        onChange={(e) => setEditForm({...editForm, businessName: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                                    <select
                                        value={sub.plan}
                                        onChange={(e) => setSub({...sub, plan: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Plan</option>
                                        <option value="free">Free</option>
                                        <option value="premium">Premium</option>
                                        <option value="business">Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Status</label>
                                    <select
                                        value={sub.status}
                                        onChange={(e) => setSub({...sub, status: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="active">Active</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="expired">Expired</option>
                                        <option value="past_due">Past Due</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="verified"
                                        checked={editForm.emailVerified}
                                        onChange={(e) => setEditForm({...editForm, emailVerified: e.target.checked})}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="verified" className="text-sm text-gray-700">Mark as verified</label>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveUser}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {isLoading ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && selectedUser && isSuperAdmin() && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-red-600">Delete User</h2>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-700">
                                    Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action cannot be undone and will delete all associated data.
                                </p>
                            </div>
                            <div className="p-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    {isLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;