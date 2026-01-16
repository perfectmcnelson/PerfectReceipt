const jwt = require("jsonwebtoken");
const User = require("../models/User");
const VerificationCode = require("../models/VerificationCode")
const Subscription = require("../models/Subscription");
const Settings = require("../models/Settings");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const { google } = require('googleapis');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const {cloudinary} = require("../utils/uploadConfig");
const sharp = require("sharp");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: Generate JWT
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};


// Email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Test connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service error:', error);
    } else {
        console.log('✅ Email service ready');
    }
});


// --------------->> 2FA Controllers

// @desc    Enable 2FA - Generate QR code
// @route   POST /api/auth/2fa/enable
// @access  Private
exports.enable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("+twoFactorSecret");
        
        if (user.twoFactorEnabled) {
            return res.status(400).json({ message: "2FA is already enabled" });
        }
        
        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `PerfectReceipt (${user.email})`,
            issuer: "PerfectReceipt"
        });
        
        // Save secret (but don't enable yet - wait for verification)
        user.twoFactorSecret = secret.base32;
        await user.save();
        
        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
        
        res.json({
            message: "Scan this QR code with your authenticator app",
            qrCode: qrCodeUrl,
            secret: secret.base32,
            manualEntryKey: secret.base32
        });
        
    } catch (error) {
        console.error("Enable 2FA error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Verify and confirm 2FA setup
// @route   POST /api/auth/2fa/verify
// @access  Private
exports.verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id).select("+twoFactorSecret");
        
        if (!user.twoFactorSecret) {
            return res.status(400).json({ message: "2FA not initialized" });
        }
        
        // Verify token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 2
        });
        
        if (!verified) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        
        // Enable 2FA
        user.twoFactorEnabled = true;
        await user.save();
        
        res.json({ message: "2FA enabled successfully" });
        
    } catch (error) {
        console.error("Verify 2FA error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findById(req.user.id).select("+password +twoFactorSecret");
        
        // Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        
        // Verify 2FA token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 2
        });
        
        if (!verified) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        
        // Disable 2FA
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();
        
        res.json({ message: "2FA disabled successfully" });
        
    } catch (error) {
        console.error("Disable 2FA error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Verify 2FA during login
// @route   POST /api/auth/2fa/verify-login
// @access  Public
exports.verify2FALogin = async (req, res) => {
    try {
        const { email, token } = req.body;
        const user = await User.findOne({ email }).select("+twoFactorSecret");
        
        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: "Invalid request" });
        }
        
        // Verify token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 2
        });
        
        if (!verified) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Return JWT token
        const jwtToken = generateToken(user._id);
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: jwtToken,
            businessName: user.businessName || "",
            address: user.address || "",
            phone: user.phone || "",
            profilePicture: user.profilePicture || "",
            businessLogo: user.businessLogo || ""
        });
        
    } catch (error) {
        console.error("Verify 2FA login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Password Reset

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "No account with that email found" });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        
        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request - PerfectReceipt",
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({ message: "Password reset email sent" });
        
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Failed to send reset email", error: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        // Hash token and find user
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }
        
        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        res.json({ message: "Password reset successful. You can now login with your new password." });
        
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// --------------->> Data Export

