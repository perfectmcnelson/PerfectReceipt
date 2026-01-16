// Run this script once to create your first super admin account
// Usage: node scripts/createAdmin.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("../config/db");

const Admin = require("../models/Admin");

dotenv.config({ path: '../.env' });

const createAdmin = async () => {
    try {
        connectDB()

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
        if (existingAdmin) {
            console.log("❌ Admin with this email already exists");
            process.exit(1);
        }

        // Create super admin
        const admin = await Admin.create({
            name: process.env.ADMIN_NAME || "Admin",
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: "super_admin",
            permissions: {
                userManagement: {
                    view: true,
                    edit: true,
                    delete: true
                },
                subscriptionManagement: {
                    view: true,
                    edit: true
                },
                analyticsAccess: {
                    view: true
                },
                paymentTracking: {
                    view: true
                }
            },
            active: true
        });

        console.log("✅ Super admin created successfully!");
        console.log(`Email: ${admin.email}`);
        console.log(`Name: ${admin.name}`);
        console.log(`Role: ${admin.role}`);

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Error creating admin:", error.message);
        process.exit(1);
    }
};

createAdmin();
