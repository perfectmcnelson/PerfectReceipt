// components/AdminTopbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import {
    Bell,
    User,
    Settings,
    LogOut,
    Clock,
    Shield,
    ChevronDown,
    Search
} from "lucide-react";

const AdminTopbar = () => {
    const navigate = useNavigate();
    const { admin, logout, isSuperAdmin } = useAdmin();
    const [profileDropdown, setProfileDropdown] = useState(false);
    const [notificationDropdown, setNotificationDropdown] = useState(false);
    const [time, setTime] = useState(new Date());
    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    // Update time
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileDropdown(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(e.target)) {
                setNotificationDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const formatTime = () => {
        return time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
            <div className="px-6 py-4 flex items-center justify-between">
                {/* Left Section - Search */}
                <div className="flex-1 max-w-md">
                    <div className="">
                        <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">Welcome back, {admin?.name}!</p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-6 ml-8">
                    {/* Current Time */}
                    <div className="hidden md:flex items-center gap-2 text-gray-600 px-3 py-2 bg-gray-50 rounded-lg">
                        <Clock size={16} />
                        <span className="text-sm font-mono">{formatTime()}</span>
                    </div>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setNotificationDropdown(!notificationDropdown)}
                            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Notification Dropdown */}
                        {notificationDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <div className="p-4 text-center text-gray-500">
                                        <p className="text-sm">No new notifications</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setProfileDropdown(!profileDropdown)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <div className="w-8 h-8 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                    {admin?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-gray-900">{admin?.name}</p>
                                <p className="text-xs text-gray-500">
                                    {isSuperAdmin() ? "Super Admin" : "Admin"}
                                </p>
                            </div>
                            <ChevronDown size={16} className="hidden md:block text-gray-600" />
                        </button>

                        {/* Profile Dropdown Menu */}
                        {profileDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                {/* Header */}
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-gray-900">{admin?.name}</p>
                                    <p className="text-xs text-gray-500">{admin?.email}</p>
                                </div>

                                {/* Role Badge */}
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Shield size={16} className={isSuperAdmin() ? "text-red-500" : "text-yellow-500"} />
                                        <span className="text-sm text-gray-700">
                                            {isSuperAdmin() ? "Super Admin Access" : "Admin Access"}
                                        </span>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            navigate("/profile");
                                            setProfileDropdown(false);
                                        }}
                                        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition"
                                    >
                                        <User size={16} />
                                        View Profile
                                    </button>

                                    <button
                                        onClick={() => {
                                            navigate("/settings");
                                            setProfileDropdown(false);
                                        }}
                                        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition"
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className="border-t border-gray-200 py-2">
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setProfileDropdown(false);
                                        }}
                                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition font-medium"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;