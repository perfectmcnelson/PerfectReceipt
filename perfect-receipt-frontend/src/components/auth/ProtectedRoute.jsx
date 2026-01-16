import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({children}) => {

    const {isAuthenticated, loading, user} = useAuth()

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className='w-8 h-8 animate-spin text-orange-600' />
            </div>
        )
    }

    if (user?.suspended) {
        return <Navigate to="/account-suspended" replace />;
    }

    if (!isAuthenticated) {
        return <Navigate to={"/login"} replace />
    }

  return (
    <DashboardLayout>{children ? children : <Outlet />}</DashboardLayout>
  )
}

export default ProtectedRoute