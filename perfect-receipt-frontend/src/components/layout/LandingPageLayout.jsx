import React from 'react'
import Header from '../landing/Header'
import Footer from '../landing/Footer'
import { Outlet } from 'react-router-dom'

const LandingLayout = ({children}) => {
    return (
        <div className='bg-[#ffffff] text-gray-600'>
            <Header />
            <main className="flex-1 overflow-auto p-6">{children}</main>
            <Footer />
        </div>
    )
}

const LandingPageLayout = ({children}) => {

    return (
        <LandingLayout>{children ? children : <Outlet />}</LandingLayout>
  )
}

export default LandingPageLayout