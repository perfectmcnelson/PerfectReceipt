// controllers/subscriptionController.js

const Subscription = require("../models/Subscription");
const PaymentTransaction = require("../models/PaymentTransaction");
const axios = require("axios");
const crypto = require("crypto");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Plan pricing
const PLAN_PRICES = {
    premium: {
        monthly: 150000, // ₦1,500 in kobo
        yearly: 1620000  // ₦16,200 (10% discount)
    },
    business: {
        monthly: 500000, // ₦5,000 in kobo
        yearly: 5400000  // ₦54,000 (10% discount)
    }
};

// @desc    Get current subscription
// @route   GET /api/subscription
// @access  Private
exports.getSubscription = async (req, res) => {
    try {
        let subscription = await Subscription.findOne({ user: req.user.id });
        
        // Create free subscription if none exists, and set a current period
        if (!subscription) {
            const now = new Date();
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            
            const temp = new Subscription({ plan: 'free' });
            const limitsForPlan = temp.canUseFeature();

            subscription = await Subscription.create({
                user: req.user.id,
                plan: 'free',
                status: 'active',
                limits: limitsForPlan,
                usage: { invoicesCreated: 0, receiptsGenerated: 0, emailsSent: 0 },
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd
            });
        } else {
            // If the billing period has ended, reset usage counters
            try {
                const now = new Date();
                if (!subscription.currentPeriodEnd) {
                    // Set initial billing period if not set
                    subscription.currentPeriodStart = now;
                    const periodEnd = new Date();
                    periodEnd.setMonth(periodEnd.getMonth() + (subscription.billingCycle === 'yearly' ? 12 : 1));
                    subscription.currentPeriodEnd = periodEnd;
                    await subscription.save();
                } else if (now > subscription.currentPeriodEnd) {
                    // Reset period if expired
                    subscription.usage = { invoicesCreated: 0, receiptsGenerated: 0, emailsSent: 0 };
                    subscription.currentPeriodStart = now;
                    const periodEnd = new Date();
                    periodEnd.setMonth(periodEnd.getMonth() + (subscription.billingCycle === 'yearly' ? 12 : 1));
                    subscription.currentPeriodEnd = periodEnd;
                    await subscription.save();
                }
            } catch (err) {
                console.warn('Failed to refresh subscription period in getSubscription:', err.message || err);
            }
        }
        
        res.json(subscription);
    } catch (error) {
        console.error("Get subscription error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Initialize payment for plan upgrade
// @route   POST /api/subscription/initialize
// @access  Private
exports.initializePayment = async (req, res) => {
    try {
        const { plan, billingCycle } = req.body;
        
        if (!["premium", "business"].includes(plan)) {
            return res.status(400).json({ message: "Invalid plan" });
        }
        
        if (!["monthly", "yearly"].includes(billingCycle)) {
            return res.status(400).json({ message: "Invalid billing cycle" });
        }
        
        const amount = PLAN_PRICES[plan][billingCycle];
        const reference = `SUB-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
        
        // Guard: ensure Paystack secret key and frontend URL are configured
        if (!PAYSTACK_SECRET_KEY) {
            return res.status(500).json({ message: "Paystack secret key not configured on server" });
        }
        if (!process.env.FRONTEND_URL) {
            return res.status(500).json({ message: "FRONTEND_URL not configured on server" });
        }

        // Create transaction record (store amount in Naira)
        const transaction = await PaymentTransaction.create({
            user: req.user.id,
            reference,
            amount: amount / 100, // Store in Naira
            currency: "NGN",
            plan,
            billingCycle,
            status: "pending",
            metadata: { plan, billingCycle }
        });
        
        // Initialize Paystack payment
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            {
                email: req.user.email,
                amount,
                reference,
                callback_url: `${process.env.FRONTEND_URL}/subscription/verify`,
                metadata: {
                    userId: req.user.id.toString(),
                    plan,
                    billingCycle,
                    transactionId: transaction._id.toString()
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        
        res.json({
            authorizationUrl: response.data.data.authorization_url,
            reference: response.data.data.reference,
            accessCode: response.data.data.access_code,
            transactionId: transaction._id.toString()
        });
        
    } catch (error) {
        console.error("Initialize payment error:", error);
        res.status(500).json({ message: "Failed to initialize payment", error: error.message });
    }
};

// @desc    Verify payment and upgrade subscription
// @route   GET /api/subscription/verify/:reference
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;
        
        // Verify with Paystack
        const response = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );
        
        const paymentData = response.data.data;
        
        if (paymentData.status !== "success") {
            return res.status(400).json({ message: "Payment verification failed" });
        }
        
        // Find transaction
        const transaction = await PaymentTransaction.findOne({ reference });
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        
        // Update transaction
        transaction.status = "success";
        transaction.paystackReference = paymentData.reference;
        transaction.paymentMethod = paymentData.channel;
        // preserve or extend metadata for auditing
        transaction.metadata = { ...(transaction.metadata || {}), paystack: paymentData };
        await transaction.save();
        
        // Update or create subscription
        let subscription = await Subscription.findOne({ user: transaction.user });
        
        const currentDate = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + (transaction.billingCycle === "yearly" ? 12 : 1));
        
        if (subscription) {
            subscription.plan = transaction.plan;
            subscription.status = "active";
            subscription.amount = transaction.amount;
            subscription.billingCycle = transaction.billingCycle;
            subscription.currentPeriodStart = currentDate;
            subscription.currentPeriodEnd = periodEnd;
            subscription.paystackSubscriptionCode = paymentData.reference;
            // Update limits according to the new plan
            subscription.limits = subscription.canUseFeature();
            await subscription.save();
            // link transaction to subscription
            transaction.subscription = subscription._id;
            await transaction.save();
        } else {
            // Create new subscription and set limits based on plan
            const temp = new Subscription({ plan: transaction.plan });
            const limitsForPlan = temp.canUseFeature();
            subscription = await Subscription.create({
                user: transaction.user,
                plan: transaction.plan,
                status: "active",
                amount: transaction.amount,
                billingCycle: transaction.billingCycle,
                currentPeriodStart: currentDate,
                currentPeriodEnd: periodEnd,
                paystackSubscriptionCode: paymentData.reference,
                limits: limitsForPlan
            });
            // link transaction to subscription
            transaction.subscription = subscription._id;
            await transaction.save();
        }
        
        res.json({
            message: "Payment verified and subscription upgraded successfully",
            subscription
        });
        
    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: "Payment verification failed", error: error.message });
    }
};

// @desc    Cancel subscription
// @route   POST /api/subscription/cancel
// @access  Private
exports.cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ user: req.user.id });
        
        if (!subscription || subscription.plan === "free") {
            return res.status(400).json({ message: "No active subscription to cancel" });
        }
        
        subscription.status = "cancelled";
        subscription.cancelledAt = new Date();
        await subscription.save();
        
        res.json({
            message: "Subscription cancelled. You can continue using premium features until the end of your billing period.",
            subscription
        });
        
    } catch (error) {
        console.error("Cancel subscription error:", error);
        res.status(500).json({ message: "Failed to cancel subscription", error: error.message });
    }
};

// @desc    Get billing history
// @route   GET /api/subscription/billing-history
// @access  Private
exports.getBillingHistory = async (req, res) => {
    try {
        const transactions = await PaymentTransaction.find({ 
            user: req.user.id,
            status: "success"
        })
        .sort({ createdAt: -1 })
        .limit(20);
        
        res.json(transactions);
    } catch (error) {
        console.error("Get billing history error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Check if user can create invoice/receipt
// @route   GET /api/subscription/check-limit/:feature
// @access  Private
exports.checkLimit = async (req, res) => {
    try {
        const { feature } = req.params;
        const subscription = await Subscription.findOne({ user: req.user.id });
        
        if (!subscription) {
            return res.json({ allowed: false, message: "No subscription found" });
        }
        
        // Refresh period if needed
        const now = new Date();
        if (!subscription.currentPeriodEnd || (subscription.currentPeriodEnd && now > subscription.currentPeriodEnd)) {
            subscription.usage = { invoicesCreated: 0, receiptsGenerated: 0, emailsSent: 0 };
            subscription.currentPeriodStart = now;
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + (subscription.billingCycle === 'yearly' ? 12 : 1));
            subscription.currentPeriodEnd = periodEnd;
            await subscription.save();
        }

        const limits = subscription.limits;
        const usage = subscription.usage;
        
        let allowed = true;
        let message = "";
        
        if (feature === "invoice") {
            if (limits.invoicesPerMonth !== -1 && usage.invoicesCreated >= limits.invoicesPerMonth) {
                allowed = false;
                message = `You've reached your monthly limit of ${limits.invoicesPerMonth} invoices. Upgrade to create more.`;
            }
        } else if (feature === "receipt") {
            if (limits.receiptsPerMonth !== -1 && usage.receiptsGenerated >= limits.receiptsPerMonth) {
                allowed = false;
                message = `You've reached your monthly limit of ${limits.receiptsPerMonth} receipts. Upgrade to create more.`;
            }
        } else if (feature === "email") {
            if (limits.emailsPerMonth !== -1 && usage.emailsSent >= limits.emailsPerMonth) {
                allowed = false;
                message = `You've reached your monthly limit of ${limits.emailsPerMonth} emails. Upgrade to send more.`;
            }
        }
        
        res.json({ allowed, message, usage, limits });
        
    } catch (error) {
        console.error("Check limit error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Increment usage counter
// @route   POST /api/subscription/increment-usage
// @access  Private
exports.incrementUsage = async (req, res) => {
    try {
        const { feature } = req.body;
        const subscription = await Subscription.findOne({ user: req.user.id });
        
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        
        // Refresh period if needed before incrementing
        const now = new Date();
        if (!subscription.currentPeriodEnd || (subscription.currentPeriodEnd && now > subscription.currentPeriodEnd)) {
            subscription.usage = { invoicesCreated: 0, receiptsGenerated: 0, emailsSent: 0 };
            subscription.currentPeriodStart = now;
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + (subscription.billingCycle === 'yearly' ? 12 : 1));
            subscription.currentPeriodEnd = periodEnd;
        }

        // Check and increment with limits enforcement
        if (feature === "invoice") {
            const limit = subscription.limits?.invoicesPerMonth ?? -1;
            if (limit !== -1 && subscription.usage.invoicesCreated >= limit) {
                return res.status(400).json({ success: false, message: `Monthly invoice limit reached (${limit}).` });
            }
            subscription.usage.invoicesCreated += 1;
        } else if (feature === "receipt") {
            const limit = subscription.limits?.receiptsPerMonth ?? -1;
            if (limit !== -1 && subscription.usage.receiptsGenerated >= limit) {
                return res.status(400).json({ success: false, message: `Monthly receipt limit reached (${limit}).` });
            }
            subscription.usage.receiptsGenerated += 1;
        } else if (feature === "email") {
            const limit = subscription.limits?.emailsPerMonth ?? -1;
            if (limit !== -1 && subscription.usage.emailsSent >= limit) {
                return res.status(400).json({ success: false, message: `Monthly email limit reached (${limit}).` });
            }
            subscription.usage.emailsSent += 1;
        } else {
            return res.status(400).json({ success: false, message: 'Unknown feature' });
        }

        await subscription.save();

        res.json({ success: true, usage: subscription.usage });
        
    } catch (error) {
        console.error("Increment usage error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// module.exports = {
//     getSubscription,
//     initializePayment,
//     verifyPayment,
//     cancelSubscription,
//     getBillingHistory,
//     checkLimit,
//     incrementUsage
// };