const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },
        role: {
            type: String,
            enum: ["super_admin", "admin"],
            default: "admin"
        },
        permissions: {
            userManagement: {
                view: { type: Boolean, default: true },
                edit: { type: Boolean, default: true },
                delete: { type: Boolean, default: false }
            },
            subscriptionManagement: {
                view: { type: Boolean, default: true },
                edit: { type: Boolean, default: true }
            },
            analyticsAccess: {
                view: { type: Boolean, default: true }
            },
            paymentTracking: {
                view: { type: Boolean, default: true }
            }
        },
        active: {
            type: Boolean,
            default: true
        },
        lastLogin: Date,
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: Date
    },
    { timestamps: true }
);

// Password hashing middleware
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if account is locked
adminSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model("Admin", adminSchema);