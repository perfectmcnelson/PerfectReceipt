import React, { useState, useEffect } from 'react'
import {
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Lock,
    FileText,
    ArrowRight
} from "lucide-react";
import { API_PATHS } from '../../utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../utils/helper';
import GoogleSignIn from '../../components/auth/GoogleSignIn';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Login = () => {
    const { login, error, setError, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        password: "",
    });
    const [touched, setTouched] = useState({
        email: false,
        password: false,
    });

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate("/dashboard");
        }
    }, [loading, isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (touched[name]) {
            const newFieldErrors = { ...fieldErrors };
            if (name === "email") {
                newFieldErrors.email = validateEmail(value);
            } else if (name === "password") {
                newFieldErrors.password = validatePassword(value);
            }
            setFieldErrors(newFieldErrors)
        }

        if (error) setError("")
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }))

        const newFieldErrors = { ...fieldErrors };
        if (name === "email") {
            newFieldErrors.email = validateEmail(formData.email);
        } else if (name === "password") {
            newFieldErrors.password = validatePassword(formData.password);
        }
        setFieldErrors(newFieldErrors)
    };

    const isFormValid = () => {
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        return !emailError && !passwordError && formData.email && formData.password;
    };

    const handleSubmit = async () => {
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);

        if (emailError || passwordError) {
            setFieldErrors({
                email: emailError,
                password: passwordError,
            });
            setTouched({
                email: true,
                password: true,
            });
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            await login(formData);
            setSuccess("Login Successful!");
            toast.success('Login successful!');
            navigate("/dashboard");
        } catch (error) {
            console.error("Login error:", error);

            if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
                navigate("/verify-email", {
                    state: { email: formData.email }
                });
                return;
            }
            
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.response?.status === 401) {
                setError("Invalid email or password");
            } else if (error.response?.status === 400) {
                setError("Please fill in all fields");
            } else {
                setError("An error occurred during login. Please try again.")
            }

            toast.error(error?.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center md:p-4">
            <div className="max-w-md w-full bg-white md:rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-orange-600 to-purple-600 p-8 text-center">
                    <Link to={"/"} className="block w-16 h-16 p-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <img src="/images/perfectreceiptlogo-nobg.png" alt="Perfect Receipt Logo" />
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Login to Your Account
                    </h2>
                    <p className="text-orange-100">
                        Welcome back to <Link to={"/"} className="text-white font-bold">PerfectReceipt</Link>
                    </p>
                </div>

                {/* Form */}
                <div className="p-8 space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                    fieldErrors.email && touched.email
                                        ? "border-red-500 focus:border-red-600"
                                        : "border-gray-300 focus:border-orange-500"
                                }`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {fieldErrors.email && touched.email && (
                            <p className="text-red-600 text-sm mt-1">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-12 pr-12 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                    fieldErrors.password && touched.password
                                        ? "border-red-500 focus:border-red-600"
                                        : "border-gray-300 focus:border-orange-500"
                                }`}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {fieldErrors.password && touched.password && (
                            <p className="text-red-600 text-sm mt-1">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <p className="text-sm">{success}</p>
                        </div>
                    )}

                    {/* Sign In Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid() || isLoading}
                        className="w-full bg-linear-to-r from-orange-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    {/* Google Sign In */}
                    <GoogleSignIn />
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 text-center space-y-3">
                    <p className="text-gray-600">
                        Don't have an account?{" "}
                        <button
                            className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                            onClick={() => navigate("/signup")}
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login;