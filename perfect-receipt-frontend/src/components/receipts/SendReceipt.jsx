import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
import toast from 'react-hot-toast';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const SendReceipt = ({ isOpen, onClose, receipt }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const {currencyIcon} = useAuth()

    useEffect(() => {
        if (receipt) {
            // setMessage(
            //     `Hello ${receipt.billTo?.clientName || ''},\n\nThis is a friendly reminder about receipt ${receipt.receiptNumber || ''} for ${currencyIcon}${(receipt.total || 0).toFixed(2)}.\n\nThanks,\n${receipt.billFrom?.businessName || ''}`
            // );
            setMessage(
                `Hello ${receipt.billTo?.clientName || ''},\n\nThank you for your payment. Attached is your receipt (${receipt.receiptNumber || ''}) for ${currencyIcon}${(receipt.total || 0).toFixed(2)}.\n\nWe appreciate your patronage.\n\nWarm regards,\n${receipt.billFrom?.businessName || ''}`
            );
        }
    }, [receipt]);

    if (!isOpen || !receipt) return null;

    const handleSend = async () => {
        setSending(true);
        try {
            await axiosInstance.post(API_PATHS.RECEIPT.SEND_RECEIPT_EMAIL(receipt._id), { message });
            toast.success('Email Sent Successfully.');
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'Failed to send receipt.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded-lg w-[640px] max-w-full">
                <h3 className="text-lg font-medium mb-2">Send Details — Receipt {receipt.receiptNumber}</h3>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-36 p-3 border rounded mb-3"
                />

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
                    <Button onClick={handleSend} isLoading={sending}>
                        {sending ? 'Sending...' : 'Send Receipt'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SendReceipt