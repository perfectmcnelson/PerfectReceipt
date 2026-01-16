// import React, { useEffect, useState } from "react";
// import { useAdmin } from "../context/AdminContext";
// import AdminLayout from "./AdminLayout";
// import axiosInstance from "../utils/axiosInstance";
// import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
// import {
//     FileText,
//     TrendingUp,
//     AlertCircle,
//     Calendar
// } from "lucide-react";

// const AdminDocumentsAnalytics = () => {
//     const { hasPermission } = useAdmin();
//     const [analytics, setAnalytics] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

//     useEffect(() => {
//         fetchDocumentStats();
//     }, []);

//     const fetchDocumentStats = async () => {
//         try {
//             setIsLoading(true);
//             const response = await axiosInstance.get(
//                 ADMIN_API_PATHS.ANALYTICS.DOCUMENTS,
//                 { params: dateRange }
//             );
//             setAnalytics(response.data);
//         } catch (err) {
//             setError(err.response?.data?.message || "Failed to fetch document analytics");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (!hasPermission("analyticsAccess", "view")) {
//         return (
//             <AdminLayout>
//                 <div className="p-6">
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
//                         <AlertCircle className="text-red-600" />
//                         <p className="text-red-800">Access denied</p>
//                     </div>
//                 </div>
//             </AdminLayout>
//         );
//     }

//     return (
//         <AdminLayout>
//             <div className="p-6 space-y-6">
//                 {/* Header */}
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900">Document Analytics</h1>
//                     <p className="text-gray-600 mt-1">Invoices and receipts statistics</p>
//                 </div>

//                 {/* Date Filter */}
//                 <div className="bg-white rounded-lg shadow p-6">
//                     <div className="flex gap-4 flex-wrap items-end">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
//                             <input
//                                 type="date"
//                                 value={dateRange.startDate}
//                                 onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
//                             <input
//                                 type="date"
//                                 value={dateRange.endDate}
//                                 onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>
//                         <button
//                             onClick={fetchDocumentStats}
//                             disabled={isLoading}
//                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
//                         >
//                             Apply Filter
//                         </button>
//                     </div>
//                 </div>

//                 {/* Error Alert */}
//                 {error && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
//                         <AlertCircle className="text-red-600" />
//                         <p className="text-red-800">{error}</p>
//                     </div>
//                 )}

//                 {isLoading ? (
//                     <div className="flex items-center justify-center h-96">
//                         <div className="text-center">
//                             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                             <p className="text-gray-600">Loading analytics...</p>
//                         </div>
//                     </div>
//                 ) : analytics ? (
//                     <>
//                         {/* Invoice Stats */}
//                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
//                                 <p className="text-gray-600 text-sm font-medium">Total Invoices</p>
//                                 <p className="text-4xl font-bold text-gray-900 mt-2">
//                                     {analytics.invoices?.totalInvoices || 0}
//                                 </p>
//                                 <p className="text-xs text-gray-500 mt-2">
//                                     {analytics.invoices?.paidCount || 0} paid, {analytics.invoices?.unpaidCount || 0} unpaid
//                                 </p>
//                             </div>

//                             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
//                                 <p className="text-gray-600 text-sm font-medium">Invoice Amount</p>
//                                 <p className="text-4xl font-bold text-green-600 mt-2">
//                                     ₦{(analytics.invoices?.totalAmount || 0).toLocaleString()}
//                                 </p>
//                                 <p className="text-xs text-gray-500 mt-2">
//                                     Average: ₦{(analytics.invoices?.avgAmount || 0).toLocaleString()}
//                                 </p>
//                             </div>

//                             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
//                                 <p className="text-gray-600 text-sm font-medium">Payment Status</p>
//                                 <div className="mt-4 space-y-2">
//                                     <div className="flex justify-between">
//                                         <span className="text-sm text-gray-600">Paid</span>
//                                         <span className="font-semibold text-green-600">
//                                             {(((analytics.invoices?.paidCount || 0) / (analytics.invoices?.totalInvoices || 1)) * 100).toFixed(1)}%
//                                         </span>
//                                     </div>
//                                     <div className="w-full bg-gray-200 rounded-full h-2">
//                                         <div
//                                             className="bg-green-600 h-2 rounded-full"
//                                             style={{
//                                                 width: `${((analytics.invoices?.paidCount || 0) / (analytics.invoices?.totalInvoices || 1)) * 100}%`
//                                             }}
//                                         ></div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Receipt Stats */}
//                         <div className="bg-white rounded-lg shadow p-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-6">Receipt Statistics</h2>
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                 <div>
//                                     <p className="text-gray-600 text-sm font-medium mb-2">Total Receipts</p>
//                                     <p className="text-3xl font-bold text-gray-900">
//                                         {analytics.receipts?.totalReceipts || 0}
//                                     </p>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-600 text-sm font-medium mb-2">Total Amount</p>
//                                     <p className="text-3xl font-bold text-green-600">
//                                         ₦{(analytics.receipts?.totalAmount || 0).toLocaleString()}
//                                     </p>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-600 text-sm font-medium mb-2">Average Receipt</p>
//                                     <p className="text-3xl font-bold text-blue-600">
//                                         ₦{(analytics.receipts?.avgAmount || 0).toLocaleString()}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Payment Methods */}
//                         {analytics.paymentMethods && analytics.paymentMethods.length > 0 && (
//                             <div className="bg-white rounded-lg shadow p-6">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h2>
//                                 <div className="space-y-4">
//                                     {analytics.paymentMethods.map((method, idx) => (
//                                         <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0">
//                                             <div>
//                                                 <p className="font-medium text-gray-900 capitalize">{method._id}</p>
//                                                 <p className="text-xs text-gray-500">{method.count} transactions</p>
//                                             </div>
//                                             <p className="font-bold text-gray-900">₦{method.totalAmount.toLocaleString()}</p>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Templates Used */}
//                         {analytics.templatesUsed && analytics.templatesUsed.length > 0 && (
//                             <div className="bg-white rounded-lg shadow p-6">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-6">Popular Templates</h2>
//                                 <div className="space-y-4">
//                                     {analytics.templatesUsed.map((template, idx) => {
//                                         const maxCount = Math.max(...analytics.templatesUsed.map(t => t.count));
//                                         const percentage = (template.count / maxCount) * 100;

