const express = require('express');
const {
    generateReceipt,
    getReceipts,
    getReceiptById,
    getReceiptByInvoiceId,
    updateReceipt,
    deleteReceipt,
    generateReceiptPdf,
    getReceiptStats,
    sendReceiptEmail
} = require('../controllers/receiptController.js');
const { protect } = require('../middlewares/authMiddleware.js');

const router = express.Router();
router.route('/').post(protect, generateReceipt).get(protect, getReceipts);

router
    .route('/:id')
    .get(protect, getReceiptById)
    .put(protect, updateReceipt)
    .delete(protect, deleteReceipt);

router.post("/invoice/:invoiceId/generate", protect, generateReceipt);
router.get('/:id/generate-pdf', protect, generateReceiptPdf);
router.get('/invoice/:invoiceId', protect, getReceiptByInvoiceId);
router.get('/stats/summary', protect, getReceiptStats);
router.post('/:id/send-email', protect, sendReceiptEmail);

module.exports = router;
