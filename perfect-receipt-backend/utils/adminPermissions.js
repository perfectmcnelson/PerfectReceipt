
/**
 * Default permission profiles
 */
const PERMISSION_PROFILES = {
    super_admin: {
        userManagement: { view: true, edit: true, delete: true },
        subscriptionManagement: { view: true, edit: true },
        analyticsAccess: { view: true },
        paymentTracking: { view: true }
    },
    admin: {
        userManagement: { view: true, edit: true, delete: false },
        subscriptionManagement: { view: true, edit: true },
        analyticsAccess: { view: true },
        paymentTracking: { view: true }
    },
    moderator: {
        userManagement: { view: true, edit: true, delete: false },
        subscriptionManagement: { view: true, edit: false },
        analyticsAccess: { view: true },
        paymentTracking: { view: false }
    },
    viewer: {
        userManagement: { view: true, edit: false, delete: false },
        subscriptionManagement: { view: true, edit: false },
        analyticsAccess: { view: true },
        paymentTracking: { view: false }
    }
};

/**
 * Get permissions for a role
 */
exports.getPermissionsForRole = (role) => {
    return PERMISSION_PROFILES[role] || PERMISSION_PROFILES.viewer;
};

/**
 * Check if admin has specific permission
 */
exports.hasPermission = (admin, resource, action) => {
    return admin.permissions[resource] && admin.permissions[resource][action];
};

/**
 * Check if admin has any of multiple permissions
 */
exports.hasAnyPermission = (admin, requiredPermissions) => {
    return requiredPermissions.some(perm => 
        admin.permissions[perm.resource] && admin.permissions[perm.resource][perm.action]
    );
};

/**
 * Check if admin has all required permissions
 */
exports.hasAllPermissions = (admin, requiredPermissions) => {
    return requiredPermissions.every(perm => 
        admin.permissions[perm.resource] && admin.permissions[perm.resource][perm.action]
    );
};

module.exports = exports;