//                                         return (
//                                             <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
//                                                 <div className="flex justify-between mb-2">
//                                                     <p className="font-medium text-gray-900 capitalize">{template._id}</p>
//                                                     <span className="text-sm font-semibold text-blue-600">{template.count}</span>
//                                                 </div>
//                                                 <div className="w-full bg-gray-200 rounded-full h-2">
//                                                     <div
//                                                         className="bg-blue-600 h-2 rounded-full transition-all"
//                                                         style={{ width: `${percentage}%` }}
//                                                     ></div>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         )}
//                     </>
//                 ) : null}
//             </div>
//         </AdminLayout>
//     );
// };

// export default AdminDocumentsAnalytics;

// pages/AdminDocumentsAnalytics.jsx
import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../utils/axiosInstance";
import { ADMIN_API_PATHS } from "../utils/adminApiPaths";
import {
    FileText,
    TrendingUp,
    AlertCircle,
    Calendar
} from "lucide-react";

const AdminDocumentsAnalytics = () => {
    const { hasPermission } = useAdmin();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

    useEffect(() => {
        fetchDocumentStats();
    }, []);

    const fetchDocumentStats = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                ADMIN_API_PATHS.ANALYTICS.DOCUMENTS,
                { params: dateRange }
            );
            setAnalytics(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch document analytics");
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasPermission("analyticsAccess", "view")) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">Access denied</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Document Analytics</h1>
                    <p className="text-gray-600 mt-1">Invoices and receipts statistics</p>
                </div>

                {/* Date Filter */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex gap-4 flex-wrap items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={fetchDocumentStats}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading analytics...</p>
                        </div>
                    </div>
                ) : analytics ? (
                    <>
                        {/* Invoice Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                                <p className="text-gray-600 text-sm font-medium">Total Invoices</p>
                                <p className="text-4xl font-bold text-gray-900 mt-2">
                                    {analytics.invoices?.totalInvoices || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {analytics.invoices?.paidCount || 0} paid, {analytics.invoices?.unpaidCount || 0} unpaid
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                                <p className="text-gray-600 text-sm font-medium">Invoice Amount</p>
                                <p className="text-4xl font-bold text-green-600 mt-2">
                                    ₦{(analytics.invoices?.totalAmount || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Average: ₦{(analytics.invoices?.avgAmount || 0).toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                                <p className="text-gray-600 text-sm font-medium">Payment Status</p>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Paid</span>
                                        <span className="font-semibold text-green-600">
                                            {(((analytics.invoices?.paidCount || 0) / (analytics.invoices?.totalInvoices || 1)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{
                                                width: `${((analytics.invoices?.paidCount || 0) / (analytics.invoices?.totalInvoices || 1)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Receipt Stats */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Receipt Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium mb-2">Total Receipts</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {analytics.receipts?.totalReceipts || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm font-medium mb-2">Total Amount</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        ₦{(analytics.receipts?.totalAmount || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm font-medium mb-2">Average Receipt</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        ₦{(analytics.receipts?.avgAmount || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        {analytics.paymentMethods && analytics.paymentMethods.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h2>
                                <div className="space-y-4">
                                    {analytics.paymentMethods.map((method, idx) => (
                                        <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0">
                                            <div>
                                                <p className="font-medium text-gray-900 capitalize">{method._id}</p>
                                                <p className="text-xs text-gray-500">{method.count} transactions</p>
                                            </div>
                                            <p className="font-bold text-gray-900">₦{method.totalAmount.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Templates Used */}
                        {analytics.templatesUsed && analytics.templatesUsed.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Popular Templates</h2>
                                <div className="space-y-4">
                                    {analytics.templatesUsed.map((template, idx) => {
                                        const maxCount = Math.max(...analytics.templatesUsed.map(t => t.count));
                                        const percentage = (template.count / maxCount) * 100;

                                        return (
                                            <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
                                                <div className="flex justify-between mb-2">
                                                    <p className="font-medium text-gray-900 capitalize">{template._id}</p>
                                                    <span className="text-sm font-semibold text-blue-600">{template.count}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </AdminLayout>
    );
};

export default AdminDocumentsAnalytics;