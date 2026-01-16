import React from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Menu, X } from 'lucide-react'
import ProfileDropdown from '../layout/ProfileDropdown'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

const Header = () => {

    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const {isAuthenticated, user, logout} = useAuth();
    // const user = { name: "John Doe", email: "johndoe@gmail.com" };
    // const logout = () => {}
    
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(navigate);
    };


    useEffect(() => {
        const handleClickOutside = () => {
            if (profileDropdownOpen) {
                setProfileDropdownOpen(false)
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [profileDropdownOpen])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        }
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // useEffect(() => {
    //     const handleClickOutside = () => {
    //         if (menuOpen) {
    //             setMenuOpen(false)
    //         }
    //     };

    //     document.addEventListener("click", handleClickOutside);
    //     return () => document.removeEventListener("click", handleClickOutside);
    // }, [menuOpen])

  return (
    <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 bg-gray-100 ${
            isScrolled ? "bg-white/95 backdrop-blur-sm shadow-lg" : "bg-white/0"
        }`}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center">
                        {/* <FileText className="w-4 h-4 text-white" /> */}
                        <img src="/images/perfectreceiptlogo-nobg.png" alt="Perfect Receipt Logo" />
                    </div>
                    <span className='text-xl font-bold text-orange-800'>
                        Perfect<span className='text-green-700 font-extrabold'>Receipt</span>
                    </span>
                </div>
                <div className="hidden lg:flex lg:items-center lg:space-x-8">
                    <Link to="/" className='text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full'>
                        Home
                    </Link>
                    <Link to="/about-us" className='text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full'>
                        About Us
                    </Link>
                    <Link to="/contact-us" className='text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full'>
                        Contact Us
                    </Link>
                </div>
                <div className="hidden lg:flex items-center space-x-4">
                    {isAuthenticated ? 
                        (
                            // In ProfileDropdown component, pass logo
                            <ProfileDropdown 
                                isOpen={profileDropdownOpen}
                                onToggle={(e) => {
                                    e.stopPropagation();
                                    setProfileDropdownOpen(!profileDropdownOpen);
                                }}
                                avatar={user?.profilePicture || null} // Changed from avatar
                                companyName={user?.name || ""}
                                email={user?.email || ""}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <>
                                <Link 
                                    to={"/login"}
                                    className='text-black hover:text-gray-900 font-medium transition-colors duration-200'
                                >
                                    Login
                                </Link>
                                <Link
                                    to={"/signup"}
                                    className='bg-linear-to-r from-orange-950 to-orange-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg'
                                >
                                    Sign Up
                                </Link>
                            </>
                        )
                    }
                </div>
                <div className="lg:hidden">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className='p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 cursor-pointer'
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>

        {menuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {/* <a href="#how-it-works" className='block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200'>How It Works</a>
                    <a href="#testimonials" className='block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200'>Testimonials</a>
                    <a href="#faq" className='block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200'>FAQ</a> */}

                    <Link to="/" onClick={() => setMenuOpen(!menuOpen)} className='block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200'>
                        Home
                    </Link>
                    <Link to="/about-us" onClick={() => setMenuOpen(!menuOpen)} className='block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200'>
                        About Us
                    </Link>
                    <Link to="/contact-us" onClick={() => setMenuOpen(!menuOpen)} className='block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200'>
                        Contact Us
                    </Link>

                    <div className="border-t border-gray-200 my-2"></div>

                    {isAuthenticated ? (
                        <div className="p-4">
                            <Button
                                onClick={() => navigate("/dashboard")}
                                otherClasses='w-full'
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Link to={"/login"} className='block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200'>
                                Login
                            </Link>
                            <Link to={"/signup"} className='block w-full text-left bg-gray-900 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200'>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        )}
    </header>
  )
}

export default Header