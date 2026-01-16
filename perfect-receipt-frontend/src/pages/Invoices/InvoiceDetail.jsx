import React, {useState, useEffect, useRef} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { Loader2, Edit, Printer, AlertCircle, Mail, PlusCircleIcon, ReceiptIcon, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import CreateInvoice from './CreateInvoice'
import Button from '../../components/ui/Button'
import ReminderModal from '../../components/invoices/ReminderModal'
import GenerateReceiptModal from '../../components/receipts/GenerateReceiptModal'
import SendInvoice from '../../components/invoices/SendInvoice'
import { useAuth } from '../../context/AuthContext'

const InvoiceDetail = () => {

    const {id} = useParams()
    const navigate = useNavigate()
    const [invoice, setInvoice] = useState(null)
    const [receipt, setReceipt] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isEditMode, setIsEditMode] = useState(false)
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false) 
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
    const [statusChangeLoading, setStatusChangeLoading] = useState(null)
    const invoiceRef = useRef()
    const [appSettings, setAppSettings] = useState(null)
    const {currencyIcon, settings} = useAuth()

    useEffect(() => {
        const fetchInvoice = async () => {
            setIsLoading(true)
            try {
                const response = await axiosInstance.get(API_PATHS.INVOICE.GET_INVOICE_BY_ID(id))
                setInvoice(response.data)

                // Check if receipt exists for this invoice
                if (response.data.status === 'Paid') {
                    try {
                        const receiptResponse = await axiosInstance.get(API_PATHS.RECEIPT.GET_BY_INVOICE(id))
                        setReceipt(receiptResponse.data)
                    } catch (err) {
                        // Receipt doesn't exist yet
                        setReceipt(null)
                    }
                }
            } catch (error) {
                toast.error("Failed to fetch invoice details.")
                setError("Failed to fetch invoice details.")
                console.error(error)
            }
            setIsLoading(false)
        }

        fetchInvoice()
    }, [id])

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const resp = await axiosInstance.get(API_PATHS.SETTINGS.GET);
                setAppSettings(resp.data);
            } catch (err) {
                // non-fatal
                console.warn('Failed to fetch settings for preview', err?.message || err);
            }
        };

        fetchSettings();
    }, []);

     const handleStatusChange = async (invoice) => {
        setStatusChangeLoading(invoice._id);
        try {
            const newStatus = invoice.status === "Paid" ? "Unpaid" : "Paid";
            const updatedInvoice = { ...invoice, status: newStatus };

            const response = await axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(invoice._id), updatedInvoice);

            setInvoice(inv => inv._id === invoice._id ? response.data : inv);
            toast.success(`Invoice marked as ${newStatus}.`);
        } catch (error) {
            setError("Failed to update invoice status.");
            console.error(error);
        } finally {
            setStatusChangeLoading(null);
        }
    };

    const handleUpdate = async (updatedData) => {
        try {
            const response = await axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(id), updatedData)
            setInvoice(response.data)
            setIsEditMode(false)
            toast.success("Invoice updated successfully.")
        } catch (error) {
            toast.error("Failed to update invoice.")
            console.error(error)
        }
    }

    const handlePrint = async () => {
        try {
            setIsLoading(true); // optional: show spinner while PDF builds
            // call backend route that returns PDF
            const res = await axiosInstance.get(API_PATHS.INVOICE.GENERATE_PDF(id), { responseType: 'blob' });
            // create blob and download
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Option A: open in new tab to let user print from browser
            // window.open(url, '_blank');

            // Option B: immediately download:
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoice.invoiceNumber || id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);

            // Cleanup
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            
            toast.success('PDF generated successfully!');

        } catch (err) {
            console.error('Failed to generate PDF on server', err);
            toast.error('Failed to generate PDF on server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReceiptSuccess = (newReceipt) => {
        setReceipt(newReceipt);
        toast.success('Receipt generated successfully!');
    };

    const handleViewReceipt = () => {
        if (receipt) {
            navigate(`/receipts/${receipt._id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
                <div className="w-16 h-16 flex items-center justify-center mb-4 bg-red-100 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Invoice not found.</h3>
                <p className="text-slate-500 mb-6 max-w-md">The invoice you are looking for does not exist or could not be found.</p>
                <Button onClick={() => navigate("/invoices")}>Back to All Invoices</Button>
            </div>
        )
    }

    if (isEditMode) {
        return (
            <CreateInvoice 
                existingInvoice={invoice}
                onCancel={() => setIsEditMode(false)}
                onSave={handleUpdate}
            />
        )
    }

    return (
        <>
            <SendInvoice
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                invoice={invoice}
            />

            <GenerateReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                invoice={invoice}
                onSuccess={handleReceiptSuccess}
            />

            <div className="flex flex-col md:flex-row items-start sm:items-center justify-between mb-6 print:hidden">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={() => navigate('/invoices')}
                        icon={ArrowLeft}
                    >
                        Back
                    </Button>
                    <h1 className="text-2xl font-semibold text-slate-900" 
                        // style={{ color: settings?.branding?.primaryColor || appSettings?.branding?.primaryColor || '#1f2937' }}style={{ color: appSettings?.branding?.invoiceColor || appSettings?.branding?.primaryColor || invoice.brandColor || '#1e40af' }}
                    >
                        <span className='text-slate-500' style={{ color: 'inherit' }}>{invoice.invoiceNumber}</span>
                    </h1>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    {invoice.status === "Paid" && (
                        <>
                            {receipt ? (
                                <div className="flex gap-2">
                                    <Button
                                        variant="success"
                                        size="medium"
                                        onClick={handleViewReceipt}
                                        icon={ReceiptIcon}
                                    >
                                        View Receipt
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="medium"
                                    onClick={() => setIsReceiptModalOpen(true)}
                                    icon={PlusCircleIcon}
                                >
                                    Generate Receipt
                                </Button>
                            )}
                        </>
                    )}
                    {
                        invoice.status !== "Paid" && (
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="secondary"
                                    size="medium"
                                    onClick={() => setIsInvoiceModalOpen(true)}
                                    icon={Mail}
                                >
                                    Send Invoice
                                </Button>
                            </div>
                        )
                    }
                    <Button
                        size='medium'
                        variant='secondary'
                        onClick={() => handleStatusChange(invoice)}
                        isLoading={statusChangeLoading === invoice._id}
                    >
                        {invoice.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}
                    </Button>
                    <Button 
                        variant="secondary"
                        size="medium"
                        onClick={() => setIsEditMode(true)}
                        icon={Edit}
                    >
                        Edit Invoice
                    </Button>
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={handlePrint}
                        icon={Printer}
                    >
                        Download Invoice
                    </Button>
                </div>
            </div>

            <div id='invoice-content-wrapper'>
                <div ref={invoiceRef} id='invoice-preview' className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md border border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-slate-200 mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">INVOICE</h2>
                            <p className="text-sm text-slate-500 mt-2"># {invoice.invoiceNumber}</p>
                        </div>
                        <div className="text-left sm:text-right mt-4 sm:mt-0 space-y-1">
                            <p className="text-sm text-slate-500">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invoice.status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                                invoice.status === "Pending" ? "bg-amber-100 text-amber-800" :
                                "bg-red-100 text-red-800"
                            }`}>
                                {invoice.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Bill From</h3>
                            <p className="font-semibold text-slate-800">{invoice.billFrom.businessName}</p>
                            <p className="text-slate-600">{invoice.billFrom.address}</p>
                            <p className="text-slate-600">{invoice.billFrom.email}</p>
                            <p className="text-slate-600">{invoice.billFrom.phone}</p>
                        </div>

                        <div className="sm:text-right">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Bill To</h3>
                            <p className="font-semibold text-slate-800">{invoice.billTo.clientName}</p>
                            <p className="text-slate-600">{invoice.billTo.address}</p>
                            <p className="text-slate-600">{invoice.billTo.email}</p>
                            <p className="text-slate-600">{invoice.billTo.phone}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 justify-between gap-8 mt-8 mb-12">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Invoice Date</h3>
                            <p className="font-medium text-slate-600">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                        </div>
                        <div className='sm:text-center'>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Due Date</h3>
                            <p className="font-medium text-slate-600">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="sm:text-right">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment Terms</h3>
                            <p className="font-medium text-slate-600">{invoice.paymentTerms}</p>
                        </div>
                        <div className="sm:text-right">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Template Style</h3>
                            <p className="font-medium text-slate-600 capitalize">{settings?.branding?.invoiceTemplate || 'classic'}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {
                                    invoice.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                                            <td className="px-4 sm:px-6 py-4 text-center text-sm font-medium text-slate-900">{item.quantity}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium text-slate-900">{item.unitPrice.toFixed(2)}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium text-slate-900">{item.total.toFixed(2)}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end mt-8">
                        <div className="w-full max-w-sm space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>SubTotal</span>
                                <span>{currencyIcon}{invoice.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Tax</span>
                                <span>{currencyIcon}{invoice.taxTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold text-slate-900 border-t border-slate-200 pt-3 mt-3">
                                <span>Total</span>
                                <span>{currencyIcon}{invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {
                        invoice.notes && (
                            <div className="mt-8 pt-8 border-t border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Notes</h3>
                                <p className="text-sm text-slate-600">{invoice.notes}</p>
                            </div>
                        )
                    }
                </div>
            </div>

            <style>
                {`
                    #page {
                        padding: 10px;
                    }

                    @media print {
                        body * {
                            visibility: hidden;
                        }

                        #invoice-content-wrapper, #invoice-content-wrapper * {
                            visibility: visible;
                        }

                        #invoice-content-wrapper {
                            position: absolute;
                            left: 0;
                            top: 0;
                            right: 0;
                            width: 100%;
                        }

                        #invoice-preview {
                            box-shadow: none;
                            border: none;
                            border-radius: 0;
                            padding: 0;
                        }
                    }
                `}
            </style>
        </>
    )
}

export default InvoiceDetail