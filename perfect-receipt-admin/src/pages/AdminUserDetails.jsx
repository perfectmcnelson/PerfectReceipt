import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import {
    ArrowLeft,
    Mail,
    Phone,
    Building,
    MapPin,
    Calendar,
    AlertCircle,
    CheckCircle,
    FileText,
    CreditCard,
    Edit2,
    Trash2
} from "lucide-react";

const AdminUserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasPermission, isSuperAdmin } = useAdmin();
    const [user, setUser] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setIsLoading(true);
                const response = await axiosInstance.get(ADMIN_API_PATHS.USERS.GET_BY_ID(id));
                setUser(response.data.user);
                setSubscription(response.data.subscription);
                setStats(response.data.stats);
                setFormData(response.data.user);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch user details");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserDetails();
    }, [id]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            await axiosInstance.put(ADMIN_API_PATHS.USERS.EDIT(id), formData);
            setUser(formData);
            setIsEditing(false);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save user");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-6 flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading user details...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!user) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">User not found</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/users")}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* User Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">User Information</h2>
                            {hasPermission("userManagement", "edit") && (
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Edit2 size={18} />
                                    {isEditing ? "Cancel" : "Edit"}
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                    <input
                                        type="text"
                                        value={formData.businessName || ""}
                                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={formData.address || ""}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone || ""}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="verified"
                                        checked={formData.emailVerified}
                                        onChange={(e) => setFormData({...formData, emailVerified: e.target.checked})}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="verified" className="text-sm text-gray-700">Email Verified</label>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="text-gray-400" size={18} />
                                    <span className="text-gray-600">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="text-gray-400" size={18} />
                                    <span className="text-gray-600">{user.phone || "Not provided"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building className="text-gray-400" size={18} />
                                    <span className="text-gray-600">{user.businessName || "Not provided"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="text-gray-400" size={18} />
                                    <span className="text-gray-600">{user.address || "Not provided"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="text-gray-400" size={18} />
                                    <span className="text-gray-600">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.emailVerified ? (
                                        <CheckCircle className="text-green-600" size={18} />
                                    ) : (
                                        <AlertCircle className="text-yellow-600" size={18} />
                                    )}
                                    <span className={user.emailVerified ? "text-green-600" : "text-yellow-600"}>
                                        {user.emailVerified ? "Email Verified" : "Email Not Verified"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Activity</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">Invoices Created</span>
                                    <span className="font-bold text-lg">{stats?.invoices || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">Receipts Generated</span>
                                    <span className="font-bold text-lg">{stats?.receipts || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Subscription */}
                        {subscription && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard size={18} />
                                    Subscription
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 text-sm">Plan</span>
                                        <span className="font-bold capitalize">{subscription.plan}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 text-sm">Status</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            subscription.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}>
                                            {subscription.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminUserDetails;