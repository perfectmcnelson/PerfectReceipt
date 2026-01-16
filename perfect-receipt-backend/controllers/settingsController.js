// controllers/settingsController.js

const Settings = require("../models/Settings");
const Subscription = require("../models/Subscription");

// Template availability by subscription plan
const TEMPLATE_PLANS = {
    free: ["classic", "minimal"],
    premium: ["classic", "modern", "minimal", "elegant"],
    business: ["classic", "modern", "minimal", "elegant", "creative", "corporate"]
};

// @desc    Get user settings with subscription-based template access
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ user: req.user.id });
        
        // Create default settings if none exist
        if (!settings) {
            settings = await Settings.create({
                user: req.user.id,
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
                    // paymentReceived: true,
                    // weeklyReport: false
                },
            });
        }
        
        // Fetch user's subscription plan
        const subscription = await Subscription.findOne({ user: req.user.id });
        const userPlan = subscription?.plan || "free";
        const availableTemplates = TEMPLATE_PLANS[userPlan] || TEMPLATE_PLANS.free;
        
        // Return settings with subscription info
        res.json({
            ...settings.toObject(),
            subscription: {
                plan: userPlan,
                availableTemplates: availableTemplates
            }
        });
    } catch (error) {
        console.error("Get settings error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update settings with validation
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ user: req.user.id });
        
        // Fetch subscription to validate template access
        const subscription = await Subscription.findOne({ user: req.user.id });
        const userPlan = subscription?.plan || "free";
        const availableTemplates = TEMPLATE_PLANS[userPlan] || TEMPLATE_PLANS.free;
        
        // Validate template selections are allowed for user's plan
        if (req.body.branding?.invoiceTemplate && 
            !availableTemplates.includes(req.body.branding.invoiceTemplate)) {
            return res.status(403).json({ 
                message: `Invoice template '${req.body.branding.invoiceTemplate}' is not available on your ${userPlan} plan. Available templates: ${availableTemplates.join(', ')}` 
            });
        }
        
        if (req.body.branding?.receiptTemplate && 
            !availableTemplates.includes(req.body.branding.receiptTemplate)) {
            return res.status(403).json({ 
                message: `Receipt template '${req.body.branding.receiptTemplate}' is not available on your ${userPlan} plan. Available templates: ${availableTemplates.join(', ')}` 
            });
        }
        
        if (!settings) {
            settings = await Settings.create({ user: req.user.id, ...req.body });
        } else {
            // Deep merge for nested objects
            if (req.body.invoiceDefaults) {
                settings.invoiceDefaults = { ...settings.invoiceDefaults, ...req.body.invoiceDefaults };
            }
            if (req.body.branding) {
                settings.branding = { ...settings.branding, ...req.body.branding };
            }
            if (req.body.notifications) {
                settings.notifications = { ...settings.notifications, ...req.body.notifications };
            }
            // if (req.body.emailTemplates) {
            //     settings.emailTemplates = { ...settings.emailTemplates, ...req.body.emailTemplates };
            // }
            
            await settings.save();
        }
        
        res.json({ 
            message: "Settings updated successfully", 
            settings,
            subscription: {
                plan: userPlan,
                availableTemplates: availableTemplates
            }
        });
    } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
