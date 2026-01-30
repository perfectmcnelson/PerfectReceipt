const Invoice = require("../models/Invoice");
const Subscription = require("../models/Subscription");
const { generatePdfBufferFromInvoice } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');
// const emailService = require('../services/emailService');
const { sendInvoiceEmail } = require("../services/emailService");

/**
 * @desc    Send invoice via email with dynamically generated PDF
 * @route   POST /api/invoices/:id/send-email
 * @access  Private
 */
exports.sendInvoiceEmail = async (req, res) => {
    try {
        const { id: invoiceId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;
        const user = req.user;

        // Server-side quota check and increment for receipts
        try {
            const subscription = await Subscription.findOne({ user: req.user.id });
            if (subscription) {
                const now = new Date();
                if (!subscription.currentPeriodEnd || (subscription.currentPeriodEnd && now > subscription.currentPeriodEnd)) {
                    subscription.usage = { invoicesCreated: 0, receiptsGenerated: 0, emailsSent: 0 };
                    subscription.currentPeriodStart = now;
                    const periodEnd = new Date();
                    periodEnd.setMonth(periodEnd.getMonth() + (subscription.billingCycle === 'yearly' ? 12 : 1));
                    subscription.currentPeriodEnd = periodEnd;
                }

                const limit = subscription.limits?.emailsPerMonth ?? -1;
                if (limit !== -1 && subscription.usage.emailsSent >= limit) {
                    return res.status(400).json({ message: `Monthly email limit reached (${limit}).` });
                }

                // increment now (save after creating email)
                subscription.usage.emailsSent += 1;
                await subscription.save();
            }
        } catch (err) {
            console.warn('Subscription check failed during email generation:', err.message || err);
        }

        // Validate message
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Find invoice
        const invoice = await Invoice.findById(invoiceId).lean();
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Verify ownership
        if (invoice.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to send this invoice' });
        }

        // Get client email
        const recipientEmail = invoice.billTo?.email;
        if (!recipientEmail) {
            return res.status(400).json({ message: 'Client email not found in invoice' });
        }

        // ============================================
        // GENERATE PDF DYNAMICALLY
        // ============================================
        let pdfBuffer;
        try {
            pdfBuffer = await generatePdfBufferFromInvoice(invoice);
        } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            return res.status(500).json({ 
                message: 'Failed to generate invoice PDF',
                error: pdfError.message 
            });
        }

        // ============================================
        // PREPARE ATTACHMENTS
        // ============================================
        const attachments = [];

        // 1. Dynamically generated PDF (in Buffer)
        attachments.push({
            filename: `Invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        });

        // 2. Company Logo (optional - from file system)
        // const logoPath = path.join(__dirname, '../assets/logo.png');
        // if (fs.existsSync(logoPath)) {
        //     attachments.push({
        //         filename: 'logo.png',
        //         path: logoPath,
        //         cid: 'logo@company.com'
        //     });
        // }

        // ============================================
        // SEND EMAIL
        // ============================================
        const emailData = {
            recipientEmail: recipientEmail,
            subject: `Invoice #${invoice.invoiceNumber} from ${user.businessName || 'PerfectReceipt'}`,
            message: message,
            attachments: attachments?.map(att => {
                if (att.content) {
                    // Convert your Buffer to Base64 for Brevo
                    return {
                        name: att.filename,
                        content: att.content.toString('base64'),
                        contentType: att.contentType || 'application/octet-stream'
                    };
                }

                // Already a URL attachment
                return {
                    name: att.filename,
                    url: att.url
                }
            }),
            userEmail: user.email,
            userName: user.name
        };

        const result = await sendInvoiceEmail(emailData);

        res.status(200).json({
            message: 'Invoice sent successfully',
            messageId: result.messageId,
            recipientEmail: recipientEmail,
            attachmentCount: attachments.length
        });

    } catch (error) {
        console.error('Send invoice email error:', error);
        res.status(500).json({
            message: 'Failed to send invoice email',
            error: error.message
        });
    }
};

/**
 * @desc    Send invoice reminder via email with PDF
 * @route   POST /api/invoices/:id/send-reminder
 * @access  Private
 */
exports.sendInvoiceReminder = async (req, res) => {
    try {
        const { id: invoiceId } = req.params;
        const userId = req.user.id;
        const user = req.user;

        // Find invoice
        const invoice = await Invoice.findById(invoiceId).lean();
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Verify ownership
        if (invoice.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const recipientEmail = invoice.billTo?.email;
        if (!recipientEmail) {
            return res.status(400).json({ message: 'Client email not found' });
        }

        // ============================================
        // GENERATE PDF DYNAMICALLY
        // ============================================
        let pdfBuffer;
        try {
            pdfBuffer = await generatePdfBufferFromInvoice(invoice);
        } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            return res.status(500).json({ 
                message: 'Failed to generate invoice PDF',
                error: pdfError.message 
            });
        }

        // Prepare attachments
        const attachments = [];

        attachments.push({
            filename: `Invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        });

        // Calculate days overdue
        const daysOverdue = Math.floor(
            (Date.now() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)
        );

        const reminderMessage = `Hello ${invoice.billTo?.clientName || 'Valued Client'},

        This is a payment reminder for Invoice #${invoice.invoiceNumber}.

        Amount Due: $${(invoice.total || 0).toFixed(2)}
        Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
        ${daysOverdue > 0 ? `Status: ${daysOverdue} days overdue` : ''}

        Please find the invoice attached and arrange payment at your earliest convenience.

        Thank you,
        ${user.businessName || 'PerfectReceipt'}`;

        const emailData = {
            recipientEmail: recipientEmail,
            subject: `Payment Reminder - Invoice #${invoice.invoiceNumber}`,
            message: reminderMessage,
            attachments: attachments?.map(att => {
                if (att.content) {
                    // Convert your Buffer to Base64 for Brevo
                    return {
                        name: att.filename,
                        content: att.content.toString('base64'),
                        contentType: att.contentType || 'application/octet-stream'
                    };
                }

                // Already a URL attachment
                return {
                    name: att.filename,
                    url: att.url
                }
            }),
            userEmail: user.email,
            userName: user.name
        };

        const result = await emailService.sendInvoiceEmail(emailData);

        res.status(200).json({
            message: 'Reminder sent successfully',
            messageId: result.messageId
        });

    } catch (error) {
        console.error('Send reminder error:', error);
        res.status(500).json({
            message: 'Failed to send reminder',
            error: error.message
        });
    }
};


// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
    try {
        const user = req.user;
        const {
            invoiceNumber,
            invoiceDate,
            dueDate,
            billFrom,
            billTo,
            items,
            notes,
            paymentTerms,
            templateId
        } = req.body;

        // Subtotal calculation
        let subTotal = 0;
        let taxTotal = 0;
        const itemsArray = Array.isArray(items) ? items : [];
        itemsArray.forEach((item) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            subTotal += price * qty;
            taxTotal += ((price * qty) * (Number(item.taxPercent) || 0)) / 100;
        })

        const total = subTotal + taxTotal;

        // Server-side quota check and increment
        try {
            const subscription = await Subscription.findOne({ user: req.user.id });
            if (subscription) {
                const now = new Date();
                if (!subscription.currentPeriodEnd || (subscription.currentPeriodEnd && now > subscription.currentPeriodEnd)) {
                    subscription.usage = { invoicesCreated: 0, receiptsGenerated: 0, emailsSent: 0 };
                    subscription.currentPeriodStart = now;
                    const periodEnd = new Date();
                    periodEnd.setMonth(periodEnd.getMonth() + (subscription.billingCycle === 'yearly' ? 12 : 1));
                    subscription.currentPeriodEnd = periodEnd;
                }

                const limit = subscription.limits?.invoicesPerMonth ?? -1;
                if (limit !== -1 && subscription.usage.invoicesCreated >= limit) {
                    return res.status(400).json({ message: `Monthly invoice limit reached (${limit}).` });
                }

                // increment now (will save after invoice saved)
                subscription.usage.invoicesCreated += 1;
                await subscription.save();
            }
        } catch (err) {
            console.warn('Subscription check failed during invoice creation:', err.message || err);
        }

        // Determine template/color defaults from user Settings if not provided
        let chosenTemplate = templateId || null;
        let chosenColor = null;
        try {
            const Settings = require('../models/Settings');
            const userSettings = await Settings.findOne({ user: req.user.id }).lean();
            if (userSettings) {
                chosenTemplate = chosenTemplate || userSettings.branding?.invoiceTemplate || userSettings.branding?.defaultTemplate || 'classic';
                chosenColor = userSettings.branding?.invoiceColor || userSettings.branding?.primaryColor || null;
            }
        } catch (err) {
            console.warn('Failed to load settings when creating invoice:', err.message || err);
            chosenTemplate = chosenTemplate || templateId || 'classic';
        }

        // Ensure each item has a computed `total` field (schema requires it)
        const itemsWithTotals = (Array.isArray(items) ? items : []).map(item => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            const taxPercent = Number(item.taxPercent) || 0;
            const itemTotal = qty * price * (1 + taxPercent / 100);
            return {
                ...item,
                quantity: qty,
                unitPrice: price,
                taxPercent,
                total: item.total !== undefined ? Number(item.total) : Number(itemTotal)
            };
        });

        // Normalize template id to match model enum (Capitalized words)
        const normalizeTemplate = (t) => {
            if (!t) return 'Classic';
            return t
                .toString()
                .toLowerCase()
                .split(/\s+|-/)
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join('');
        };

        const invoice = new Invoice({
            user: req.user.id,
            invoiceNumber,
            invoiceDate,
            dueDate,
            billFrom,
            billTo,
            items: itemsWithTotals,
            notes,
            paymentTerms,
            templateId: normalizeTemplate(chosenTemplate),
            brandColor: chosenColor,
            subTotal,
            taxTotal,
            total,
        })

        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        console.error('Create invoice error:', error);
        res
            .status(500)
            .json({message: "Error Creating Invoice", error: error.message})
    }
};

