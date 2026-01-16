const User = require("../models/User");
const Invoice = require("../models/Invoice");
const Receipt = require("../models/Receipt");
const Subscription = require("../models/Subscription");
const PaymentTransaction = require("../models/PaymentTransaction");
const AdminActivityLog = require("../models/AdminActivityLog");

/**
 * @desc    Get user growth statistics
 * @route   GET /api/admin/analytics/user-growth
 * @access  Private/Admin
 */
exports.getUserGrowth = async (req, res) => {
    try {
        const { months = 12 } = req.query;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        // Get user signups by month
        const monthlySignups = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Get email verification rate
        const totalUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
        const verifiedUsers = await User.countDocuments({ 
            createdAt: { $gte: startDate },
            emailVerified: true 
        });

        res.json({
            period: { startDate, endDate, months },
            monthlySignups,
            verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0,
            totalNewUsers: totalUsers,
            verifiedCount: verifiedUsers
        });

    } catch (error) {
        console.error("Get user growth error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get invoice and receipt statistics
 * @route   GET /api/admin/analytics/documents
 * @access  Private/Admin
 */
exports.getDocumentStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const query = dateFilter ? { createdAt: dateFilter } : {};

        // Invoice statistics
        const invoiceStats = await Invoice.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalAmount: { $sum: "$total" },
                    avgAmount: { $avg: "$total" },
                    paidCount: {
                        $sum: { $cond: [{ $eq: ["$status", "Paid"] }, 1, 0] }
                    },
                    unpaidCount: {
                        $sum: { $cond: [{ $eq: ["$status", "Unpaid"] }, 1, 0] }
                    }
                }
            }
        ]);

        // Receipt statistics
        const receiptStats = await Receipt.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalReceipts: { $sum: 1 },
                    totalAmount: { $sum: "$amountPaid" },
                    avgAmount: { $avg: "$amountPaid" }
                }
            }
        ]);

        // Payment method breakdown
        const paymentMethods = await Receipt.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amountPaid" }
                }
            }
        ]);

        // Templates used
        const templatesUsed = await Invoice.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$templateId",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            period: { startDate, endDate },
            invoices: invoiceStats[0] || { totalInvoices: 0, totalAmount: 0, avgAmount: 0, paidCount: 0, unpaidCount: 0 },
            receipts: receiptStats[0] || { totalReceipts: 0, totalAmount: 0, avgAmount: 0 },
            paymentMethods,
            templatesUsed
        });

    } catch (error) {
        console.error("Get document stats error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get revenue and subscription metrics
 * @route   GET /api/admin/analytics/revenue
 * @access  Private/Admin
 */
exports.getRevenueMetrics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const query = { ...dateFilter, status: "success" };

        // Total revenue
        const totalRevenue = await PaymentTransaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Revenue by plan
        const revenueByPlan = await PaymentTransaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$plan",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Revenue by billing cycle
        const revenueByBillingCycle = await PaymentTransaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$billingCycle",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Current subscriptions value
        const activeSubscriptions = await Subscription.aggregate([
            { $match: { status: "active" } },
            {
                $group: {
                    _id: "$plan",
                    count: { $sum: 1 },
                    totalMRR: { $sum: "$amount" }
                }
            }
        ]);

        // Churn rate (cancelled subscriptions)
        const cancelledCount = await Subscription.countDocuments({ status: "cancelled" });
        const totalSubscriptions = await Subscription.countDocuments();
        const churnRate = totalSubscriptions > 0 ? ((cancelledCount / totalSubscriptions) * 100).toFixed(2) : 0;

        res.json({
            period: { startDate, endDate },
            totalRevenue: totalRevenue[0] || { total: 0, count: 0 },
            revenueByPlan,
            revenueByBillingCycle,
            activeSubscriptions,
            churnMetrics: {
                cancelledCount,
                totalSubscriptions,
                churnRate: `${churnRate}%`
            }
        });

    } catch (error) {
        console.error("Get revenue metrics error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get user engagement metrics
 * @route   GET /api/admin/analytics/engagement
 * @access  Private/Admin
 */
exports.getEngagementMetrics = async (req, res) => {
    try {
        // Get users by auth method
        const authMethods = await User.aggregate([
            {
                $group: {
                    _id: "$authMethod",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get most active users (by invoice count)
        const mostActiveUsers = await Invoice.aggregate([
            {
                $group: {
                    _id: "$user",
                    invoiceCount: { $sum: 1 },
                    totalAmount: { $sum: "$total" }
                }
            },
            { $sort: { invoiceCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            }
        ]);

        // Users without any invoices (inactive users)
        const userIds = await Invoice.distinct("user");
        const usersWithoutInvoices = await User.countDocuments({
            _id: { $nin: userIds }
        });

        // Last login statistics
        const usersNeverLoggedIn = await User.countDocuments({ lastLogin: null });
        const usersInactiveMonth = await User.countDocuments({
            lastLogin: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        res.json({
            authMethods,
            mostActiveUsers: mostActiveUsers.map(u => ({
                user: u.userInfo[0]?.email || "Unknown",
                invoiceCount: u.invoiceCount,
                totalAmount: u.totalAmount
            })),
            inactiveUsers: {
                withoutInvoices: usersWithoutInvoices,
                neverLoggedIn: usersNeverLoggedIn,
                inactiveForMonth: usersInactiveMonth
            }
        });

    } catch (error) {
        console.error("Get engagement metrics error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get payment health metrics
 * @route   GET /api/admin/analytics/payment-health
 * @access  Private/Admin
 */
exports.getPaymentHealth = async (req, res) => {
    try {
        // Payment status breakdown
        const paymentStatus = await PaymentTransaction.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        // Failed payments trend
        const failedPaymentsTrend = await PaymentTransaction.aggregate([
            { $match: { status: "failed" } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Success rate
        const totalTransactions = await PaymentTransaction.countDocuments();
        const successfulTransactions = await PaymentTransaction.countDocuments({ status: "success" });
        const successRate = totalTransactions > 0 ? ((successfulTransactions / totalTransactions) * 100).toFixed(2) : 0;

        // Abandoned transactions
        const abandonedCount = await PaymentTransaction.countDocuments({ status: "abandoned" });

        res.json({
            paymentStatus,
            failedPaymentsTrend,
            successMetrics: {
                totalTransactions,
                successfulTransactions,
                successRate: `${successRate}%`,
                abandonedCount
            }
        });

    } catch (error) {
        console.error("Get payment health error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get system health and admin activity
 * @route   GET /api/admin/analytics/system-health
 * @access  Private/Admin
 */
exports.getSystemHealth = async (req, res) => {
    try {
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Failed operations
        const failedOperations = await AdminActivityLog.aggregate([
            { $match: { status: "failed", createdAt: { $gte: last30Days } } },
            {
                $group: {
                    _id: "$action",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Top admin actions (last 30 days)
        const topActions = await AdminActivityLog.aggregate([
            { $match: { createdAt: { $gte: last30Days } } },
            {
                $group: {
                    _id: "$action",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Most active admins
        const activeAdmins = await AdminActivityLog.aggregate([
            { $match: { createdAt: { $gte: last30Days } } },
            {
                $group: {
                    _id: "$admin",
                    actionCount: { $sum: 1 }
                }
            },
            { $sort: { actionCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "admins",
                    localField: "_id",
                    foreignField: "_id",
                    as: "adminInfo"
                }
            }
        ]);

        // Permission denied attempts
        const permissionDenied = await AdminActivityLog.countDocuments({
            action: "PERMISSION_DENIED",
            createdAt: { $gte: last30Days }
        });

        res.json({
            period: "Last 30 days",
            failedOperations,
            topActions,
            activeAdmins: activeAdmins.map(a => ({
                admin: a.adminInfo[0]?.email || "Unknown",
                actionCount: a.actionCount
            })),
            permissionDenied,
            healthStatus: permissionDenied > 10 ? "warning" : "good"
        });

    } catch (error) {
        console.error("Get system health error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = exports;