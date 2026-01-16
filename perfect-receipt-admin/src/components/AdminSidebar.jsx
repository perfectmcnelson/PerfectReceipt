// components/AdminSidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    BarChart3,
    CreditCard,
    Receipt,
    Settings,
    LogOut,
    ChevronDown,
    Shield,
    Activity,
    FileText,
    TrendingUp
} from "lucide-react";

const AdminSidebar = () => {
    const location = useLocation();
    const { admin, logout, sidebarOpen, setSidebarOpen, hasPermission, isSuperAdmin } = useAdmin();
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const menuItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/dashboard",
            permission: "analyticsAccess.view"
        },
        {
            label: "User Management",
            icon: Users,
            submenu: [
                { label: "All Users", path: "/users", permission: "userManagement.view" },
                // { label: "User Details", path: "/users/details", permission: "userManagement.view" },
                { label: "Suspended Users", path: "/users/suspended", permission: "userManagement.view" }
            ]
        },
        {
            label: "Analytics",
            icon: BarChart3,
            submenu: [
                { label: "Overview", path: "/analytics", permission: "analyticsAccess.view" },
                { label: "User Growth", path: "/analytics/user-growth", permission: "analyticsAccess.view" },
                { label: "Documents", path: "/analytics/documents", permission: "analyticsAccess.view" },
                { label: "Revenue", path: "/analytics/revenue", permission: "analyticsAccess.view" },
                { label: "Engagement", path: "/analytics/engagement", permission: "analyticsAccess.view" },
                { label: "Payment Health", path: "/analytics/payment-health", permission: "analyticsAccess.view" }
            ]
        },
        {
            label: "Payments",
            icon: CreditCard,
            path: "/payments",
            permission: "paymentTracking.view"
        },
        {
            label: "Subscriptions",
            icon: Receipt,
            path: "/subscriptions",
            permission: "subscriptionManagement.view"
        },
        {
            label: "Activity Logs",
            icon: Activity,
            path: "/activity-logs",
            permission: null // All admins can view
        },
        {
            label: "System",
            icon: Settings,
            submenu: [
                { label: "System Health", path: "/system-health", permission: "analyticsAccess.view" },
                { label: "Settings", path: "/settings", permission: null }
            ]
        }
    ];

    const isActive = (path) => location.pathname === path;
    const isActiveParent = (submenu) => submenu?.some(item => isActive(item.path));

    const checkPermission = (permission) => {
        if (!permission) return true;
        const [resource, action] = permission.split(".");
        return hasPermission(resource, action);
    };

    const filteredMenuItems = menuItems.filter(item => {
        if (item.permission) {
            return checkPermission(item.permission);
        }
        if (item.submenu) {
            return item.submenu.some(subitem => checkPermission(subitem.permission));
        }
        return true;
    });

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } fixed md:static md:translate-x-0 top-0 left-0 h-screen w-64 bg-slate-900 text-white shadow-2xl transition-transform duration-300 z-40 overflow-y-auto`}
            >
                {/* Logo Section */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">PerfectReceipt</h1>
                            <p className="text-xs text-gray-400">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Admin Info */}
                <div className="p-4 mx-3 my-4 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xs text-gray-400 mb-1">Logged in as</p>
                    <p className="text-sm font-semibold text-white truncate">{admin?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{admin?.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-600 rounded text-xs font-medium">
                        {isSuperAdmin() ? "🔴 Super Admin" : "🟡 Admin"}
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="p-3 space-y-2">
                    {filteredMenuItems.map((item, idx) => (
                        <div key={idx}>
                            {item.submenu ? (
                                // Submenu Item
                                <div>
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                            isActiveParent(item.submenu)
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-300 hover:bg-slate-800"
                                        }`}
                                    >
                                        <item.icon size={20} />
                                        <span className="flex-1 text-left font-medium">{item.label}</span>
                                        <ChevronDown
                                            size={18}
                                            className={`transition-transform ${
                                                expandedMenus[item.label] ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>

                                    {/* Submenu */}
                                    {expandedMenus[item.label] && (
                                        <div className="mt-1 ml-2 space-y-1 border-l-2 border-slate-700 pl-2">
                                            {item.submenu.map((subitem, subidx) => (
                                                <Link
                                                    key={subidx}
                                                    to={subitem.path}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={`block px-4 py-2 rounded-lg text-sm transition ${
                                                        isActive(subitem.path)
                                                            ? "bg-blue-600 text-white font-semibold"
                                                            : "text-gray-300 hover:bg-slate-800"
                                                    }`}
                                                >
                                                    {subitem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Regular Menu Item
                                <Link
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                        isActive(item.path)
                                            ? "bg-blue-600 text-white font-semibold"
                                            : "text-gray-300 hover:bg-slate-800"
                                    }`}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Divider */}
                <div className="mx-3 my-4 border-t border-slate-700"></div>

                {/* Logout Button */}
                <div className="p-3">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>

                {/* Footer Info */}
                <div className="p-3 text-xs text-gray-400 text-center border-t border-slate-700">
                    <p>© 2025 PerfectReceipt</p>
                    <p className="mt-1">Admin Dashboard v1.0</p>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;