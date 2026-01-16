const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        // Invoice & Receipt Defaults
        invoiceDefaults: {
            paymentTerms: {
                type: String,
                default: "Net 30"
            },
            currency: {
                type: String,
                default: "NGN"
            },
            taxEnabled: {
                type: Boolean,
                default: true
            },
            defaultTaxRate: {
                type: Number,
                default: 7.5 // VAT in Nigeria
            },
            taxLabel: {
                type: String,
                default: "VAT"
            },
            defaultNotes: {
                type: String,
                default: ""
            },
            invoicePrefix: {
                type: String,
                default: "INV"
            },
            invoiceStartingNumber: {
                type: Number,
                default: 1
            },
            receiptPrefix: {
                type: String,
                default: "RCP"
            },
            receiptStartingNumber: {
                type: Number,
                default: 1
            }
        },
        
        // Branding
        branding: {
            primaryColor: {
                type: String,
                default: "#1e40af"
            },
            defaultTemplate: {
                type: String,
                default: "classic"
            },
            // Explicit templates for invoices & receipts (new)
            invoiceTemplate: {
                type: String,
                default: "classic"
            },
            receiptTemplate: {
                type: String,
                default: "classic"
            },
            // Optional per-document colors. If empty, fall back to primaryColor
            invoiceColor: {
                type: String,
                default: ""
            },
            receiptColor: {
                type: String,
                default: ""
            }
        },
        
        // Notifications
        notifications: {
            emailNotifications: {
                type: Boolean,
                default: true
            },
            invoiceReminders: {
                type: Boolean,
                default: true
            },
            // paymentReceived: {
            //     type: Boolean,
            //     default: true
            // },
            // weeklyReport: {
            //     type: Boolean,
            //     default: false
            // }
        },
        
        // Email Templates
        // emailTemplates: {
        //     invoiceEmail: {
        //         subject: {
        //             type: String,
        //             default: "Invoice #{invoiceNumber} from {businessName}"
        //         },
        //         body: {
        //             type: String,
        //             default: "Dear {clientName},\n\nPlease find attached invoice #{invoiceNumber}.\n\nAmount Due: {amount}\nDue Date: {dueDate}\n\nThank you for your business!"
        //         }
        //     },
        //     receiptEmail: {
        //         subject: {
        //             type: String,
        //             default: "Payment Reminder: Invoice #{invoiceNumber}"
        //         },
        //         body: {
        //             type: String,
        //             default: "Dear {clientName},\n\nThis is a friendly reminder that invoice #{invoiceNumber} is due on {dueDate}.\n\nAmount: {amount}\n\nPlease arrange payment at your earliest convenience."
        //         }
        //     }
        // },
        
        // Payment Gateway
        // paymentGateway: {
        //     enabled: {
        //         type: Boolean,
        //         default: false
        //     },
        //     paystackPublicKey: String,
        //     bankDetails: {
        //         accountName: String,
        //         accountNumber: String,
        //         bankName: String
        //     }
        // }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);