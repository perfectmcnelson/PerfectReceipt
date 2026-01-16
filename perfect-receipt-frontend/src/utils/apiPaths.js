// export const BASE_URL = "https://perfect-receipt-backend.onrender.com";
export const BASE_URL = import.meta.env.VITE_BASE_URL;

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register", // SignUp
        LOGIN: "/api/auth/login", // Authenticate user & return JWT token
        GET_PROFILE: "/api/auth/me", // Get logged-in user details
        UPDATE_PROFILE: "/api/auth/me", // Update profile details (PUT)
        UPLOAD_PROFILE_PICTURE: "/api/auth/upload-profile-picture", // Upload profile picture
        UPLOAD_BUSINESS_LOGO: "/api/auth/upload-business-logo", // Upload business logo
        SEND_VERIFICATION_EMAIL: "/api/auth/send-verification-email", // Send Verification Email
        // VERIFY_EMAIL: (token) => `/api/auth/verify-email/${token}`, // Verify Email Token
        
        VERIFY_EMAIL_BY_TOKEN: (token) => `/api/auth/verify-email/${token}`, // Verify Email via token (from link)
        VERIFY_EMAIL_BY_CODE: "/api/auth/verify-email/code", // Verify Email via code (manual input)
        RESEND_VERIFICATION_EMAIL: "/api/auth/resend-verification-email", // Resend verification email

        // 2FA
        ENABLE_2FA: "/api/auth/2fa/enable",
        VERIFY_2FA: "/api/auth/2fa/verify",
        DISABLE_2FA: "/api/auth/2fa/disable",
        VERIFY_2FA_LOGIN: "/api/auth/2fa/verify-login",
        
        // Password Reset
        FORGOT_PASSWORD: "/api/auth/forgot-password",
        RESET_PASSWORD: (token) => `/api/auth/reset-password/${token}`,

        // Google OAuth
        GOOGLE_LOGIN: "/api/auth/google",
        
        // Data Export
        EXPORT_DATA: "/api/auth/export-data"
    },

    SUBSCRIPTION: {
        GET: "/api/subscription",
        INITIALIZE: "/api/subscription/initialize",
        VERIFY: (reference) => `/api/subscription/verify/${reference}`,
        CANCEL: "/api/subscription/cancel",
        BILLING_HISTORY: "/api/subscription/billing-history",
        CHECK_LIMIT: (feature) => `/api/subscription/check-limit/${feature}`,
        INCREMENT_USAGE: "/api/subscription/increment-usage"
    },

    SETTINGS: {
        GET: "/api/settings",
        UPDATE: "/api/settings"
    },

    INVOICE: {
        CREATE: "/api/invoices",
        GET_ALL_INVOICES: "/api/invoices",
        GET_INVOICE_BY_ID: (id) => `/api/invoices/${id}`,
        UPDATE_INVOICE: (id) => `/api/invoices/${id}`,
        DELETE_INVOICE: (id) => `/api/invoices/${id}`,
        SEND_INVOICE_EMAIL: (id) => `/api/invoices/${id}/send-email`,
        SEND_INVOICE_REMINDER: (id) => `/api/invoices/${id}/send-reminder`,
        GENERATE_PDF: (id) => `/api/invoices/${id}/generate-pdf`,
    },

    RECEIPT: {
        GENERATE: (invoiceId) => `/api/receipts/invoice/${invoiceId}/generate`,
        GET_ALL: "/api/receipts",
        GET_BY_ID: (id) => `/api/receipts/${id}`,
        GET_BY_INVOICE: (invoiceId) => `/api/receipts/invoice/${invoiceId}`,
        UPDATE: (id) => `/api/receipts/${id}`,
        DELETE: (id) => `/api/receipts/${id}`,
        GENERATE_PDF: (id) => `/api/receipts/${id}/generate-pdf`,
        SEND_RECEIPT_EMAIL: (id) => `/api/receipts/${id}/send-email`,
        GET_STATS: "/api/receipts/stats/summary",
    },

    EMAIL: {
        SEND_EMAIL: "/api/email/send-email"
    }
}