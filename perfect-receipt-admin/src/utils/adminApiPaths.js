// utils/adminApiPaths.js

export const BASE_URL = import.meta.env.VITE_BASE_URL

export const ADMIN_API_PATHS = {
    AUTH: {
        LOGIN: "/api/admin/login",
        GET_PROFILE: "/api/admin/me",
        UPDATE_PROFILE: "/api/admin/me",
        LOGOUT: "/api/admin/logout",
        CHANGE_PASSWORD: "/api/admin/change-password",
    },

    USERS: {
        GET_ALL: "/api/admin/users",
        GET_BY_ID: (id) => `/api/admin/users/${id}`,
        EDIT: (id) => `/api/admin/users/${id}`,
        SUSPEND: (id) => `/api/admin/users/${id}/suspend`,
        ACTIVATE: (id) => `/api/admin/users/${id}/activate`,
        DELETE: (id) => `/api/admin/users/${id}`
    },

    DASHBOARD: {
        OVERVIEW: "/api/admin/dashboard/overview",
        ANALYTICS: "/api/admin/analytics"
    },

    ANALYTICS: {
        USER_GROWTH: "/api/admin/analytics/user-growth",
        DOCUMENTS: "/api/admin/analytics/documents",
        REVENUE: "/api/admin/analytics/revenue",
        ENGAGEMENT: "/api/admin/analytics/engagement",
        PAYMENT_HEALTH: "/api/admin/analytics/payment-health",
        SYSTEM_HEALTH: "/api/admin/analytics/system-health"
    },

    PAYMENTS: {
        GET_ALL: "/api/admin/payments"
    },

    SUBSCRIPTIONS: {
        GET_ALL: "/api/admin/subscriptions",
        GET_BY_USER_ID: (userId) => `/api/admin/users/${userId}/subscription`,
        EDIT: (id) => `/api/admin/subscriptions/${id}`,
        UPDATE_BY_USER_ID: (userId) => `/api/admin/users/${userId}/subscription`
    },

    ACTIVITY_LOGS: {
        GET_ALL: "/api/admin/activity-logs"
    },

    EXPORT: {
        USERS: "/api/admin/export/users"
    }
};

export default ADMIN_API_PATHS;