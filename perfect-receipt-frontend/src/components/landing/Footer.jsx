import React from 'react'
import { Link } from 'react-router-dom'
import {SiGithub, SiX, SiLinkedin} from "react-icons/si"
import { FileText } from 'lucide-react';
// import { Twitter, Github } from 'lucide-react'


const FooterLink = ({href, to, children}) => {
    const className = "block text-white-400 hover:text-white transition-colors duration-200";

    if (to) {
        return (
            <Link to={to} className={className}>
                {children}
            </Link>
        )
    }

    return (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    )
}

const SocialLinks = ({href, children}) => {
    return (
        <a 
            href={href}
            className='w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-200'
            target='_blank'
            rel='noopener noreferrer'
        >
            {children}
        </a>
    )
}

const Footer = () => {

    return (
        <footer className='bg-orange-950 text-white'>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-4 md:col-span-2 lg:col-span-1">
                        <Link to={"/"} className='flex items-center space-x-2 mb-4'>
                            <div className="w-8 h-8 rounded-md flex items-center justify-center">
                                {/* <FileText className='w-4 h-4 text-white' /> */}
                                <img src="/images/perfectreceiptlogo-nobg.png" alt="Perfect Receipt Logo" />
                            </div>
                            <span className='text-xl font-bold'>Perfect<span className='text-green-700 font-extrabold'>Receipt</span></span>
                        </Link>
                        <p className='text-white-400 leading-relaxed max-w-sm'>
                            Create 2 in 1 Invoicing and Receipt from simple text, generate payment reminders, and smart insights to help you manage your finances.
                        </p>
                    </div>
                    <div className="">
                        <h3 className='text-base text-green-700 font-bold mb-4'>Product</h3>
                        <ul className='space-y-2'>
                            <li>
                                <FooterLink href={"#how-it-works"}>How it works</FooterLink>
                            </li>
                            <li>
                                <FooterLink href={"#testimonials"}>Testimonials</FooterLink>
                            </li>
                            <li>
                                <FooterLink href={"#faq"}>FAQ</FooterLink>
                            </li>
                        </ul>
                    </div>
                    <div className="">
                        <h3 className='text-base text-green-700 font-bold mb-4'>Company</h3>
                        <ul className='space-y-2'>
                            <li><FooterLink to={"/about-us"}>About Us</FooterLink></li>
                            <li><FooterLink to={"/contact-us"}>Contact Us</FooterLink></li>
                        </ul>
                    </div>
                    <div className="">
                        <h3 className='text-base text-green-700 font-bold mb-4'>Legal</h3>
                        <ul className='space-y-2'>
                            <li>
                                <FooterLink to={"/privacy-policy"}>Privacy Policy</FooterLink>
                            </li>
                            <li>
                                <FooterLink to={"/refund-policy"}>Refund Policy</FooterLink>
                            </li>
                            <li>
                                <FooterLink to={"/acceptable-use-policy"}>Acceptable Use Policy</FooterLink>
                            </li>
                            <li>
                                <FooterLink to={"/terms-of-service"}>Terms of Service</FooterLink>
                            </li>
                            
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white py-8 mt-16">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className='text-white-600'>&copy; {new Date().getFullYear()} PerfectReceipt. All rights reserved.</p>
                        <div className="flex space-x-4">
                            <SocialLinks href={"#"}>
                                <SiX className='w-5 h-5' />
                            </SocialLinks>
                            <SocialLinks href={"#"}>
                                <SiGithub className='w-5 h-5' />
                            </SocialLinks>
                            <SocialLinks href={"#"}>
                                <SiLinkedin className='w-5 h-5' />
                            </SocialLinks>
                            {/* <SocialLinks href={"#"}>
                                <SiX className='' />
                            </SocialLinks> */}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer