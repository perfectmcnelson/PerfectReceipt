const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        plan: {
            type: String,
            enum: ["free", "premium", "business"],
            default: "free"
        },
        status: {
            type: String,
            enum: ["active", "cancelled", "expired", "past_due"],
            default: "active"
        },
        // Paystack details
        paystackCustomerCode: String,
        paystackSubscriptionCode: String,
        paystackAuthorizationCode: String,
        
        // Billing
        amount: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: "NGN"
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            default: "monthly"
        },
        
        // Dates
        startDate: {
            type: Date,
            default: Date.now
        },
        currentPeriodStart: Date,
        currentPeriodEnd: Date,
        cancelledAt: Date,
        
        // Usage tracking
        usage: {
            invoicesCreated: {
                type: Number,
                default: 0
            },
            receiptsGenerated: {
                type: Number,
                default: 0
            },
            emailsSent: {
                type: Number,
                default: 0
            }
        },
        
        // Plan limits
        limits: {
            invoicesPerMonth: Number,
            receiptsPerMonth: Number,
            emailsPerMonth: Number,
            templatesAccess: [String],
            hasAds: Boolean
        }
    },
    { timestamps: true }
);

// Method to check if feature is allowed
subscriptionSchema.methods.canUseFeature = function(feature) {
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

    return planLimits[this.plan];
};

module.exports = mongoose.model("Subscription", subscriptionSchema);