// @desc    Export all user data
// @route   GET /api/auth/export-data
// @access  Private
exports.exportUserData = async (req, res) => {
    try {
        const Invoice = require("../models/Invoice");
        const Receipt = require("../models/Receipt");
        const Subscription = require("../models/Subscription");
        const Settings = require("../models/Settings");
        
        const user = await User.findById(req.user.id).select("-password");
        const invoices = await Invoice.find({ user: req.user.id });
        const receipts = await Receipt.find({ user: req.user.id });
        const subscription = await Subscription.findOne({ user: req.user.id });
        const settings = await Settings.findOne({ user: req.user.id });
        
        const exportData = {
            exportDate: new Date().toISOString(),
            user,
            invoices,
            receipts,
            subscription,
            settings
        };
        
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename=perfectreceipt-data-export-${Date.now()}.json`);
        res.json(exportData);
        
    } catch (error) {
        console.error("Export data error:", error);
        res.status(500).json({ message: "Failed to export data", error: error.message });
    }
};


// --------------->> Google OAuth

// @desc    Login Via Google
// @route   GET /api/auth/google
// @access  Private
exports.googleAuth = async (req, res) => {
    try {
        // const idToken =  req.body.credential || req.body.token

        // if (!idToken) {
        //     return res.status(400).json({ message: "Google token is required" });
        // }
        console.log('Incoming body:', req.body);
        const idToken = req.body.credential;

        if (!idToken || typeof idToken !== 'string') {
            console.error("Invalid credential", idToken);
            return res.status(400).json({ message: "Google credential must be a string" });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error("GOOGLE_CLIENT_ID not set in environment variables");
            return res.status(500).json({ message: "Server configuration error" });
        }

        // Verify Google token
        let ticket;
        try {
            ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
        } catch (error) {
            console.error("Token verification error:", error.message);
            return res.status(401).json({ 
                message: "Invalid Google token", 
                error: error.message 
            });
        }
        
        const payload = ticket.getPayload();
        console.log(payload)
        const { sub: googleId, email, name, picture, email_verified } = payload;

        if (!email) {
            return res.status(400).json({ message: "Unable to retrieve email from Google" });
        }
        
        // Find or create user
        let user = await User.findOne({ email });

        // 🚫 Block suspended users (Google login)
        if (user && user.suspended) {
            return res.status(403).json({
                code: "ACCOUNT_SUSPENDED",
                message: "Your account has been suspended"
            });
        }
        
        if (!user) {
            const crypto = require("crypto");
            user = await User.create({
                email,
                name: name || email.split('@')[0],
                googleId,
                profilePicture: picture,
                emailVerified: !!email_verified,
                authMethod: 'google',
                password: crypto.randomBytes(32).toString("hex"), // Random password
            });

            // Create default subscription for new user with all period dates
            const now = new Date();
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            
            await Subscription.create({
                user: user._id,
                plan: "free",
                status: "active",
                billingCycle: "monthly",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                limits: {
                    invoicesPerMonth: -1,
                    receiptsPerMonth: -1,
                    emailsPerMonth: 5,
                    templatesAccess: ["classic", "minimal"],
                    hasAds: true
                },
                usage: {
                    invoicesCreated: 0,
                    receiptsGenerated: 0,
                    emailsSent: 0
                }
            });

            // Create default settings for new user with all nested defaults
            await Settings.create({
                user: user._id,
                invoiceDefaults: {
                    paymentTerms: "Net 30",
                    currency: "NGN",
                    taxEnabled: true,
                    defaultTaxRate: 7.5,
                    taxLabel: "VAT",
                    defaultNotes: "",
                    invoicePrefix: "INV",
                    invoiceStartingNumber: 1,
                    receiptPrefix: "RCP",
                    receiptStartingNumber: 1
                },
                branding: {
                    primaryColor: "#1e40af",
                    defaultTemplate: "classic",
                    invoiceTemplate: "classic",
                    receiptTemplate: "classic",
                    invoiceColor: "",
                    receiptColor: ""
                },
                notifications: {
                    emailNotifications: true,
                    invoiceReminders: true,
                    paymentReceived: true,
                    weeklyReport: false
                }
            });

        } else if (!user.suspended) {
            // Update existing unverified user to verified via Google
            user.authMethod = 'google';
            if (!user.profilePicture && picture) {
                user.profilePicture = picture;
            }

            if (email_verified) user.emailVerified = true;
            
            await user.save();
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        const token = generateToken(user._id);
        
        res.json({
            _id: user._id,
            email: user.email,
            token,
            name: user.name,
            emailVerified: user.emailVerified,
            businessName: user.businessName || "",
            address: user.address || "",
            phone: user.phone || "",
            profilePicture: user.profilePicture || "",
            businessLogo: user.businessLogo || "",
            message: "Login successful!"
        });
    } catch (error) {
        console.error('Google sign-in error:', error);
        res.status(500).json({ 
            message: "Google authentication failed", 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};


// --------------->> Email Verification

// Send Verification Email
exports.sendVerificationEmail = async (email, code) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${code}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h2>Email Verification</h2>
        <p>Thank you for signing up! Click the link below to verify your email:</p>
        <a href="${verificationLink}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p>Or enter this code: <strong>${code}</strong></p>
        <p>This link expires in 24 hours.</p>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

// Resend Verification Email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.emailVerified) {
        return res.status(400).json({ error: 'Email already verified' });
    }
    
    // Delete old codes
    await VerificationCode.deleteMany({ userId: user._id });
    
    // Generate new code
    const verificationCode = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await VerificationCode.create({
        userId: user._id,
        code: verificationCode,
        expiresAt
    });
    
    // Send email
    try {
        await exports.sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
        console.error('Failed to resend email:', emailError);
        throw emailError;
    }

    res.json({ message: 'Verification email resent successfully' });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ error: 'Failed to resend email' });
  }
};

// Verify Email

exports.verifyEmailByToken = async (req, res) => {
  try {
    const { token } = req.params; // from URL: /api/auth/verify-email/:token
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }
    
    // Find verification code by token
    const verCodeObj = await VerificationCode.findOne({ code: token });
    
    if (!verCodeObj) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }
    
    // Check expiration
    if (new Date() > verCodeObj.expiresAt) {
      await VerificationCode.deleteOne({ _id: verCodeObj._id });
      return res.status(400).json({ error: 'Verification token expired' });
    }
    
    // Update user
    const user = await User.findById(verCodeObj.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.emailVerified = true;
    await user.save();
    
    // Delete used code
    await VerificationCode.deleteOne({ _id: verCodeObj._id });
    
    // Generate token
    const authToken = generateToken(user._id);
    
    res.json({
        _id: user._id,
        email: user.email,
        name: user.name,
        token: authToken,
        emailVerified: user.emailVerified,
        redirectUrl: '/dashboard'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

exports.verifyEmailByCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Verification code required' });
    }
    
    // Find verification code
    const verCodeObj = await VerificationCode.findOne({ code });
    
    if (!verCodeObj) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Check expiration
    if (new Date() > verCodeObj.expiresAt) {
      await VerificationCode.deleteOne({ _id: verCodeObj._id });
      return res.status(400).json({ error: 'Verification code expired' });
    }
    
    // Update user
    const user = await User.findById(verCodeObj.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.emailVerified = true;
    await user.save();
    
    // Delete used code
    await VerificationCode.deleteOne({ _id: verCodeObj._id });
    
    // Generate token
    const authToken = generateToken(user._id);
    
    // res.json({
    //   token: authToken,
    //   user: {
    //     _id: user._id,
    //     email: user.email,
    //     name: user.name,
    //     emailVerified: user.emailVerified,
    //     redirectUrl: '/dashboard'
    //   }
    // });
    res.json({
        _id: user._id,
        token: authToken,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        redirectUrl: '/dashboard'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// --------------->> Profile / Logo Uploads

// Upload profile picture
// exports.uploadProfilePicture = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded" });
//         }

//         const user = await User.findById(req.user.id);

//         // Optional: Delete old image from Cloudinary
//         if (user.profilePicture) {
//             const publicId = user.profilePicture.split('/').slice(-2).join('/').split('.')[0];
//             await cloudinary.uploader.destroy(publicId);
//         }

//         user.profilePicture = req.file.path;
//         await user.save();

//         res.json({
//             message: "Profile picture uploaded successfully",
//             profilePicture: user.profilePicture
//         });
//     } catch (error) {
//         // catch (error) {
//         if (error.message.includes("File size too large")) {
//             return res.status(413).json({
//                 message: "Image too large. Max size is 10MB.",
//             });
//         }

//         res.status(500).json({
//             message: "Upload failed. Please try again.",
//         });
//         // }
//         // res.status(500).json({ message: "Upload failed", error: error.message });
//     }
// };

// // Upload business logo
// exports.uploadBusinessLogo = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded" });
//         }

//         const user = await User.findById(req.user.id);

//         // Optional: Delete old image from Cloudinary
//         if (user.businessLogo) {
//             const publicId = user.businessLogo.split('/').slice(-2).join('/').split('.')[0];
//             await cloudinary.uploader.destroy(publicId);
//         }

//         user.businessLogo = req.file.path;
//         await user.save();

//         res.json({
//             message: "Business logo uploaded successfully",
//             businessLogo: user.businessLogo
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Upload failed", error: error.message });
//     }
// };

// --------------------
// Helper: upload buffer to Cloudinary
// --------------------
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        resolve(result);
      }
    ).end(buffer);
  });
};

// --------------------
// UPLOAD PROFILE PICTURE
// --------------------
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const processedImage = await sharp(req.file.buffer)
      .resize(400, 400)
      .jpeg({ quality: 80 })
      .toBuffer();

    const result = await uploadToCloudinary(
      processedImage,
      "profile-pictures"
    );

    const user = await User.findById(req.user.id);

    if (user.profilePicture) {
      const publicId = user.profilePicture
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    user.profilePicture = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    if (error.message?.includes("File size")) {
      return res.status(413).json({
        message: "Image too large",
      });
    }

    res.status(500).json({
      message: "Profile picture upload failed",
      error: error.message,
    });
  }
};

// --------------------
// UPLOAD BUSINESS LOGO
// --------------------
exports.uploadBusinessLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const processedLogo = await sharp(req.file.buffer)
      .resize(500, 500, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png({ quality: 80 })
      .toBuffer();

    const result = await uploadToCloudinary(
      processedLogo,
      "business-logos"
    );

    const user = await User.findById(req.user.id);

    if (user.businessLogo) {
      const publicId = user.businessLogo
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    user.businessLogo = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "Business logo uploaded successfully",
      businessLogo: user.businessLogo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Business logo upload failed",
      error: error.message,
    });
  }
};



// --------------->> Auth Routes

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const {name, email, password} = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({message: "Please fill all fields."});
        }

        // Check if user exists
        const userExists = await User.findOne({email});
        if (userExists) {
            return res.status(400).json({message: "User with email already registered"});
        }

        // Create User
        const user = await User.create({name, email, password, emailVerified: false, authMethod: "manual"});

        console.log(user)
        
        // Create default subscription with all proper fields and dates
        const now = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        
        await Subscription.create({
            user: user._id,
            plan: "free",
            status: "active",
            billingCycle: "monthly",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            limits: {
                invoicesPerMonth: -1,
                receiptsPerMonth: -1,
                emailsPerMonth: 5,
                templatesAccess: ["classic", "minimal"],
                hasAds: true
            },
            usage: {
                invoicesCreated: 0,
                receiptsGenerated: 0,
                emailsSent: 0
            }
        });

        // Create default settings with all nested defaults
        await Settings.create({
            user: user._id,
            invoiceDefaults: {
                paymentTerms: "Net 30",
                currency: "NGN",
                taxEnabled: true,
                defaultTaxRate: 7.5,
                taxLabel: "VAT",
                defaultNotes: "",
                invoicePrefix: "INV",
                invoiceStartingNumber: 1,
                receiptPrefix: "RCP",
                receiptStartingNumber: 1
            },
            branding: {
                primaryColor: "#1e40af",
                defaultTemplate: "classic",
                invoiceTemplate: "classic",
                receiptTemplate: "classic",
                invoiceColor: "",
                receiptColor: ""
            },
            notifications: {
                emailNotifications: true,
                invoiceReminders: true,
                paymentReceived: true,
                weeklyReport: false
            },
        });

        // Generate verification code
        const verificationCode = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        await VerificationCode.create({
            userId: user._id,
            code: verificationCode,
            expiresAt
        });

        // Send verification email
        try {
            await exports.sendVerificationEmail(email, verificationCode);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail the registration, but log it
            // User can request resend later
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const authToken = generateToken(user._id);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: authToken,
                emailVerified: user.emailVerified,
                businessName: user.businessName || "",
                address: user.address || "",
                phone: user.phone || "",
                profilePicture: user.profilePicture || "",
                businessLogo: user.businessLogo || "",
                message: "Registration successful! Please check your email to verify your account."
            });
        } else {
            res.status(400).json({message: "Invalid user data"})
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({message: "Server error", error: error.message || "Registration failed"});
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    // include password field (assuming password field is select: false on schema)
    const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");

    // if no user or password doesn't match
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (user.suspended) {
        return res.status(403).json({
            code: "ACCOUNT_SUSPENDED",
            message: "Your account has been suspended"
        });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Block unverified manual users
    if (!user.emailVerified && user.authMethod === "manual") {
        return res.status(403).json({
            code: "EMAIL_NOT_VERIFIED",
            message: "Please verify your email before logging in."
        });
    }


    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        token: generateToken(user._id),
        businessName: user.businessName || "",
        address: user.address || "",
        phone: user.phone || "",
        profilePicture: user.profilePicture || "",
        businessLogo: user.businessLogo || "",
        message: "Login successful!",
    });

  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified || false,
            businessName: user.businessName || "",
            address: user.address || "",
            phone: user.phone || "",
            logo: user.logo || "",
            twoFactorEnabled: user.twoFactorEnabled || false,
            profilePicture: user.profilePicture || "",
            businessLogo: user.businessLogo || "",
            suspended: user.suspended || false,
        });

        // res.json(user)

    } catch (error) {
        res.status(500).json({message: "Server error - Failed to fetch user", error: error.message});
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateUserProfile = async (req, res) => {

    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.businessName = req.body.businessName || user.businessName;
            user.address = req.body.address || user.address;
            user.phone = req.body.phone || user.phone;

            const updatedUser = await user.save()

            // res.json({
            //     _id: updatedUser._id,
            //     name: updatedUser.name,
            //     email: updatedUser.email,
            //     businessName: updatedUser.businessName,
            //     address: updatedUser.address,
            //     phone: updatedUser.phone,
            // });

            res.json(updatedUser)
        } else {
            res.status(404).json({message: "User not found."})
        }
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};
