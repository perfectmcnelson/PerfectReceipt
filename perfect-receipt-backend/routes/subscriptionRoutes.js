const express = require("express");
const {
    getSubscription,
    initializePayment,
    verifyPayment,
    cancelSubscription,
    getBillingHistory,
    checkLimit,
    incrementUsage
} = require("../controllers/subscriptionController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getSubscription);
router.post("/initialize", protect, initializePayment);
router.get("/verify/:reference", protect, verifyPayment);
router.post("/cancel", protect, cancelSubscription);
router.get("/billing-history", protect, getBillingHistory);
router.get("/check-limit/:feature", protect, checkLimit);
router.post("/increment-usage", protect, incrementUsage);

module.exports = router;