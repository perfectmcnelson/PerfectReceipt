// components/auth/GoogleSignIn.jsx

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleSignIn = () => {
    const navigate = useNavigate();
    const { login, setUser, setIsAuthenticated, setToken, fetchSettings } = useAuth();

    const handleSuccess = async (credentialResponse) => {
        console.log('Google credentialResponse:', credentialResponse);
        if (!credentialResponse?.credential) {
            toast.error('Google credential missing');
            return;
        }

        try {
            // Send credential to backend
            const response = await axiosInstance.post(API_PATHS.AUTH.GOOGLE_LOGIN, {
                credential: credentialResponse.credential
            });

            const { token, ...userData } = response.data;

            if (!token) {
                toast.error('Authentication token missing in response');
                return;
            }

            // Store token in localStorage and update axios instance
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setToken(token);
            setUser(userData);
            setIsAuthenticated(true);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await fetchSettings();
            
            toast.success('Welcome to your dashboard!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Google sign-in error:', error);
            const errorMessage = error.response?.data?.message || 'Google sign-in failed';
            toast.error(errorMessage);
        }
    };

    const handleError = () => {
        console.error('Google Sign-In error occurred');
        toast.error('Google sign-in was unsuccessful');
    };

    return (
        <div className="mt-4">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
            </div>

            <div className="mt-4 flex justify-center">
                <GoogleLogin 
                    onSuccess={handleSuccess} 
                    onError={handleError}
                    useOneTap={false}
                />
            </div>
        </div>
    );
};

export default GoogleSignIn;