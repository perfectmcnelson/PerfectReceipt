


import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, Zap, Shield, TrendingUp, Clock, Users, CheckCircle, ArrowRight, Sparkles, BarChart, Globe, Download, Mail, Phone, ChevronDown, Menu, X, Quote, Star } from 'lucide-react'

// Enhanced Hero Component
const Hero = ({ isAuthenticated }) => {
  return (
    <section className='relative bg-linear-to-br from-gray-50 via-orange-50/30 to-white overflow-hidden'>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-2 mb-6">
            <Sparkles className='w-4 h-4 text-orange-600' />
            <span className='text-sm font-semibold text-orange-900'>Trusted by 10,000+ businesses worldwide</span>
          </div>
          
          <h1 className='text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6'>
            Professional Invoicing &{' '}
            <span className='bg-linear-to-r from-orange-600 to-orange-900 bg-clip-text text-transparent'>
              Receipt Generation
            </span>
            {' '}Made Simple
          </h1>
          
          <p className='text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto'>
            Create stunning invoices and receipts in seconds, not hours. PerfectReceipt combines powerful automation with beautiful design to help you get paid faster and look professional.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {isAuthenticated ? (
              <Link to="/dashboard" className='group bg-linear-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2'>
                <span>Go to Dashboard</span>
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </Link>
            ) : (
              <Link to="/signup" className='group bg-linear-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2'>
                <span>Start Free Trial</span>
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </Link>
            )}
            <a href="#demo" className='border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center space-x-2'>
              <span>Watch Demo</span>
              <span className='text-sm block'>(2 mins)</span>
            </a>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className='w-5 h-5 text-green-500' />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className='w-5 h-5 text-green-500' />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className='w-5 h-5 text-green-500' />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
        
        <div className="mt-16 sm:mt-20 relative max-w-6xl mx-auto">
          <div className="absolute -inset-4 bg-linear-to-r from-orange-600 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
          <img 
            src="/images/perfect-receipt-dashboard.png" 
            alt="Dashboard Preview" 
            className='relative rounded-2xl shadow-2xl border border-gray-200/50'
          />
        </div>
      </div>
    </section>
  )
}

export default Hero