// @desc    Get all invoices of logged-in user
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({user: req.user.id}).populate("user", "name email").sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res
            .status(500)
            .json({message: "Error Fetching Invoice", error: error.message})
    }
};

// @desc    Get single invoice by Id
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate("user", "name email");
        if (!invoice) return res.status(404).json({message: "Invoice not found"});

        // Check if the invoice belongs to the user
        if (invoice.user._id.toString() !== req.user.id) {
            return res.status(401).json({message: "Not Authorized"});
        }

        res.json(invoice);
    } catch (error) {
        res
            .status(500)
            .json({message: "Error Fetching Invoice", error: error})
    }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
    try {
        const {
            invoiceNumber,
            invoiceDate,
            dueDate,
            billFrom,
            billTo,
            items,
            notes,
            paymentTerms,
            templateId,
            status,
        } = req.body;

        // Recalculate totals if items changed
        let subTotal = 0;
        let taxTotal = 0;
        const itemsArray = Array.isArray(items) ? items : [];
        const itemsWithTotals = itemsArray.map(item => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            const taxPercent = Number(item.taxPercent) || 0;
            const itemTotal = qty * price * (1 + taxPercent / 100);
            subTotal += qty * price;
            taxTotal += qty * price * (taxPercent / 100);
            return {
                ...item,
                quantity: qty,
                unitPrice: price,
                taxPercent,
                total: Number(item.total !== undefined ? item.total : itemTotal)
            };
        });

        const total = subTotal + taxTotal;

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            {
                invoiceNumber,
                invoiceDate,
                dueDate,
                billFrom,
                billTo,
                items: itemsWithTotals,
                notes,
                paymentTerms,
                templateId,
                status,
                subTotal,
                taxTotal,
                total,
            },
            {new: true}
        );

        if (!updatedInvoice) return res.status(404).json({message: "Invoice not found"});

        res.json(updatedInvoice)

    } catch (error) {
        res
            .status(500)
            .json({message: "Error Updating Invoice", error: error.message})
    }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) return res.status(404).json({message: "Invoice not found"});
        res.json({message: "Invoice deleted successfully"});
    } catch (error) {
        res
            .status(500)
            .json({message: "Error Deleting Invoice", error: error.message})
    }
};



// GET /api/invoices/:id/pdf   -> generate PDF on server and return it
exports.generatePdf = async (req, res) => {
// router.get('/:id/pdf', asyncHandler(async (req, res) => {
  const invoiceId = req.params.id;

  // 1) load invoice from DB (adjust projection/populate to your needs)
  const invoice = await Invoice.findById(invoiceId).lean();
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  // 2) generate pdf buffer with your utility
  const pdfBuffer = await generatePdfBufferFromInvoice(invoice);

  // 3) send PDF bytes back to client
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': pdfBuffer.length,
    'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber || invoice._id}.pdf`,
  });

  return res.send(pdfBuffer);
};

// module.exports = router;