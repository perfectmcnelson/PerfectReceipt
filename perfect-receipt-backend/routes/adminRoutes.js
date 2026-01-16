const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { adminAuth, superAdminOnly, checkPermission, logAdminRoute } = require("../middlewares/adminAuth")

// ========== AUTH ROUTES (PUBLIC) ==========
router.post("/login", adminController.adminLogin);

// ========== PROTECTED ROUTES (All below require adminAuth) ==========
router.use(adminAuth); // Apply admin auth to all routes below
router.use(logAdminRoute); // Optional: log all admin routes

// Get current admin profile
router.get("/me", adminController.getAdminProfile);

// Update current admin profile
// router.put("/me", adminController.updateAdminProfile);
router.patch("/me", adminController.updateAdminProfile);

// Logout
router.post("/logout", adminController.adminLogout);

// ========== PROFILE MANAGEMENT ==========
router.put("/change-password", adminController.adminChangePassword);

// ========== USER MANAGEMENT ==========
router.get("/users", checkPermission("userManagement", "view"), adminController.getAllUsers);
router.get("/users/:id", checkPermission("userManagement", "view"), adminController.getUserById);
router.put("/users/:id", checkPermission("userManagement", "edit"), adminController.editUser);
router.post("/users/:id/suspend", checkPermission("userManagement", "edit"), adminController.suspendUser);
router.post("/users/:id/activate", checkPermission("userManagement", "edit"), adminController.activateUser);
router.delete("/users/:id", checkPermission("userManagement", "delete"), superAdminOnly, adminController.deleteUser);

// ========== ANALYTICS & DASHBOARD ==========
router.get("/dashboard/overview", checkPermission("analyticsAccess", "view"), adminController.getDashboardOverview);
router.get("/analytics", checkPermission("analyticsAccess", "view"), adminController.getAnalytics);

// ========== PAYMENT & SUBSCRIPTION MANAGEMENT ==========
router.get("/payments", checkPermission("paymentTracking", "view"), adminController.getAllPayments);
router.get("/subscriptions", checkPermission("subscriptionManagement", "view"), adminController.getSubscriptions);
router.put("/subscriptions/:id", checkPermission("subscriptionManagement", "edit"), adminController.editSubscription);
router.get("/users/:id/subscription", checkPermission("subscriptionManagement", "edit"), adminController.getUserSubscription);
router.put("/users/:id/subscription", checkPermission("subscriptionManagement", "edit"), adminController.updateUserSubscription);

// ========== ACTIVITY LOGS ==========
router.get("/activity-logs", adminController.getActivityLogs);

// ========== DATA EXPORT ==========
router.get("/export/users", superAdminOnly, adminController.exportUsers);

module.exports = router;