import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export const AuthProvider = ({ children }) => {

    const currencySymbols = {
        NGN: "₦",
        // USD: "$",
        // EUR: "€",
        // GBP: "£",
    };

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [settings, setSettings] = useState(null);
    const [currency, setCurrency] = useState("NGN"); // default fallback
    const [userPlan, setUserPlan] = useState('free');
    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [currencyIcon, setCurrencyIcon] = useState("₦")

    // useEffect(() => {
    //     setCurrencyIcon(currencySymbols[currency] || "₦");
    // }, [currency]);

    // ==========================================
    // Initialize auth on app load
    // ==========================================
    useEffect(() => {
        checkAuthStatus();
    }, [])

    const fetchSettings = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.SETTINGS.GET);
            const settingsData = response.data;

            setSettings(settingsData);

            if (settingsData.subscription) {
                setUserPlan(settingsData.subscription.plan);
                setAvailableTemplates(settingsData.subscription.availableTemplates);
                console.log(`Available Templates: ${availableTemplates}`)
            }

            // Set currency from invoiceDefaults
            setCurrency(settingsData.invoiceDefaults?.currency || "NGN");
            setCurrencyIcon(currencySymbols[currency] || "₦");

            // Save locally (optional)
            localStorage.setItem("settings", JSON.stringify(settingsData));
            localStorage.setItem("currency", settingsData.invoiceDefaults?.currency);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
            const userData = response.data;

            if (userData.suspended) {
                sessionStorage.setItem("accountSuspended", "true");
                // logout(() => navigate("/account-suspended", { replace: true }));
                logout("/account-suspended");
                return;
            }

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    }


    const checkAuthStatus = async () => {
        try {
            
            const storedToken = localStorage.getItem("token");
            // const userStr = localStorage.getItem("user");

            if (storedToken) {
                // const userData = JSON.parse(userStr);
                setToken(storedToken);
                // setUser(userData);
                setIsAuthenticated(true);
                
                // ✅ Set axios header with stored token
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                await fetchUser();
                await fetchSettings(); 
                
                console.log('✅ Auth restored from localStorage');
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Login - Store token, user, and update axios
    // ==========================================
    // const login = (responseData, authToken) => {
    const login = async (formData) => {
        try {
            setError("");
            setLoading(true);
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, formData);

            const { token, ...userData } = response.data;

            if (!token) {
                console.error("No token provided in login");
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));
            setToken(token);
            setUser(userData);
            setIsAuthenticated(true);
            // return response.data;
            
            // ✅ Set axios header for all future requests
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // fetchSettings();
            
            console.log('✅ Login successful:', userData.email);
        } catch (err) {
            if (err.response?.data?.code === "ACCOUNT_SUSPENDED") {
                sessionStorage.setItem("accountSuspended", "true");
                logout("/account-suspended");
                return;
            }
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Logout - Clear everything
    // ==========================================
    // const logout = (navigateFn) => {
    const logout = (redirectPath = "/login") => {
        try {
            // ✅ Clear localStorage
            // localStorage.removeItem("token");
            // localStorage.removeItem("refreshToken");
            // localStorage.removeItem("user");
            // localStorage.removeItem("pendingEmail");
            // localStorage.removeItem("tempEmail");
            // localStorage.removeItem("tempToken");
            localStorage.clear();

            // ✅ Clear state
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);

            // ✅ Remove axios header
            delete axiosInstance.defaults.headers.common['Authorization'];

            console.log('✅ Logout successful');
            
            // ✅ Redirect to home/login
            window.location.replace(redirectPath);
            // window.location.href = "/login"
            // if (navigateFn) {
            //     navigateFn("/login", { replace: true });
            // }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // ==========================================
    // Update user profile
    // ==========================================
    const updateUser = (updatedUserData) => {
        try {
            const newUserData = { ...user, ...updatedUserData };
            localStorage.setItem("user", JSON.stringify(newUserData));
            setUser(newUserData);
            console.log('✅ User updated');
        } catch (error) {
            console.error("Update user error:", error);
        }
    };

    // ==========================================
    // Check if email is verified
    // ==========================================
    const isEmailVerified = () => {
        return user?.emailVerified === true;
    };

    // ==========================================
    // Context value
    // ==========================================
    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        error,
        setError,
        updateUser,
        checkAuthStatus,
        isEmailVerified,
        settings,
        fetchSettings,
        currency,
        currencyIcon,
        setCurrency,
        userPlan,
        availableTemplates,
        setSettings, 
        setUser, 
        setIsAuthenticated, 
        setToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}