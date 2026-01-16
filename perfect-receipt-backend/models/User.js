const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: String,                // hashed token for email verification
        verificationTokenExpires: Date,
        businessName: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            default: ""
        },
        authMethod: {
            type: String,
            enum: ['google', 'manual'],
            default: 'manual'
        },
        google: {
            refreshToken: { type: String },  // store refresh token and when connected
            connectedAt: { type: Date }
        },
        suspended: {
            type: Boolean,
            default: false
        },
        businessLogo: {
            type: String,
            default: ""
        },
        profilePicture: {
            type: String,
            default: ""
        },
        brandColor: {
            type: String,
            default: '#1e40af' // default blue
        },
        // Security
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: {
            type: String,
            select: false
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
        
        // OAuth
        googleId: { 
            type: String
        },
        // authProvider: {
        //     type: String,
        //     enum: ["local", "google"],
        //     default: "local"
        // },
        
        // Last login
        lastLogin: Date
    },
    { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password =  await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema)