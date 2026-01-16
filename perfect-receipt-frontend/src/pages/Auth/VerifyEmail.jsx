// VerifyEmail.jsx
import React, { useState, useEffect } from 'react'
import {
    Mail,
    Loader2,
    ArrowRight,
    Check,
    AlertCircle,
    Clock
} from "lucide-react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

// API_PATHS entries you need to add:
// VERIFY_EMAIL_BY_TOKEN: (token) => `/api/auth/verify-email/${token}`,
// VERIFY_EMAIL_BY_CODE: "/api/auth/verify-email/code", (or use POST with body)

const VerifyEmail = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        // Get email from localStorage
        const tempEmail = localStorage.getItem('tempEmail');
        if (tempEmail) {
            setEmail(tempEmail);
        }

        // Check if token is in URL (from email link)
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
            handleVerifyFromLink(urlToken);
        }
    }, []);

    // Cooldown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleVerifyFromLink = async (verificationToken) => {
        setIsVerifying(true);
        setError("");

        try {
            const response = await axiosInstance.get(
                API_PATHS.AUTH.VERIFY_EMAIL_BY_TOKEN(verificationToken)
            );

            if (response.status === 200) {
                const { token, ...user } = response.data;

                setSuccess("Email verified successfully!");
                setIsVerified(true);
                
                // Store token and login user
                if (token) {
                    localStorage.removeItem('tempEmail');
                    localStorage.removeItem('tempToken');

                    login(response.data, token);

                    setTimeout(() => {
                        navigate("/dashboard");
                    }, 2000);
                }
            }
        } catch (error) {
            setError(error.response?.data?.error || "Verification link is invalid or expired");
            console.error("Verification error:", error);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCodeSubmit = async () => {
        if (!token.trim()) {
            setError("Please enter the verification code");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await axiosInstance.post(
                API_PATHS.AUTH.VERIFY_EMAIL_BY_CODE,
                { code: token }
            );

            if (response.status === 200) {
                const { token: authToken, ...user } = response.data;

                setSuccess("Email verified successfully!");
                setIsVerified(true);

                if (authToken) {
                    localStorage.removeItem('tempEmail');
                    localStorage.removeItem('tempToken');

                    login(response.data, authToken);

                    setTimeout(() => {
                        navigate("/dashboard");
                    }, 2000);
                }
            }
        } catch (error) {
            if (error.response?.status === 400) {
                setError(error.response?.data?.error || "Invalid or expired verification code");
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError("Verification failed. Please try again");
            }
            console.error("Verification error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendEmail = async () => {
        const email = localStorage.getItem(pendingEmail)
        
        if (!email) {
            setError("Email not found");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await axiosInstance.post(
                API_PATHS.AUTH.SEND_VERIFICATION_EMAIL,
                { email }
            );

            if (response.status === 200) {
                setSuccess("Verification email sent! Check your inbox");
                setResendCooldown(60); // 60 second cooldown
                setToken(""); // Clear token input
            }
        } catch (error) {
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError("Failed to resend verification email");
            }
            console.error("Resend error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerified) {
        return (
            <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-linear-to-r from-green-600 to-emerald-600 p-8 text-center">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Check className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Email Verified!
                        </h2>
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center">
                        <p className="text-gray-600 mb-6">
                            Your email has been successfully verified. You now have full access to PerfectReceipt
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Redirecting to dashboard...
                        </p>
                        <Loader2 className="w-6 h-6 text-orange-600 animate-spin mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-orange-600 to-purple-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Verify Your Email
                    </h2>
                    <p className="text-orange-100">
                        {email ? `We sent a verification code to ${email}` : "Check your inbox for verification"}
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Info Box */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm text-orange-800">
                            Click the link in the email or enter the verification code below to verify your account and gain full access to your platform.
                        </p>
                    </div>

                    {/* Token Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => {
                                setToken(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder="Enter code from email"
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                error
                                    ? "border-red-500 focus:border-red-600"
                                    : "border-gray-300 focus:border-orange-500"
                            }`}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <p className="text-sm">{success}</p>
                        </div>
                    )}

                    {/* Verify Button */}
                    <button
                        onClick={handleCodeSubmit}
                        disabled={!token.trim() || isLoading || isVerifying}
                        className="w-full bg-linear-to-r from-orange-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isLoading || isVerifying ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify Email
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    {/* Resend Section */}
                    <div className="border-t pt-6">
                        <p className="text-sm text-gray-600 mb-3">
                            Didn't receive the code?
                        </p>
                        <button
                            onClick={handleResendEmail}
                            disabled={isLoading || resendCooldown > 0}
                            className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-800 disabled:text-gray-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {resendCooldown > 0 ? (
                                <>
                                    <Clock className="w-4 h-4" />
                                    Resend in {resendCooldown}s
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4" />
                                    Resend Code
                                </>
                            )}
                        </button>
                    </div>

                    {/* Back to Login */}
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full text-orange-600 hover:text-orange-700 font-medium py-2 transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail