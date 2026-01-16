import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import {
    Loader2,
    FileText,
    DollarSign,
    Plus,
    Receipt as ReceiptIcon,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Calendar,
    CreditCard,
    Eye,
    Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        totalReceipts: 0,
        totalReceived: 0,
        overdueInvoices: 0,
        pendingInvoices: 0
    });
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [recentReceipts, setRecentReceipts] = useState([]);
    const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, currencyIcon } = useAuth()
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch invoices
            const invoicesResponse = await axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES);
            const invoices = invoicesResponse.data;

            // Fetch receipts
            let receipts = [];
            let receiptStats = null;
            try {
                const receiptsResponse = await axiosInstance.get(API_PATHS.RECEIPT.GET_ALL);
                receipts = receiptsResponse.data.receipts || [];
                
                const statsResponse = await axiosInstance.get(API_PATHS.RECEIPT.GET_STATS);
                receiptStats = statsResponse.data.summary;
            } catch (error) {
                console.log('Receipts not available');
            }

            // Calculate invoice stats
            const totalInvoices = invoices.length;
            const totalPaid = invoices
                .filter((inv) => inv.status === 'Paid')
                .reduce((acc, inv) => acc + inv.total, 0);
            const totalUnpaid = invoices
                .filter((inv) => inv.status !== 'Paid')
                .reduce((acc, inv) => acc + inv.total, 0);
            const overdueInvoices = invoices.filter((inv) => inv.status === 'Overdue').length;
            const pendingInvoices = invoices.filter((inv) => inv.status === 'Pending').length;

            // Payment method breakdown
            const paymentMethods = {};
            receipts.forEach((receipt) => {
                const method = receipt.paymentMethod;
                if (!paymentMethods[method]) {
                    paymentMethods[method] = { count: 0, total: 0 };
                }
                paymentMethods[method].count++;
                paymentMethods[method].total += receipt.amountPaid;
            });

            const paymentMethodArray = Object.keys(paymentMethods).map((method) => ({
                method,
                count: paymentMethods[method].count,
                total: paymentMethods[method].total
            }));

            setStats({
                totalInvoices,
                totalPaid,
                totalUnpaid,
                totalReceipts: receiptStats?.totalReceipts || 0,
                totalReceived: receiptStats?.totalAmount || 0,
                overdueInvoices,
                pendingInvoices
            });

            setRecentInvoices(
                invoices
                    .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
                    .slice(0, 5)
            );

            setRecentReceipts(
                receipts
                    .sort((a, b) => new Date(b.receiptDate) - new Date(a.receiptDate))
                    .slice(0, 5)
            );

            setPaymentMethodBreakdown(paymentMethodArray);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
        try {
            const res = await axiosInstance.get(API_PATHS.INVOICE.GENERATE_PDF(invoiceId), {responseType: 'blob'});
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url
            link.download = `Invoice_${invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download invoice PDF', error);
        }
    }

    const handleDownloadReceipt = async (receiptId, receiptNumber) => {
        try {
            const res = await axiosInstance.get(API_PATHS.RECEIPT.GENERATE_PDF(receiptId), {responseType: 'blob'});
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url
            link.download = `Receipt_${receiptNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download receipt PDF', error);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className='w-8 h-8 animate-spin text-orange-600' />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="">
                <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                <p className="text-sm text-slate-600 mt-1">
                    A comprehensive overview of your business finances
                </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Invoices */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Invoices</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalInvoices}</p>
                        <p className="text-xs text-slate-500 mt-2">
                            {stats.pendingInvoices} pending, {stats.overdueInvoices} overdue
                        </p>
                    </div>
                </div>

                {/* Total Paid */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                            {/* <Nai className="w-6 h-6 text-green-600" /> */}
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Paid</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">
                            {currencyIcon}{stats.totalPaid.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Revenue received</p>
                    </div>
                </div>

                {/* Total Unpaid */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <TrendingDown className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Unpaid</p>
                        <p className="text-3xl font-bold text-red-600 mt-1">
                            {currencyIcon}{stats.totalUnpaid.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Outstanding amount</p>
                    </div>
                </div>

                {/* Total Receipts */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <ReceiptIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Receipts</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalReceipts}</p>
                        <p className="text-xs text-slate-500 mt-2">
                            {currencyIcon}{stats.totalReceived.toFixed(2)} received
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">Payment Methods</h3>
                        <CreditCard className="w-5 h-5 text-slate-400" />
                    </div>
                    {paymentMethodBreakdown.length > 0 ? (
                        <div className="space-y-4">
                            {paymentMethodBreakdown.map((item, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700">{item.method}</span>
                                        <span className="text-sm font-semibold text-slate-900">
                                            {currencyIcon}{item.total.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-orange-600 h-2 rounded-full"
                                            style={{
                                                width: `${(item.total / stats.totalReceived) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{item.count} transactions</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm">No payment data available</p>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Pending Invoices</p>
                                    <p className="text-xs text-slate-500">Awaiting payment</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">{stats.pendingInvoices}</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Overdue Invoices</p>
                                    <p className="text-xs text-slate-500">Past due date</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <ReceiptIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Payment Rate</p>
                                    <p className="text-xs text-slate-500">Invoices paid</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.totalInvoices > 0
                                    ? ((stats.totalReceipts / stats.totalInvoices) * 100).toFixed(0)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Invoices */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
                        <Button variant="ghost" size="small" onClick={() => navigate('/invoices')}>
                            View All
                        </Button>
                    </div>

                    {recentInvoices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-slate-200 whitespace-nowrap">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Client
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {recentInvoices.map((invoice) => (
                                        <tr key={invoice._id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {invoice.billTo.clientName}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    #{invoice.invoiceNumber}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                                {currencyIcon}{invoice.total.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        invoice.status === 'Paid'
                                                            ? 'bg-green-100 text-green-800'
                                                            : invoice.status === 'Pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button
                                                    onClick={() => navigate(`/invoices/${invoice._id}`)}
                                                    className="text-orange-600 hover:text-orange-800 cursor-pointer"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4 inline" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDownloadInvoice(invoice._id, invoice.invoiceNumber)
                                                    }
                                                    className="text-green-600 hover:text-green-800 cursor-pointer"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-sm text-slate-500">No invoices yet</p>
                            <div className="mt-4">
                                <Button
                                    variant='primary'
                                    size="small"
                                    onClick={() => navigate('/invoices/new')}
                                    icon={Plus}
                                >
                                    Create Invoice
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Receipts */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-900">Recent Receipts</h3>
                        <Button variant="ghost" size="small" onClick={() => navigate('/receipts')}>
                            View All
                        </Button>
                    </div>

                    {recentReceipts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-slate-200 whitespace-nowrap">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Client
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Method
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {recentReceipts.map((receipt) => (
                                        <tr key={receipt._id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {receipt.billTo?.clientName}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    #{receipt.receiptNumber}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                                {currencyIcon}{receipt.amountPaid.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                                    {receipt.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button
                                                    onClick={() => navigate(`/receipts/${receipt._id}`)}
                                                    className="text-orange-600 hover:text-orange-800 cursor-pointer"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4 inline" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDownloadReceipt(receipt._id, receipt.receiptNumber)
                                                    }
                                                    className="text-green-600 hover:text-green-800 cursor-pointer"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ReceiptIcon className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-sm text-slate-500">No receipts yet</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Receipts appear when invoices are paid
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;