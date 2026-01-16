const express = require("express");
const router = express.Router();
const {getUserGrowth, getDocumentStats, getRevenueMetrics, getEngagementMetrics, getPaymentHealth, getSystemHealth} = require("../controllers/adminAnalyticsController")
const { adminAuth, checkPermission } = require("../middlewares/adminAuth")

// All routes require admin authentication and analytics permission
router.use(adminAuth);
router.use(checkPermission("analyticsAccess", "view"));

// User analytics
router.get("/user-growth", getUserGrowth);

// Document statistics
router.get("/documents", getDocumentStats);

// Revenue metrics
router.get("/revenue", getRevenueMetrics);

// Engagement metrics
router.get("/engagement", getEngagementMetrics);

// Payment health
router.get("/payment-health", getPaymentHealth);

// System health
router.get("/system-health", getSystemHealth);

module.exports = router;
