import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Loader2, 
    FileText, 
    Plus, 
    Eye, 
    Download, 
    Search, 
    Filter,
    DollarSign,
    AlertCircle,
    Trash2
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import moment from 'moment';
import { useAuth } from '../../context/AuthContext';

const AllInvoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalPaid: 0,
        totalUnpaid: 0
    });
    const { currencyIcon } = useAuth()

    useEffect(() => {
        fetchInvoices();
    }, []);

    useEffect(() => {
        filterInvoices();
    }, [searchTerm, statusFilter, invoices]);

    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES);
            const invoicesData = response.data;
            setInvoices(invoicesData);
            calculateStats(invoicesData);
        } catch (error) {
            toast.error('Failed to fetch invoices');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (invoicesData) => {
        const totalInvoices = invoicesData.length;
        const totalPaid = invoicesData
            .filter((inv) => inv.status === 'Paid')
            .reduce((acc, inv) => acc + inv.total, 0);
        const totalUnpaid = invoicesData
            .filter((inv) => inv.status !== 'Paid')
            .reduce((acc, inv) => acc + inv.total, 0);

        setStats({ totalInvoices, totalPaid, totalUnpaid });
    };

    const filterInvoices = () => {
        let filtered = [...invoices];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (invoice) =>
                    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    invoice.billTo?.clientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter((invoice) => invoice.status === statusFilter);
        }

        setFilteredInvoices(filtered);
    };

    const handleDownload = async (invoiceId, invoiceNumber) => {
        try {
            const res = await axiosInstance.get(API_PATHS.INVOICE.GENERATE_PDF(invoiceId), {
                responseType: 'blob'
            });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoiceNumber}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Invoice downloaded!');
        } catch (error) {
            toast.error('Failed to download invoice');
            console.error(error);
        }
    };

    const handleDelete = async (invoiceId) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        try {
            await axiosInstance.delete(API_PATHS.INVOICE.DELETE_INVOICE(invoiceId));
            toast.success('Invoice deleted successfully');
            fetchInvoices();
        } catch (error) {
            toast.error('Failed to delete invoice');
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
                    <p className="text-sm text-slate-600 mt-1">Manage and track all your invoices</p>
                </div>
                <Button
                    variant="primary"
                    size="medium"
                    onClick={() => navigate('/invoices/new')}
                    icon={Plus}
                >
                    Create Invoice
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className=''>
                            <p className="text-sm text-slate-500">Total Invoices</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalInvoices}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className=''>
                            <p className="text-sm text-slate-500">Total Paid</p>
                            <p className="text-2xl font-bold text-green-600">
                                {currencyIcon}{stats.totalPaid.toFixed(2)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Unpaid</p>
                            <p className="text-2xl font-bold text-red-600">
                                {currencyIcon}{stats.totalUnpaid.toFixed(2)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by invoice # or client name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
                        >
                            <option value="All">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="grid grid-cols-1">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full divide-y divide-slate-200 whitespace-nowrap">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr className=''>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                                            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                            <p className="text-lg font-medium">No invoices found</p>
                                            <p className="text-sm mt-1">
                                                {searchTerm || statusFilter !== 'All'
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Create your first invoice to get started'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map((invoice) => (
                                        <tr key={invoice._id} className="hover:bg-slate-50">
                                            <td className="px-4 py-4 text-sm font-medium text-slate-900">
                                                {invoice.invoiceNumber}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {invoice.billTo?.clientName || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {moment(invoice.invoiceDate).format('MMM D, YYYY')}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {moment(invoice.dueDate).format('MMM D, YYYY')}
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${
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
                                            <td className="px-4 py-4 text-sm text-right font-semibold text-slate-900">
                                                {currencyIcon}{invoice.total.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm space-x-2">
                                                <button
                                                    onClick={() => navigate(`/invoices/${invoice._id}`)}
                                                    className="text-orange-600 hover:text-orange-800 cursor-pointer"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4 inline" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(invoice._id, invoice.invoiceNumber)}
                                                    className="text-green-600 hover:text-green-800 cursor-pointer"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4 inline" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice._id)}
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

export default AllInvoices;
