import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const VerifyPayment = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, failed

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        const reference = searchParams.get('reference');
        
        if (!reference) {
            setStatus('failed');
            return;
        }

        try {
            const response = await axiosInstance.get(
                API_PATHS.SUBSCRIPTION.VERIFY(reference)
            );
            
            if (response.data.subscription) {
                setStatus('success');
                setTimeout(() => {
                    navigate('/upgrade-plan');
                }, 3000);
            }
        } catch (error) {
            setStatus('failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
                        <p className="text-gray-600">Please wait while we confirm your payment</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
                        <p className="text-gray-600">Your subscription has been upgraded</p>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
                        <p className="text-gray-600 mb-4">Something went wrong with your payment</p>
                        <button 
                            onClick={() => navigate('/upgrade-plan')}
                            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                        >
                            Try Again
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyPayment;