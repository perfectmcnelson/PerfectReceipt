const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

/**
 * Middleware to protect admin routes - verifies JWT token
 * Attaches admin data to req.admin
 */
exports.adminAuth = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized to access this route here" });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
            
            if (!decoded.isAdmin) {
                return res.status(401).json({ message: "Invalid admin token" });
            }

            // Get admin from token
            const admin = await Admin.findById(decoded.id);
            
            if (!admin) {
                return res.status(401).json({ message: "Admin not found" });
            }

            if (!admin.active) {
                return res.status(401).json({ message: "Admin account is inactive" });
            }

            req.admin = admin;
            next();

        } catch (err) {
            return res.status(401).json({ message: "Not authorized to access this route" });
        }

    } catch (error) {
        console.error("Admin auth middleware error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Middleware to check if admin is super_admin
 * Must be used after adminAuth middleware
 */
exports.superAdminOnly = (req, res, next) => {
    if (req.admin.role !== "super_admin") {
        return res.status(403).json({ 
            message: "Access denied. Super admin only.",
            requiredRole: "super_admin",
            userRole: req.admin.role
        });
    }
    next();
};

/**
 * Middleware to check specific permissions
 * Usage: checkPermission("userManagement", "delete")
 */
exports.checkPermission = (resource, action) => {
    return (req, res, next) => {
        const permissions = req.admin.permissions;

        if (!permissions[resource]) {
            return res.status(403).json({ 
                message: `Resource '${resource}' not found in permissions`
            });
        }

        if (!permissions[resource][action]) {
            return res.status(403).json({ 
                message: `Permission denied. Action '${action}' not allowed on '${resource}'`
            });
        }

        next();
    };
};

/**
 * Middleware to check multiple permissions
 * Usage: checkMultiplePermissions([{resource: "userManagement", action: "view"}])
 */
exports.checkMultiplePermissions = (requiredPermissions) => {
    return (req, res, next) => {
        const permissions = req.admin.permissions;

        for (const perm of requiredPermissions) {
            if (!permissions[perm.resource] || !permissions[perm.resource][perm.action]) {
                return res.status(403).json({ 
                    message: `Permission denied. Missing: ${perm.resource}.${perm.action}`
                });
            }
        }

        next();
    };
};

/**
 * Optional middleware to log all admin routes
 */
exports.logAdminRoute = (req, res, next) => {
    console.log(`[ADMIN ROUTE] ${req.method} ${req.path} - Admin: ${req.admin?.email || "unknown"}`);
    next();
};

module.exports = exports;