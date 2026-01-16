import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Loader2, 
    Receipt, 
    Eye, 
    Download, 
    Trash2, 
    Search, 
    Filter 
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import moment from 'moment';
import { useAuth } from '../../context/AuthContext';

const AllReceipts = () => {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [filteredReceipts, setFilteredReceipts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
    const {currencyIcon} = useAuth()

    useEffect(() => {
        fetchReceipts();
        fetchStats();
    }, []);

    useEffect(() => {
        filterReceipts();
    }, [searchTerm, paymentMethodFilter, receipts]);

    const fetchReceipts = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.RECEIPT.GET_ALL);
            setReceipts(response.data.receipts);
        } catch (error) {
            toast.error('Failed to fetch receipts');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.RECEIPT.GET_STATS);
            setStats(response.data.summary);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const filterReceipts = () => {
        let filtered = [...receipts];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (receipt) =>
                    receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    receipt.billTo?.clientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Payment method filter
        if (paymentMethodFilter !== 'All') {
            filtered = filtered.filter((receipt) => receipt.paymentMethod === paymentMethodFilter);
        }

        setFilteredReceipts(filtered);
    };

    const handleDownload = async (receiptId, receiptNumber) => {
        try {
            const res = await axiosInstance.get(API_PATHS.RECEIPT.GENERATE_PDF(receiptId), { 
                responseType: 'blob' 
            });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${receiptNumber}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Receipt downloaded!');
        } catch (error) {
            toast.error('Failed to download receipt');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this receipt?')) return;

        try {
            await axiosInstance.delete(API_PATHS.RECEIPT.DELETE(id));
            toast.success('Receipt deleted successfully');
            fetchReceipts();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete receipt');
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Receipts</h1>
                    <p className="text-sm text-slate-600 mt-1">View and manage payment receipts</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Receipts</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.totalReceipts || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Amount</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {currencyIcon}{(stats.totalAmount || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Average Amount</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {currencyIcon}{(stats.avgAmount || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by receipt # or client name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Payment Method Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                            value={paymentMethodFilter}
                            onChange={(e) => setPaymentMethodFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
                        >
                            <option value="All">All Payment Methods</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Check">Check</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1">
                {/* Receipts Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full divide-y divide-slate-200 whitespace-nowrap">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Receipt #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payment Method</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredReceipts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-12 text-center text-slate-500">
                                            <Receipt className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                            <p className="text-lg font-medium">No receipts found</p>
                                            <p className="text-sm mt-1">
                                                {searchTerm || paymentMethodFilter !== 'All'
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Receipts will appear here once generated'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReceipts.map((receipt) => (
                                        <tr key={receipt._id} className="hover:bg-slate-50">
                                            <td className="px-4 py-4 text-sm font-medium text-slate-900">
                                                {receipt.receiptNumber}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {receipt.billTo?.clientName || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {moment(receipt.receiptDate).format('MMM D, YYYY')}
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                                                    {receipt.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right font-semibold text-green-600">
                                                {currencyIcon}{receipt.amountPaid.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm space-x-2">
                                                <button
                                                    onClick={() => navigate(`/receipts/${receipt._id}`)}
                                                    className="text-orange-600 hover:text-orange-800 cursor-pointer"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4 inline" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(receipt._id, receipt.receiptNumber)}
                                                    className="text-green-600 hover:text-green-800 cursor-pointer"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4 inline" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(receipt._id)}
                                                    className="text-red-600 hover:text-red-800 cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AllReceipts;