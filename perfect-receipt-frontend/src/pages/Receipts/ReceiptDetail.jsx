import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Printer, AlertCircle, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import SendReceipt from '../../components/receipts/SendReceipt';
import { useAuth } from '../../context/AuthContext';

const ReceiptDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [receipt, setReceipt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [appSettings, setAppSettings] = useState(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
    const {currencyIcon, settings} = useAuth()

    useEffect(() => {
        fetchReceipt();
    }, [id]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const resp = await axiosInstance.get(API_PATHS.SETTINGS.GET);
                setAppSettings(resp.data);
            } catch (err) {
                console.warn('Failed to load settings for receipt preview', err?.message || err);
            }
        }
        fetchSettings();
    }, []);

    const fetchReceipt = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.RECEIPT.GET_BY_ID(id));
            setReceipt(response.data);
        } catch (error) {
            toast.error('Failed to fetch receipt');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            const res = await axiosInstance.get(API_PATHS.RECEIPT.GENERATE_PDF(id), { 
                responseType: 'blob' 
            });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${receipt.receiptNumber}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Receipt PDF downloaded!');
        } catch (error) {
            toast.error('Failed to download receipt');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // const handleSendReceiptEmail = async () => {
    //     if (!receipt) return;
    //     try {
    //         setIsLoading(true);
    //         // simple message; you can extend UI to accept custom message
    //         const payload = { message: `Hello ${receipt.billTo?.clientName || ''},\nPlease find your payment receipt.` };
    //         await axiosInstance.post(API_PATHS.RECEIPT.SEND_RECEIPT_EMAIL(receipt._id), payload);
    //         toast.success('Receipt sent to client email');
    //     } catch (err) {
    //         console.error('Failed to send receipt email', err);
    //         toast.error(err?.response?.data?.message || 'Failed to send receipt email');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
        );
    }

    if (!receipt) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
                <div className="w-16 h-16 flex items-center justify-center mb-4 bg-red-100 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Receipt not found</h3>
                <p className="text-slate-500 mb-6 max-w-md">The receipt you are looking for does not exist</p>
                <Button onClick={() => navigate('/receipts')}>Back to Receipts</Button>
            </div>
        );
    }

    return (
        <div>
            <SendReceipt 
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                receipt={receipt}
            />

            <div className="flex flex-col md:flex-row items-start sm:items-center justify-between mb-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={() => navigate('/receipts')}
                        icon={ArrowLeft}
                    >
                        Back
                    </Button>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        {receipt.receiptNumber}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="medium"
                        onClick={() => setIsReceiptModalOpen(true)}
                        icon={Mail}
                    >
                        Send Receipt
                    </Button>
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={handleDownload}
                        icon={Printer}
                    >
                        Download Receipt
                    </Button>
                    
                </div>
                
            </div>

            <div className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md border border-slate-200">
                {/* Header with PAID badge */}
                <div className="flex justify-between items-start pb-8 border-b border-slate-200 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold" style={{ color: appSettings?.branding?.receiptColor || appSettings?.branding?.primaryColor || receipt.brandColor || '#0f172a' }}>PAYMENT RECEIPT</h2>
                        <p className="text-sm text-slate-500 mt-2"># {receipt.receiptNumber}</p>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex items-center px-4 py-2 rounded-full" style={{ background: (appSettings?.branding?.receiptColor ? appSettings.branding.receiptColor + '22' : '#22c55e20') }}>
                            <CheckCircle className="w-5 h-5 mr-2" style={{ color: appSettings?.branding?.receiptColor || appSettings?.branding?.primaryColor || '#16a34a' }} />
                            <span className="text-sm font-semibold" style={{ color: appSettings?.branding?.receiptColor || appSettings?.branding?.primaryColor || '#166534' }}>PAID</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                            Date: {new Date(receipt.receiptDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Business and Client Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Received From</h3>
                        <p className="font-semibold text-slate-800">{receipt.billTo?.clientName}</p>
                        <p className="text-slate-600">{receipt.billTo?.address}</p>
                        <p className="text-slate-600">{receipt.billTo?.email}</p>
                        <p className="text-slate-600">{receipt.billTo?.phone}</p>
                    </div>

                    <div className="sm:text-right">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Received By</h3>
                        <p className="font-semibold text-slate-800">{receipt.billFrom?.businessName}</p>
                        <p className="text-slate-600">{receipt.billFrom?.address}</p>
                        <p className="text-slate-600">{receipt.billFrom?.email}</p>
                        <p className="text-slate-600">{receipt.billFrom?.phone}</p>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                    <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-4">Payment Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-green-700 mb-1">Payment Method</p>
                            <p className="font-semibold text-green-900">{receipt.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-xs text-green-700 mb-1">Payment Date</p>
                            <p className="font-semibold text-green-900">
                                {new Date(receipt.paymentDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="">
                            <p className="text-xs text-green-700 mb-1">Template Style</p>
                            <p className="font-semibold text-green-900 capitalize">{settings?.branding?.receiptTemplate || 'classic'}</p>
                        </div>
                        {receipt.transactionId && (
                            <div>
                                <p className="text-xs text-green-700 mb-1">Transaction ID</p>
                                <p className="font-semibold text-green-900">{receipt.transactionId}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Items</h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Qty</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {receipt.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                                        <td className="px-4 sm:px-6 py-4 text-center text-sm text-slate-900">{item.quantity}</td>
                                        <td className="px-4 sm:px-6 py-4 text-right text-sm text-slate-900">
                                            {currencyIcon}{item.unitPrice.toFixed(2)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right text-sm font-semibold text-slate-900">
                                            {currencyIcon}{item.total.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span>{currencyIcon}{receipt.subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Tax</span>
                            <span>{currencyIcon}{receipt.taxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold text-slate-900 border-t border-slate-200 pt-3">
                            <span>Total</span>
                            <span>{currencyIcon}{receipt.total.toFixed(2)}</span>
                        </div>
                        <div className="bg-green-100 rounded-lg p-4 text-center mt-4">
                            <p className="text-xs text-green-700 uppercase tracking-wider mb-1">Amount Paid</p>
                            <p className="text-3xl font-bold text-green-600">{currencyIcon}{receipt.amountPaid.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {receipt.notes && (
                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Notes</h3>
                        <p className="text-sm text-slate-600">{receipt.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                    <p className="text-sm text-slate-500">Thank you for your payment!</p>
                    <p className="text-xs text-slate-400 mt-1">This is an official receipt for your records.</p>
                </div>
            </div>
        </div>
    );
};

export default ReceiptDetail;