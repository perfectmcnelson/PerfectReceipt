import React, { useState, useEffect } from 'react'
import {
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Lock,
    FileText,
    ArrowRight,
    User
} from "lucide-react";
import { API_PATHS } from '../../utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../utils/helper';
import GoogleSignIn from '../../components/auth/GoogleSignIn';
import { Link } from 'react-router-dom';

const SignUp = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    // Validate Functions
    const validateName = (name) => {
        if (!name) return "Name is required";
        if (name.length < 2) return "Name must be at least 2 characters";
        if (name.length > 50) return "Name must be less than 50 characters";
        return "";
    };

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) return "Please confirm your password";
        if (confirmPassword !== password) return "Passwords do not match";
        return "";
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (touched[name]) {
            const newFieldErrors = { ...fieldErrors };
            if (name === "name") {
                newFieldErrors.name = validateName(value);
            } else if (name === "email") {
                newFieldErrors.email = validateEmail(value);
            } else if (name === "password") {
                newFieldErrors.password = validatePassword(value);
                if (touched.confirmPassword) {
                    newFieldErrors.confirmPassword = validateConfirmPassword(value, formData.confirmPassword)
                }
            } else if (name === "confirmPassword") {
                newFieldErrors.confirmPassword = validateConfirmPassword(formData.password, value)
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
        if (name === "name") {
            newFieldErrors.name = validateName(formData.name);
        } else if (name === "email") {
            newFieldErrors.email = validateEmail(formData.email);
        } else if (name === "password") {
            newFieldErrors.password = validatePassword(formData.password);
        } else if (name === "confirmPassword") {
            newFieldErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
        }
        setFieldErrors(newFieldErrors)
    };

    const isFormValid = () => {
        const nameError = validateName(formData.name);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
        return !nameError && !emailError && !passwordError && !confirmPasswordError && formData.name && formData.email && formData.password && formData.confirmPassword;
    };

    const handleSubmit = async () => {
        const nameError = validateName(formData.name);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);

        if (nameError || emailError || passwordError || confirmPasswordError) {
            setFieldErrors({
                name: nameError,
                email: emailError,
                password: passwordError,
                confirmPassword: confirmPasswordError,
            });
            setTouched({
                name: true,
                email: true,
                password: true,
                confirmPassword: true
            });
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axiosInstance.post(
                API_PATHS.AUTH.REGISTER,
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }
            );

            if (response.status === 201) {
                const { token, ...userData } = response.data;

                if (token) {
                    setSuccess("Account created successfully! Please verify your email.");
                    localStorage.setItem('token', token);
                    // localStorage.setItem("user", userData)
                    localStorage.setItem('pendingEmail', formData.email);
                    
                    setFormData({
                        name: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                    });

                    setTouched({
                        name: false,
                        email: false,
                        password: false,
                        confirmPassword: false,
                    })

                    setTimeout(() => {
                        navigate("/verify-email");
                    }, 1000);
                }
            } else {
                setError(response.data.message || "Registration failed!")
            }
        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.response?.status === 409) {
                setError("Email already exists. Please login or use a different email.");
            } else {
                setError("Registration failed. Please try again")
            }
            console.error("API error: ", error)
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
                        Create Account
                    </h2>
                    <p className="text-orange-100">
                        Join <Link to={"/"} className="text-white font-bold">PerfectReceipt</Link>
                    </p>
                </div>

                {/* Form */}
                <div className="p-8 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                    fieldErrors.name && touched.name
                                        ? "border-red-500 focus:border-red-600"
                                        : "border-gray-300 focus:border-orange-500"
                                }`}
                                placeholder="John Doe"
                            />
                        </div>
                        {fieldErrors.name && touched.name && (
                            <p className="text-red-600 text-sm mt-1">
                                {fieldErrors.name}
                            </p>
                        )}
                    </div>

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
                                placeholder="Create a password"
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

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-12 pr-12 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                    fieldErrors.confirmPassword && touched.confirmPassword
                                        ? "border-red-500 focus:border-red-600"
                                        : "border-gray-300 focus:border-orange-500"
                                }`}
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && touched.confirmPassword && (
                            <p className="text-red-600 text-sm mt-1">
                                {fieldErrors.confirmPassword}
                            </p>
                        )}
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

                    {/* Sign Up Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid() || isLoading}
                        className="w-full bg-linear-to-r from-orange-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    {/* Google Sign In */}
                    <GoogleSignIn />
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <button
                            className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                            onClick={() => navigate("/login")}
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignUp;