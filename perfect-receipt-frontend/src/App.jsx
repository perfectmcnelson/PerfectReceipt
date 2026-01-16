import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from "react";
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage/LandingPage'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import VerifyEmail from './pages/Auth/VerifyEmail'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import Dashboard from './pages/Dashboard/Dashboard'
import AllInvoices from './pages/Invoices/AllInvoices'
import CreateInvoice from './pages/Invoices/CreateInvoice'
import InvoiceDetail from './pages/Invoices/InvoiceDetail'
import AllReceipts from './pages/Receipts/AllReceipts'
import ReceiptDetail from './pages/Receipts/ReceiptDetail'
import ProfilePage from './pages/Profile/ProfilePage'
import Settings from './pages/Settings/Settings'
import Security from './pages/Security/Security'
import UpgradePlan from './pages/Subscription/UpgradePlan'
import VerifyPayment from './pages/Subscription/VerifyPayment'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ui/ScrollToTop'
import AboutUs from './pages/LandingPage/AboutUs'
import LandingPageLayout from './components/layout/LandingPageLayout'
import ContactUs from './pages/LandingPage/ContactUs'
import TermsOfService from './pages/LandingPage/TermsOfService'
import PrivacyPolicy from './pages/LandingPage/PrivacyPolicy'
import AcceptableUsePolicy from './pages/LandingPage/AcceptableUsePolicy'
import RefundPolicy from './pages/LandingPage/RefundPolicy'
import AccountSuspended from './pages/Auth/AccountSuspended'

const App = () => {


    const navigate = useNavigate();


    useEffect(() => {
        const handleSuspension = (event) => {
            const data = event.detail;

            localStorage.clear();

            navigate("/account-suspended", {
            state: {
                reason: data?.message || "Your account has been suspended"
            }
            });
        };

        window.addEventListener("account:suspended", handleSuspension);

        return () => {
            window.removeEventListener("account:suspended", handleSuspension);
        };
    }, []);


  return (
    <AuthProvider>
      {/* <Router> */}
        <ScrollToTop />
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route element={<LandingPageLayout />}>
            <Route path='/' element={<LandingPage />} />
            <Route path='/about-us' element={<AboutUs />} />
            <Route path='/contact-us' element={<ContactUs />} />
            <Route path='/terms-of-service' element={<TermsOfService />} />
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
            <Route path='/acceptable-use-policy' element={<AcceptableUsePolicy />} />
            <Route path='/refund-policy' element={<RefundPolicy />} />
          </Route>

          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/account-suspended' element={<AccountSuspended />} />
          <Route path='/verify-email' element={<VerifyEmail />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/invoices' element={<AllInvoices />} />
            <Route path='/invoices/new' element={<CreateInvoice />} />
            <Route path='/invoices/:id' element={<InvoiceDetail />} />
            <Route path='/receipts' element={<AllReceipts />} />
            <Route path='/receipts/:id' element={<ReceiptDetail />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/security' element={<Security />} />
            <Route path='/upgrade-plan' element={<UpgradePlan />} />
            <Route path='/subscription/verify' element={<VerifyPayment />} />
          </Route>

          {/* CATCH ALL - MUST BE LAST */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      {/* </Router> */}

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          }
        }}
      />
    </AuthProvider>
  )
}

export default App