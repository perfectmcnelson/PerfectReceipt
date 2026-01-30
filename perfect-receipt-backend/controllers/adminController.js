// controllers/adminController.js

const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const AdminActivityLog = require("../models/AdminActivityLog");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Invoice = require("../models/Invoice");
const Receipt = require("../models/Receipt");
const PaymentTransaction = require("../models/PaymentTransaction");
const bcrypt = require("bcryptjs");

// Helper: Generate JWT
const generateAdminToken = (id) => {
    return jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET_ADMIN, {
        expiresIn: "1h",
    });
};

// Helper: Log admin activity
const logAdminActivity = async (adminId, action, resource, resourceId, description, changes = null, status = "success", req = null) => {
    try {
        await AdminActivityLog.create({
            admin: adminId,
            action,
            resource,
            resourceId,
            description,
            changes,
            status,
            ipAddress: req?.ip || req?.connection?.remoteAddress || "unknown",
            userAgent: req?.get("user-agent") || "unknown"
        });
    } catch (err) {
        console.error("Failed to log admin activity:", err.message);
    }
};

// ========== ADMIN AUTH ==========

/**
 * @desc    Admin Login
 * @route   POST /api/admin/login
 * @access  Public
 */
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const admin = await Admin.findOne({ email }).select("+password");

        if (!admin) {
            await logAdminActivity(null, "ADMIN_LOGIN_FAILED", "Admin", null, `Failed login attempt for ${email}`, null, "failed", req);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if account is locked
        if (admin.isLocked()) {
            await logAdminActivity(admin._id, "ADMIN_LOGIN_FAILED", "Admin", admin._id, "Account locked due to multiple failed attempts", null, "failed", req);
            return res.status(401).json({ message: "Account is locked. Try again later." });
        }

        // Check if account is active
        if (!admin.active) {
            await logAdminActivity(admin._id, "ADMIN_LOGIN_FAILED", "Admin", admin._id, "Login attempt on inactive account", null, "failed", req);
            return res.status(401).json({ message: "Account is inactive" });
        }

        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            admin.loginAttempts += 1;
            // Lock account after 5 failed attempts
            if (admin.loginAttempts >= 5) {
                admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            }
            await admin.save();
            await logAdminActivity(admin._id, "ADMIN_LOGIN_FAILED", "Admin", admin._id, `Failed login attempt (${admin.loginAttempts}/5)`, null, "failed", req);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Reset login attempts on successful login
        admin.loginAttempts = 0;
        admin.lockUntil = null;
        admin.lastLogin = new Date();
        await admin.save();

        const token = generateAdminToken(admin._id);
        await logAdminActivity(admin._id, "LOGIN", "Admin", admin._id, "Admin login successful", null, "success", req);

        res.json({
            message: "Login successful",
            token,
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                active: admin.active,
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Change admin password
 * @route   POST /api/admin/change-password
 * @access  Private/Admin
 */
exports.adminChangePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new passwords are required" });
        }

        const admin = await Admin.findById(req.admin.id).select("+password");

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const isMatch = await admin.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        admin.password = newPassword;
        await admin.save();

        await logAdminActivity(req.admin.id, "CHANGE_PASSWORD", "Admin", req.admin.id, "Admin changed password", null, "success", req);

        res.json({ message: "Password changed successfully" });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get current admin
 * @route   GET /api/admin/me
 * @access  Private/Admin
 */
exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select("-password");
        res.json(admin);
    } catch (error) {
        console.error("Get admin profile error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Update admin profile
 * @route   PATCH /api/admin/me
 * @access  Private/Admin
 */
exports.updateAdminProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        // const admin = await Admin.findById(req.admin.id);
        const admin = req.admin;

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        admin.name = name || admin.name;
        if (email && email !== admin.email) {
            const emailExists = await Admin.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
            admin.email = email;
        }

        await admin.save();

        await logAdminActivity(req.admin.id, "UPDATE_PROFILE", "Admin", req.admin.id, "Admin updated profile", null, "success", req);

        res.json({ message: "Profile updated successfully", 
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            }
        });
    } catch (error) {
        console.error("Update admin profile error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Admin Logout
 * @route   POST /api/admin/logout
 * @access  Private/Admin
 */
exports.adminLogout = async (req, res) => {
    try {
        await logAdminActivity(req.admin.id, "LOGOUT", "Admin", req.admin.id, "Admin logout", null, "success", req);
        res.json({ message: "Logout successful" });
    } catch (error) {
        console.error("Admin logout error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ========== USER MANAGEMENT ==========

/**
 * @desc    Get all users with pagination and filters
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", sortBy = "createdAt", order = "desc", status = "" } = req.query;

        const query = {};

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by verification status
        if (status === "suspended") {
            query.suspended = true;
        } else if (status === "active") {
            query.suspended = false;
        }

        const users = await User.find(query)
            .select("-password")
            .sort({ [sortBy]: order === "desc" ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const totalUsers = await User.countDocuments(query);

        await logAdminActivity(req.admin.id, "VIEW_USERS", "User", null, `Viewed ${users.length} users`, null, "success", req);

        res.json({
            users,
            pagination: {
                total: totalUsers,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalUsers / limit)
            }
        });

    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const subscription = await Subscription.findOne({ user: user._id });
        const invoiceCount = await Invoice.countDocuments({ user: user._id });
        const receiptCount = await Receipt.countDocuments({ user: user._id });

        await logAdminActivity(req.admin.id, "VIEW_USERS", "User", user._id, `Viewed user: ${user.email}`, null, "success", req);

        res.json({
            user,
            subscription,
            stats: {
                invoices: invoiceCount,
                receipts: receiptCount
            }
        });

    } catch (error) {
        console.error("Get user by ID error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Edit user details
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
exports.editUser = async (req, res) => {
    try {
        const { name, email, businessName, address, phone, emailVerified } = req.body;
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const changes = {
            before: {
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified
            }
        };

        if (name) user.name = name;
        if (email) user.email = email;
        if (businessName) user.businessName = businessName;
        if (address) user.address = address;
        if (phone) user.phone = phone;
        if (emailVerified !== undefined) user.emailVerified = emailVerified;

        await user.save();

        changes.after = {
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified
        };

        await logAdminActivity(req.admin.id, "EDIT_USER", "User", user._id, `Edited user: ${user.email}`, changes, "success", req);

        res.json({
            message: "User updated successfully",
            user: user
        });

    } catch (error) {
        console.error("Edit user error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Suspend user account
 * @route   POST /api/admin/users/:id/suspend
 * @access  Private/Admin
 */
exports.suspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // You can add a suspended field to User model, or mark via subscription
        // const subscription = await Subscription.findOne({ user: user._id });
        // if (subscription) {
        //     subscription.status = "cancelled";
        //     await subscription.save();
        // }
        user.suspended = true;
        await user.save();

        await logAdminActivity(req.admin.id, "SUSPEND_USER", "User", user._id, `Suspended user: ${user.email}`, null, "success", req);

        res.json({
            message: "User suspended successfully",
            user
        });

    } catch (error) {
        console.error("Suspend user error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Activate user account
 * @route   POST /api/admin/users/:id/activate
 * @access  Private/Admin
 */
exports.activateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.suspended = false;
        await user.save();

        await logAdminActivity(req.admin.id, "ACTIVATE_USER", "User", user._id, `Activated user: ${user.email}`, null, "success", req);

        res.json({
            message: "User activated successfully",
            user
        });

    } catch (error) {
        console.error("Activate user error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Delete user and all associated data
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete all user-associated data
        await Invoice.deleteMany({ user: user._id });
        await Receipt.deleteMany({ user: user._id });
        await Subscription.deleteOne({ user: user._id });
        await PaymentTransaction.deleteMany({ user: user._id });
        await User.findByIdAndDelete(user._id);

        await logAdminActivity(req.admin.id, "DELETE_USER", "User", user._id, `Deleted user: ${user.email}`, null, "success", req);

        res.json({
            message: "User and associated data deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ========== ANALYTICS & DASHBOARD ==========

/**
 * @desc    Get dashboard overview stats
 * @route   GET /api/admin/dashboard/overview
 * @access  Private/Admin
 */
exports.getDashboardOverview = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ emailVerified: true });
        const totalInvoices = await Invoice.countDocuments();
        const totalReceipts = await Receipt.countDocuments();

        const subscriptions = await Subscription.aggregate([
            {
                $group: {
                    _id: "$plan",
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = await PaymentTransaction.aggregate([
            { $match: { status: "success" } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        await logAdminActivity(req.admin.id, "VIEW_ANALYTICS", "System", null, "Viewed dashboard overview", null, "success", req);

        res.json({
            users: {
                total: totalUsers,
                verified: verifiedUsers,
                unverified: totalUsers - verifiedUsers
            },
            documents: {
                invoices: totalInvoices,
                receipts: totalReceipts
            },
            subscriptions: subscriptions.reduce((acc, sub) => {
                acc[sub._id] = sub.count;
                return acc;
            }, {}),
            revenue: {
                total: totalRevenue[0]?.total || 0,
                currency: "NGN"
            }
        });

    } catch (error) {
        console.error("Get dashboard overview error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get analytics for a specific period
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
exports.getAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const query = dateFilter ? { createdAt: dateFilter } : {};

        const userSignups = await User.countDocuments(query);
        const invoicesCreated = await Invoice.countDocuments(query);
        const receiptsGenerated = await Receipt.countDocuments(query);
        const paymentsProcessed = await PaymentTransaction.countDocuments({ ...query, status: "success" });

        const revenue = await PaymentTransaction.aggregate([
            { $match: { ...query, status: "success" } },
            {
                $group: {
                    _id: "$plan",
                    amount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        await logAdminActivity(req.admin.id, "VIEW_ANALYTICS", "System", null, "Viewed analytics report", null, "success", req);

        res.json({
            period: { startDate, endDate },
            userSignups,
            invoicesCreated,
            receiptsGenerated,
            paymentsProcessed,
            revenue
        });

    } catch (error) {
        console.error("Get analytics error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ========== PAYMENT TRACKING ==========

/**
 * @desc    Get all payment transactions
 * @route   GET /api/admin/payments
 * @access  Private/Admin
 */
exports.getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "", plan = "", sortBy = "createdAt", order = "desc" } = req.query;

        const query = {};
        if (status) query.status = status;
        if (plan) query.plan = plan;

        const payments = await PaymentTransaction.find(query)
            .populate("user", "email name businessName")
            .sort({ [sortBy]: order === "desc" ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await PaymentTransaction.countDocuments(query);

        await logAdminActivity(req.admin.id, "VIEW_PAYMENTS", "Payment", null, `Viewed ${payments.length} payments`, null, "success", req);

        res.json({
            payments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Get all payments error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get subscription management data
 * @route   GET /api/admin/subscriptions
 * @access  Private/Admin
 */
exports.getSubscriptions = async (req, res) => {
    try {
        const { page = 1, limit = 20, plan = "", status = "", sortBy = "createdAt", order = "desc" } = req.query;

        const query = {};
        if (plan) query.plan = plan;
        if (status) query.status = status;

        const subscriptions = await Subscription.find(query)
            .populate("user", "email name businessName")
            .sort({ [sortBy]: order === "desc" ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Subscription.countDocuments(query);

        // Get subscription breakdown
        const breakdown = await Subscription.aggregate([
            {
                $group: {
                    _id: "$plan",
                    count: { $sum: 1 }
                }
            }
        ]);

        await logAdminActivity(req.admin.id, "VIEW_PAYMENTS", "Subscription", null, `Viewed ${subscriptions.length} subscriptions`, null, "success", req);

        res.json({
            subscriptions,
            breakdown: breakdown.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Get subscriptions error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get subscription by user ID
 * @route   GET /api/admin/users/:id/subscription
 * @access  Private/Admin
 */
exports.getUserSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.params.id
        }).lean();

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        res.json(subscription);
    } catch (error) {
        console.error("Get user subscription error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


/**
 * @desc    Update user subscription (admin override)
 * @route   PUT /api/admin/users/:id/subscription
 * @access  Private/Admin
 */
exports.updateUserSubscription = async (req, res) => {
    try {
        const { plan, status } = req.body;

        const subscription = await Subscription.findOne({
            user: req.params.id
        });

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        const changes = {
            before: {
                plan: subscription.plan,
                status: subscription.status
            }
        };

        // if (plan) subscription.plan = plan;
        // if (status) subscription.status = status;

        const billingCycle = subscription.billingCycle;
        const currentDate = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "yearly" ? 12 : 1));
        const getLimitsForPlan = (plan) => {
            // const limits = {
            //     free: { invoicesCreated: 100, receiptsGenerated: 100, emailsSent: 100 },
            //     premium: { invoicesCreated: 1000, receiptsGenerated: 1000, emailsSent: 1000 },
            //     business: { invoicesCreated: Infinity, receiptsGenerated: Infinity, emailsSent: Infinity }
            // };
            const planLimits = {
                free: {
                    invoicesPerMonth: -1,
                    receiptsPerMonth: -1,
                    emailsPerMonth: 5,
                    templatesAccess: ["classic", "minimal"],
                    hasAds: true
                },
                premium: {
                    invoicesPerMonth: -1,
                    receiptsPerMonth: -1,
                    emailsPerMonth: 50,
                    templatesAccess: ["classic", "modern", "minimal", "elegant"],
                    hasAds: false
                },
                business: {
                    invoicesPerMonth: -1, // unlimited
                    receiptsPerMonth: -1,
                    emailsPerMonth: 200,
                    templatesAccess: ["classic", "modern", "minimal", "elegant", "creative", "corporate"],
                    hasAds: false
                }
            };
            return planLimits[plan];
        }

        if (subscription) {
            if (plan) subscription.plan = plan;
            if (status) subscription.status = status;
            subscription.currentPeriodStart = currentDate;
            subscription.currentPeriodEnd = periodEnd;
            // subscription.limits = getLimitsForPlan(plan); // Assume this function returns limits based on plan
            subscription.limits = subscription.canUseFeature()
            await subscription.save();
        }


        changes.after = {
            plan: subscription.plan,
            status: subscription.status
        };

        await logAdminActivity(
            req.admin.id,
            "EDIT_SUBSCRIPTION",
            "Subscription",
            subscription._id,
            "Admin updated user subscription",
            changes,
            "success",
            req
        );

        res.json({
            message: "Subscription updated successfully",
            subscription
        });
    } catch (error) {
        console.error("Update subscription error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


/**
 * @desc    Edit subscription (upgrade/downgrade)
 * @route   PUT /api/admin/subscriptions/:id
 * @access  Private/Admin
 */
exports.editSubscription = async (req, res) => {
    try {
        const { plan, status } = req.body;

        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        const changes = {
            before: { plan: subscription.plan, status: subscription.status }
        };

        const billingCycle = subscription.billingCycle;
        const currentDate = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "yearly" ? 12 : 1));

        if (subscription) {
            if (plan) subscription.plan = plan;
            if (status) subscription.status = status;
            subscription.currentPeriodStart = currentDate;
            subscription.currentPeriodEnd = periodEnd;
            // subscription.limits = getLimitsForPlan(plan); // Assume this function returns limits based on plan
            subscription.limits = subscription.canUseFeature()
            await subscription.save();
        }

        changes.after = { plan: subscription.plan, status: subscription.status };

        await logAdminActivity(req.admin.id, "EDIT_SUBSCRIPTION", "Subscription", subscription._id, `Edited subscription`, changes, "success", req);

        res.json({
            message: "Subscription updated successfully",
            subscription
        });

    } catch (error) {
        console.error("Edit subscription error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ========== ACTIVITY LOGS ==========

/**
 * @desc    Get admin activity logs
 * @route   GET /api/admin/activity-logs
 * @access  Private/Admin
 */
exports.getActivityLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, action = "", resource = "", sortBy = "createdAt", order = "desc" } = req.query;

        const query = {};
        if (action) query.action = action;
        if (resource) query.resource = resource;

        const logs = await AdminActivityLog.find(query)
            .populate("admin", "name email")
            .sort({ [sortBy]: order === "desc" ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await AdminActivityLog.countDocuments(query);

        res.json({
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Get activity logs error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ========== DATA EXPORT ==========

/**
 * @desc    Export users data
 * @route   GET /api/admin/export/users
 * @access  Private/Admin
 */
exports.exportUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").lean();

        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename=users-export-${Date.now()}.json`);

        await logAdminActivity(req.admin.id, "EXPORT_DATA", "User", null, `Exported ${users.length} users`, null, "success", req);

        res.json(users);

    } catch (error) {
        console.error("Export users error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = exports;