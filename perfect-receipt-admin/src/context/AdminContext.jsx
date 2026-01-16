// context/AdminContext.js
import React, { createContext, useState, useCallback, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Check if admin is already logged in
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("adminToken");
            if (token) {
                try {
                    setIsLoading(true);
                    const response = await axiosInstance.get(ADMIN_API_PATHS.AUTH.GET_PROFILE);
                    setAdmin(response.data);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error("Auth check failed:", err);
                    localStorage.removeItem("adminToken");
                    setIsAuthenticated(false);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        checkAuth();
    }, []);

    // Admin Login
    const login = useCallback(async (email, password) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axiosInstance.post(ADMIN_API_PATHS.AUTH.LOGIN, {
                email,
                password
            });
            
            localStorage.setItem("adminToken", response.data.token);
            setAdmin(response.data.admin);
            setIsAuthenticated(true);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Login failed";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Admin Logout
    const logout = useCallback(async () => {
        try {
            setIsLoading(true);
            await axiosInstance.post(ADMIN_API_PATHS.AUTH.LOGOUT);
            localStorage.removeItem("adminToken");
            setAdmin(null);
            setIsAuthenticated(false);
            setDashboardData(null);
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch Dashboard Overview
    const fetchDashboardOverview = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(ADMIN_API_PATHS.DASHBOARD.OVERVIEW);
            setDashboardData(response.data);
            return response.data;
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError(err.response?.data?.message || "Failed to fetch dashboard");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check permission
    const hasPermission = useCallback((resource, action) => {
        if (!admin || !admin.permissions) return false;
        return admin.permissions[resource]?.[action] || false;
        // return (admin.permissions?.resource?.action) || false;
    }, [admin]);

    // Check if super admin
    const isSuperAdmin = useCallback(() => {
        return admin?.role === "super_admin";
    }, [admin]);

    const value = {
        admin,
        setAdmin,
        isAuthenticated,
        isLoading,
        error,
        dashboardData,
        sidebarOpen,
        setSidebarOpen,
        login,
        logout,
        fetchDashboardOverview,
        hasPermission,
        isSuperAdmin,
        setError
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

// Custom hook to use Admin Context
export const useAdmin = () => {
    const context = React.useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within AdminProvider");
    }
    return context;
}; 