import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import {
    Settings,
    AlertCircle,
    CheckCircle,
    Save,
    Bell,
    Lock,
    Shield,
    Database,
    Mail,
    Eye,
    EyeOff
} from "lucide-react";
import ADMIN_API_PATHS from "../utils/adminApiPaths";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const AdminSettings = () => {
    const { admin, isSuperAdmin, setAdmin } = useAdmin();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPrevPassword, setShowPrevPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [adminProfile, setAdminProfile] = useState({
        name: admin?.name || "",
        email: admin?.email || ""
    });
    const [editProfile, setEditProfile] = useState(false);

    const [settings, setSettings] = useState({
        notifications: {
            emailNotifications: true,
            activityAlerts: true,
            systemAlerts: true,
            weeklyReport: false
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            ipWhitelist: []
        },
        display: {
            itemsPerPage: 20,
            theme: "light",
            timezone: "UTC"
        }
    });

    const [changePassword, setChangePassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (admin) {
            setAdminProfile({
                name: admin.name || "",
                email: admin.email || ""
            });
        }
    }, [admin]);

    // const handleSettingsChange = (section, key, value) => {
    //     setSettings(prev => ({
    //         ...prev,
    //         [section]: {
    //             ...prev[section],
    //             [key]: value
    //         }
    //     }));
    // };

    // const handleSaveSettings = async () => {
    //     try {
    //         setIsLoading(true);
    //         // Save to backend - endpoint would be: PATCH /api/admin/settings
    //         setSuccess("Settings saved successfully");
    //         setTimeout(() => setSuccess(""), 3000);
    //     } catch (err) {
    //         setError("Failed to save settings");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handlePasswordChange = async () => {
        if (!changePassword.currentPassword || !changePassword.newPassword || !changePassword.confirmPassword) {
            setError("All fields are required");
            toast.error("All fields are required");
            setTimeout(() => setError(""), 3000);
            return;
        }

        if (changePassword.newPassword !== changePassword.confirmPassword) {
            setError("Passwords don't match");
            toast.error("Passwords don't match");
            setTimeout(() => setError(""), 3000);
            return;
        }

        if (changePassword.newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            toast.error("Password must be at least 8 characters");
            setTimeout(() => setError(""), 3000);
            return;
        }

        try {
            setIsLoading(true);
            // Change password endpoint would be: PUT /api/admin/change-password
            await axiosInstance.put(ADMIN_API_PATHS.AUTH.CHANGE_PASSWORD, {
                currentPassword: changePassword.currentPassword,
                newPassword: changePassword.newPassword
            });
            setSuccess("Password changed successfully");
            toast.success("Password changed successfully");
            setChangePassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to change password");
            toast.error(err.response?.data?.message || "Failed to change password");
            setTimeout(() => setError(""), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setIsLoading(true);
            // Update profile endpoint would be: PATCH /api/admin/me
            await axiosInstance.patch(ADMIN_API_PATHS.AUTH.UPDATE_PROFILE, {
                name: adminProfile.name,
                email: adminProfile.email
            });
            setAdmin({...admin,
                name: adminProfile.name,
                email: adminProfile.email
            });
            setSuccess("Profile updated successfully");
            toast.success("Profile updated successfully");
            setTimeout(() => setSuccess(""), 3000);

            setEditProfile(false);
            setAdminProfile(prev => ({
                ...prev,
                name: adminProfile.name,
                email: adminProfile.email
            }));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
            toast.error(err.response?.data?.message || "Failed to update profile");
            setTimeout(() => setError(""), 3000);

            setAdminProfile(prev => ({
                ...prev,
                name: admin?.name || "",
                email: admin?.email || ""
            }));
        } finally {
            setIsLoading(false);
        }
    };

    
    

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your admin account preferences</p>
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

                {/* Admin Profile Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield size={20} />
                            Admin Profile
                        </h2>

                        {editProfile ? (
                            <div className="space-y-4 mb-4">
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setEditProfile(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={isLoading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setEditProfile(true)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition cursor-pointer"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        )}

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Name</p>
                            {
                                editProfile ? (
                                    <input
                                        type="text"
                                        value={adminProfile.name}
                                        onChange={(e) => setAdminProfile({...adminProfile, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-gray-900">{admin?.name}</p>
                                )
                            }
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Email</p>
                            {
                                editProfile ? (
                                    <input
                                        type="email"
                                        value={adminProfile.email}
                                        onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-gray-900">{admin?.email}</p>
                                )
                            }
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Role</p>
                            <p className="text-lg font-medium text-gray-900 capitalize">{admin?.role}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                admin?.active 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                            }`}>
                                {admin?.active ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                {/* <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell size={20} />
                        Notifications
                    </h2>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifications.emailNotifications}
                                onChange={(e) => handleSettingsChange("notifications", "emailNotifications", e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Email Notifications</p>
                                <p className="text-sm text-gray-600">Receive email updates on important events</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifications.activityAlerts}
                                onChange={(e) => handleSettingsChange("notifications", "activityAlerts", e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Activity Alerts</p>
                                <p className="text-sm text-gray-600">Get notified of user activities and changes</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifications.systemAlerts}
                                onChange={(e) => handleSettingsChange("notifications", "systemAlerts", e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">System Alerts</p>
                                <p className="text-sm text-gray-600">Critical system notifications only</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifications.weeklyReport}
                                onChange={(e) => handleSettingsChange("notifications", "weeklyReport", e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Weekly Report</p>
                                <p className="text-sm text-gray-600">Receive weekly platform analytics report</p>
                            </div>
                        </label>
                    </div>
                </div> */}

                {/* Display Settings */}
                {/* <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings size={20} />
                        Display Preferences
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Items Per Page</label>
                            <select
                                value={settings.display.itemsPerPage}
                                onChange={(e) => handleSettingsChange("display", "itemsPerPage", parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                            <select
                                value={settings.display.theme}
                                onChange={(e) => handleSettingsChange("display", "theme", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                            <select
                                value={settings.display.timezone}
                                onChange={(e) => handleSettingsChange("display", "timezone", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="UTC">UTC</option>
                                <option value="EST">Eastern</option>
                                <option value="CST">Central</option>
                                <option value="MST">Mountain</option>
                                <option value="PST">Pacific</option>
                            </select>
                        </div>
                    </div>
                </div> */}

                {/* Security Settings */}
                {/* <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock size={20} />
                        Security
                    </h2>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.security.twoFactorAuth}
                                onChange={(e) => handleSettingsChange("security", "twoFactorAuth", e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-600">Enhanced security with 2FA</p>
                            </div>
                        </label>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                value={settings.security.sessionTimeout}
                                onChange={(e) => handleSettingsChange("security", "sessionTimeout", parseInt(e.target.value))}
                                min="5"
                                max="480"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto logout after inactive period</p>
                        </div>
                    </div>
                </div> */}

                {/* Change Password */}
                {isSuperAdmin() && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock size={20} />
                            Change Password
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPrevPassword ? "text" : "password"}
                                        value={changePassword.currentPassword}
                                        onChange={(e) => setChangePassword({...changePassword, currentPassword: e.target.value})}
                                        placeholder="Enter current password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPrevPassword(!showPrevPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showPrevPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={changePassword.newPassword}
                                        onChange={(e) => setChangePassword({...changePassword, newPassword: e.target.value})}
                                        placeholder="Enter new password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={changePassword.confirmPassword}
                                        onChange={(e) => setChangePassword({...changePassword, confirmPassword: e.target.value})}
                                        placeholder="Confirm new password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handlePasswordChange}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                {/* <div className="flex gap-3 justify-end sticky bottom-6">
                    <button
                        onClick={handleSaveSettings}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                    >
                        <Save size={20} />
                        Save Settings
                    </button>
                </div> */}
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;