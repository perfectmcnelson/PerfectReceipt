const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription"
        },
        reference: {
            type: String,
            required: true,
            unique: true
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "NGN"
        },
        status: {
            type: String,
            enum: ["pending", "success", "failed", "abandoned"],
            default: "pending"
        },
        paymentMethod: String,
        paystackReference: String,
        plan: {
            type: String,
            enum: ["premium", "business"]
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"]
        },
        metadata: {
            type: Object
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);