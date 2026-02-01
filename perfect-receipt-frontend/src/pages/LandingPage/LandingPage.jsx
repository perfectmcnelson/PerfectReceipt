import React from 'react'
import Header from '../../components/landing/Header'
import Hero from '../../components/landing/Hero'
import Features from '../../components/landing/Features'
import Testimonials from '../../components/landing/Testimonials'
import Faqs from '../../components/landing/Faqs'
import Footer from '../../components/landing/Footer'
import UseCases from '../../components/landing/UseCases'
import Stats from '../../components/landing/Stats'
import HowItWorks from '../../components/landing/HowItWorks'
import Benefits from '../../components/landing/Benefits'
import Pricing from '../../components/landing/Pricing'
import CTASection from '../../components/landing/CTASection'
import { useAuth } from '../../context/AuthContext'

const LandingPage = () => {

    const {isAuthenticated} = useAuth();

  return (
        <main>
            <Hero isAuthenticated={isAuthenticated} />
            <Stats />
            <HowItWorks />
            <Benefits />
            <UseCases />
            <Pricing isAuthenticated={isAuthenticated} />
            <CTASection isAuthenticated={isAuthenticated} />
            <Testimonials />
            <Faqs />
        </main>
  )
}

export default LandingPage