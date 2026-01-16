const mongoose = require("mongoose");

const adminActivityLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
            index: true
        },
        action: {
            type: String,
            enum: [
                "LOGIN",
                "LOGOUT",
                "VIEW_USERS",
                "EDIT_USER",
                "SUSPEND_USER",
                "DELETE_USER",
                "VIEW_ANALYTICS",
                "VIEW_PAYMENTS",
                "EDIT_SUBSCRIPTION",
                "CANCEL_SUBSCRIPTION",
                "VIEW_INVOICES",
                "DELETE_INVOICE",
                "VIEW_RECEIPTS",
                "DELETE_RECEIPT",
                "EXPORT_DATA",
                "ADMIN_LOGIN_FAILED",
                "PERMISSION_DENIED",
                "SYSTEM_ERROR"
            ],
            required: true,
            index: true
        },
        resource: {
            type: String,
            enum: ["User", "Subscription", "Invoice", "Receipt", "Admin", "Payment", "System"],
            required: true
        },
        resourceId: mongoose.Schema.Types.ObjectId,
        description: String,
        changes: {
            before: mongoose.Schema.Types.Mixed,
            after: mongoose.Schema.Types.Mixed
        },
        status: {
            type: String,
            enum: ["success", "failed", "pending"],
            default: "success"
        },
        ipAddress: String,
        userAgent: String,
        metadata: mongoose.Schema.Types.Mixed
    },
    { timestamps: true }
);

// Index for faster queries
adminActivityLogSchema.index({ admin: 1, createdAt: -1 });
adminActivityLogSchema.index({ action: 1, createdAt: -1 });
adminActivityLogSchema.index({ resource: 1, createdAt: -1 });

module.exports = mongoose.model("AdminActivityLog", adminActivityLogSchema);