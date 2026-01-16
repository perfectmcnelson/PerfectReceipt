const express = require("express");
const {createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice, generatePdf, sendInvoiceEmail, sendInvoiceReminder} = require("../controllers/invoiceController.js")
const {protect} = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.route("/").post(protect, createInvoice).get(protect, getInvoices);

router
    .route("/:id")
    .get(protect, getInvoiceById)
    .put(protect, updateInvoice)
    .delete(protect, deleteInvoice)

router.get("/:id/generate-pdf", protect, generatePdf);
router.post('/:id/send-email', protect, sendInvoiceEmail);
router.post('/:id/send-reminder', protect, sendInvoiceReminder);

module.exports = router;