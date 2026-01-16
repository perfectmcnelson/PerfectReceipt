// pages/security/Security.jsx

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Smartphone,
    Lock,
    Download,
    AlertTriangle,
    Key,
    Loader2,
    CheckCircle,
    XCircle,
    Copy,
    Mail
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const Security = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('two-factor');

    // 2FA States
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [manualKey, setManualKey] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [disablePassword, setDisablePassword] = useState('');
    const [disableToken, setDisableToken] = useState('');

    // Password Reset States
    const [resetEmail, setResetEmail] = useState(user?.email || '');
    const [resetSent, setResetSent] = useState(false);

    // Data Export States
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        checkTwoFactorStatus();
    }, []);

    const checkTwoFactorStatus = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
            setTwoFactorEnabled(response.data.twoFactorEnabled || false);
        } catch (error) {
            console.error(error);
        }
    };

    // Enable 2FA
    const handleEnable2FA = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.ENABLE_2FA);
            setQrCode(response.data.qrCode);
            setManualKey(response.data.manualEntryKey);
            toast.success('Scan the QR code with your authenticator app');
        } catch (error) {
            console.error(error);
            toast.error('Failed to enable 2FA');
        } finally {
            setLoading(false);
        }
    };

    // Verify 2FA Setup
    const handleVerify2FA = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post(API_PATHS.AUTH.VERIFY_2FA, {
                token: verificationCode
            });
            setTwoFactorEnabled(true);
            setQrCode(null);
            setManualKey(null);
            setVerificationCode('');
            toast.success('Two-factor authentication enabled successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Invalid verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Disable 2FA
    const handleDisable2FA = async () => {
        if (!disablePassword || !disableToken) {
            toast.error('Please enter both password and verification code');
            return;
        }

        if (disableToken.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post(API_PATHS.AUTH.DISABLE_2FA, {
                password: disablePassword,
                token: disableToken
            });
            setTwoFactorEnabled(false);
            setDisablePassword('');
            setDisableToken('');
            toast.success('Two-factor authentication disabled');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    // Password Reset
    const handlePasswordReset = async () => {
        setLoading(true);
        try {
            await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, {
                email: resetEmail
            });
            setResetSent(true);
            toast.success('Password reset email sent! Check your inbox.');
        } catch (error) {
            console.error(error);
            toast.error('Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    // Export Data
    const handleExportData = async () => {
        setExporting(true);
        try {
            const response = await axiosInstance.get(API_PATHS.AUTH.EXPORT_DATA, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `perfectreceipt-data-export-${Date.now()}.json`;
            a.click();
            window.URL.revokeObjectURL(url);

            toast.success('Data exported successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to export data');
        } finally {
            setExporting(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const tabs = [
        { id: 'two-factor', label: 'Two-Factor Auth', icon: Smartphone },
        { id: 'password', label: 'Password', icon: Lock },
        { id: 'data', label: 'Data Privacy', icon: Download }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Security & Privacy</h1>
                <p className="text-sm text-slate-600 mt-1">
                    Manage your account security and data privacy settings
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50">
                    <nav className="flex space-x-1 px-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                                    activeTab === tab.id
                                        ? 'border-orange-600 text-orange-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Two-Factor Authentication Tab */}
                    {activeTab === 'two-factor' && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <Shield className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-orange-900">
                                        Two-Factor Authentication (2FA)
                                    </h3>
                                    <p className="text-sm text-orange-700 mt-1">
                                        Add an extra layer of security to your account by requiring a
                                        verification code from your authenticator app.
                                    </p>
                                </div>
                            </div>

                            {/* Current Status */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {twoFactorEnabled ? (
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-400" />
                                    )}
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            2FA Status: {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {twoFactorEnabled
                                                ? 'Your account is protected with 2FA'
                                                : 'Enable 2FA to secure your account'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Enable 2FA Section */}
                            {!twoFactorEnabled && !qrCode && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-2">
                                            Enable Two-Factor Authentication
                                        </h3>
                                        <p className="text-sm text-slate-600 mb-4">
                                            You'll need an authenticator app like Google Authenticator,
                                            Authy, or Microsoft Authenticator.
                                        </p>
                                        <Button
                                            variant="primary"
                                            onClick={handleEnable2FA}
                                            isLoading={loading}
                                            icon={Smartphone}
                                        >
                                            Enable 2FA
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* QR Code Display */}
                            {qrCode && !twoFactorEnabled && (
                                <div className="space-y-4">
                                    <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
                                        <h3 className="font-semibold text-slate-900 mb-4">
                                            Step 1: Scan QR Code
                                        </h3>
                                        <div className="flex flex-col items-center gap-4">
                                            <img
                                                src={qrCode}
                                                alt="QR Code"
                                                className="w-64 h-64 border border-slate-200 rounded-lg"
                                            />
                                            <div className="text-center">
                                                <p className="text-sm text-slate-600 mb-2">
                                                    Can't scan? Enter this code manually:
                                                </p>
                                                <div className="flex items-center gap-2 justify-center">
                                                    <code className="bg-slate-100 px-3 py-2 rounded text-sm font-mono">
                                                        {manualKey}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(manualKey)}
                                                        className="p-2 hover:bg-slate-100 rounded"
                                                    >
                                                        <Copy className="w-4 h-4 text-slate-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
                                        <h3 className="font-semibold text-slate-900 mb-4">
                                            Step 2: Enter Verification Code
                                        </h3>
                                        <p className="text-sm text-slate-600 mb-4">
                                            Enter the 6-digit code from your authenticator app
                                        </p>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) =>
                                                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                                }
                                                placeholder="000000"
                                                maxLength={6}
                                                className="w-40 px-4 py-2 text-center text-2xl font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                            <Button
                                                variant="primary"
                                                onClick={handleVerify2FA}
                                                isLoading={loading}
                                                disabled={verificationCode.length !== 6}
                                            >
                                                Verify & Enable
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Disable 2FA Section */}
                            {twoFactorEnabled && (
                                <div className="space-y-4">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-red-900 mb-2">
                                                    Disable Two-Factor Authentication
                                                </h3>
                                                <p className="text-sm text-red-700 mb-4">
                                                    This will make your account less secure. To disable 2FA,
                                                    enter your password and a verification code.
                                                </p>

                                                <div className="space-y-3">
                                                    <input
                                                        type="password"
                                                        value={disablePassword}
                                                        onChange={(e) => setDisablePassword(e.target.value)}
                                                        placeholder="Enter your password"
                                                        className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={disableToken}
                                                        onChange={(e) =>
                                                            setDisableToken(
                                                                e.target.value.replace(/\D/g, '').slice(0, 6)
                                                            )
                                                        }
                                                        placeholder="6-digit code from authenticator"
                                                        maxLength={6}
                                                        className="w-full px-4 py-2 font-mono border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    />
                                                    <Button
                                                        variant="danger"
                                                        onClick={handleDisable2FA}
                                                        isLoading={loading}
                                                    >
                                                        Disable 2FA
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Password Reset Tab */}
                    {activeTab === 'password' && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <Lock className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-orange-900">Password Reset</h3>
                                    <p className="text-sm text-orange-700 mt-1">
                                        Reset your password if you've forgotten it or want to change it
                                    </p>
                                </div>
                            </div>

                            {!resetSent ? (
                                <div className="bg-white border border-slate-200 rounded-lg p-6">
                                    <h3 className="font-semibold text-slate-900 mb-4">
                                        Request Password Reset
                                    </h3>
                                    <p className="text-sm text-slate-600 mb-4">
                                        We'll send a password reset link to your email address
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                disabled
                                            />
                                        </div>

                                        <Button
                                            variant="primary"
                                            onClick={handlePasswordReset}
                                            isLoading={loading}
                                            icon={Mail}
                                        >
                                            Send Reset Link
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-green-900">
                                                Reset Link Sent!
                                            </h3>
                                            <p className="text-sm text-green-700 mt-1">
                                                We've sent a password reset link to {resetEmail}. Check your
                                                inbox and follow the instructions to reset your password.
                                            </p>
                                            <button
                                                onClick={() => setResetSent(false)}
                                                className="text-sm text-green-600 hover:text-green-700 font-medium mt-3 cursor-pointer border px-4 py-3 rounded-xl"
                                            >
                                                Send another link
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tips */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                                <h3 className="font-semibold text-slate-900 mb-3">
                                    Password Security Tips
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <Key className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        Use at least 12 characters with a mix of letters, numbers, and symbols
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Key className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        Don't reuse passwords from other accounts
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Key className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        Consider using a password manager
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Key className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        Enable two-factor authentication for extra security
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Data Privacy Tab */}
                    {activeTab === 'data' && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <Download className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-orange-900">Data Privacy</h3>
                                    <p className="text-sm text-orange-700 mt-1">
                                        Export your data or manage your privacy settings
                                    </p>
                                </div>
                            </div>

                            {/* Export Data */}
                            <div className="bg-white border border-slate-200 rounded-lg p-6">
                                <h3 className="font-semibold text-slate-900 mb-4">Export Your Data</h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Download a complete backup of all your data including invoices, receipts,
                                    clients, and settings in JSON format.
                                </p>

                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                                    <h4 className="text-sm font-medium text-slate-900 mb-2">
                                        Export includes:
                                    </h4>
                                    <ul className="space-y-1 text-sm text-slate-600">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            All invoices and receipts
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Client information
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Subscription details
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Settings and preferences
                                        </li>
                                    </ul>
                                </div>

                                <Button
                                    variant="primary"
                                    onClick={handleExportData}
                                    isLoading={exporting}
                                    icon={Download}
                                >
                                    {exporting ? 'Exporting...' : 'Export All Data'}
                                </Button>
                            </div>

                            {/* Privacy Information */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                                <h3 className="font-semibold text-slate-900 mb-3">Your Privacy</h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    We take your privacy seriously. Your data is encrypted and stored securely.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        Your data is encrypted at rest and in transit
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        We never share your data with third parties
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        You can export or delete your data at any time
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Security;