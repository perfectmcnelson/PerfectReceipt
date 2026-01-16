import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
import toast from 'react-hot-toast';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const SendInvoice = ({ isOpen, onClose, invoice }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const {currencyIcon} = useAuth()

    useEffect(() => {
        if (invoice) {
            setMessage(
                `Hello ${invoice.billTo?.clientName || ''},\n\nThis is a friendly reminder about invoice ${invoice.invoiceNumber || ''} for ${currencyIcon}${(invoice.total || 0).toFixed(2)}.\n\nKindly find attached the document containing the details for it.\n\nThanks,\n${invoice.billFrom?.businessName || ''}`
            );
        }
    }, [invoice]);

    if (!isOpen || !invoice) return null;

    const handleSend = async () => {
        setSending(true);
        try {
            await axiosInstance.post(API_PATHS.INVOICE.SEND_INVOICE_EMAIL(invoice._id), { message });
            toast.success('Email Sent Successfully.');
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'Failed to send reminder email.');
        } finally {
            setSending(false);
        }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg w-[640px] max-w-full">
        <h3 className="text-lg font-medium mb-2">Send Details — Invoice {invoice.invoiceNumber}</h3>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-36 p-3 border rounded mb-3"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
            <Button onClick={handleSend} isLoading={sending}>
                {sending ? 'Sending...' : 'Send Invoice'}
            </Button>
        </div>
      </div>
    </div>
  );
}

export default SendInvoice