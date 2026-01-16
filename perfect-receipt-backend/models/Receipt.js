const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Invoice",
            required: true,
            unique: true  // One receipt per invoice
        },
        receiptNumber: {
            type: String,
            required: true,
            // unique: true
        },
        receiptDate: {
            type: Date,
            default: Date.now
        },
        // Payment Information
        paymentMethod: {
            type: String,
            enum: ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Check", "PayPal", "Other"],
            default: "Cash"
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        transactionId: {
            type: String,
            default: ""
        },
        // Amount Information
        amountPaid: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "USD"
        },
        // Copied from Invoice (for historical record)
        billFrom: {
            businessName: String,
            email: String,
            address: String,
            phone: String
        },
        billTo: {
            clientName: String,
            email: String,
            address: String,
            phone: String
        },
        items: [
            {
                name: String,
                quantity: Number,
                unitPrice: Number,
                taxPercent: Number,
                total: Number
            }
        ],
        subTotal: {
            type: Number,
            required: true
        },
        taxTotal: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        },
        notes: {
            type: String,
            default: ""
        },
        // Template styling (same as invoice)
        templateId: {
            type: String,
            default: "classic"
        },
        brandColor: {
            type: String,
            default: "#1e40af"
        }
    },
    { 
        timestamps: true 
    }
);

// Index for faster queries
// receiptSchema.index({ user: 1, receiptDate: -1 });
// receiptSchema.index({ receiptNumber: 1 });

receiptSchema.index(
  { user: 1, receiptNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);