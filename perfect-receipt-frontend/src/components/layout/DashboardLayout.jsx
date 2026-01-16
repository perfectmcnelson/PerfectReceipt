import React, {useState, useEffect} from 'react'
import {
    ArrowDown,
    ArrowDown01,
    ArrowDown01Icon,
    ArrowDown10,
    ArrowDown10Icon,
    ArrowDownAZ,
    ArrowDownCircle,
    Briefcase,
    ChevronDown,
    LogOut,
    Menu,
    X
} from "lucide-react"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ProfileDropdown from './ProfileDropdown'
import { NAVIGATION_MENU } from '../../utils/data'


const NavigationItem = ({item, isActive, onClick, isCollapsed}) => {
    const Icon = item.icon;

    return (
        <div className="relative group">
            <button 
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isCollapsed ? 'cursor-pointer' : ''} ${
                    isActive
                    ? "bg-orange-50 text-orange-900 shadow-sm shadow-orange-50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => onClick(item.id)}
                title={isCollapsed ? item.name : ""}
            >
                <Icon 
                    className={`h-5 w-5 shrink-0 ${isCollapsed ? 'cursor-pointer' : ''} ${
                        isActive ? "text-orange-900" : "text-gray-500"
                    }`}
                />
                {!isCollapsed && <span className="ml-4 truncate">{item.name}</span> }
            </button>
            {isCollapsed && (
                <div className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-40">
                    {item.name}
                </div>
            )}
        </div>
    )
}

const DashboardLayout = ({children, activeMenu}) => {

    const {user, logout, loading, isAuthenticated} = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard")
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleLogout = () => {
        logout(navigate);
    };

    useEffect(() => {
            if (!isAuthenticated) {
                navigate("/login");
            }
    }, [isAuthenticated, loading, navigate]);
    // const [ invoiceDropdownOpen, setInvoiceDropdownOpen ] = useState([]);

    // The above can also be an object if multiple dropdowns are needed
    const [ dropdownsOpen, setDropdownsOpen ] = useState({
        invoices: false,
        receipts: false,
    });

    // Handle responsive bahavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (profileDropdownOpen) {
                setProfileDropdownOpen(false)
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [profileDropdownOpen])   

    const handleNavigation = (itemId) => {
        setActiveNavItem(itemId)
        navigate(`/${itemId}`);
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const toggleSidebarCollapsed = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    }

    const sidebarCollapsedDesktop = !isMobile && sidebarCollapsed;

    console.log(user);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${
                isMobile
                    ? sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    : "translate-x-0"
                } ${
                    sidebarCollapsedDesktop ? "w-16" : "w-64"
                } bg-white border-r border-gray-200`}
            >
                {/* Company Logo */}
                <div className="flex items-center h-16 border-b border-gray-200 px-4">
                    <Link className='flex items-center space-x-3' to={"/dashboard"}>
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center">
                            {/* <Briefcase className='h-5 w-5 text-white' /> */}
                            <img src="/images/perfectreceiptlogo-nobg.png" alt="" />
                        </div>
                        {!sidebarCollapsedDesktop && <span className="text-orange-800 font-bold text-xl">Perfect<i className='not-italic text-green-700'>Receipt</i></span> }
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2 flex flex-col">
                    {NAVIGATION_MENU.map((menu) => (
                        menu.items ? (
                            <div key={menu.id} className="space-y-1">
                                {!sidebarCollapsedDesktop && (
                                    <button 
                                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 }`}
                                        onClick={() => {
                                            setDropdownsOpen((prev) => ({
                                                ...prev,
                                                [menu.id]: !prev[menu.id],
                                            }));
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <menu.icon
                                                className={`h-5 w-5 shrink-0 text-gray-500}`}
                                            />
                                            {!sidebarCollapsedDesktop && <span className="ml-4 truncate">{menu.id}</span> }
                                        </div>
                                        <div className="">
                                            <ChevronDown className='h-4 w-4 text-gray-400' />
                                        </div>
                                    </button>
                                )}

                                {!sidebarCollapsedDesktop && (
                                    dropdownsOpen[menu.id] && (
                                        <div className="pl-3 mt-1 space-y-1">
                                            {menu.items.map((item) => (
                                                <NavigationItem 
                                                    key={item.id}
                                                    item={item}
                                                    isActive={location.pathname === `/${item.id}`}
                                                    onClick={handleNavigation}
                                                    isCollapsed={sidebarCollapsedDesktop}
                                                />
                                            ))}
                                        </div>
                                    )
                                )}

                                {sidebarCollapsedDesktop && (
                                    <div className="space-y-1">
                                        {menu.items.map((item) => (
                                            <NavigationItem 
                                                key={item.id}
                                                item={item}
                                                isActive={location.pathname === `/${item.id}`}
                                                onClick={handleNavigation}
                                                isCollapsed={sidebarCollapsedDesktop}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (   
                            <NavigationItem 
                                key={menu.id}
                                item={menu}
                                isActive={location.pathname === `/${menu.id}`}
                                onClick={handleNavigation}
                                isCollapsed={sidebarCollapsedDesktop}
                            />
                        )
                    ))}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="relative group">
                        <button 
                            className={`w-full flex ${sidebarCollapsedDesktop ? 'justify-center' : 'items-center'} px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 cursor-pointer`}
                            onClick={handleLogout}
                            title={sidebarCollapsedDesktop ? "Logout" : ""}
                        >
                            <LogOut className='h-5 w-5 shrink-0 text-gray-500' />
                            {!sidebarCollapsedDesktop && <span className="ml-3">Logout</span>}
                        </button>
                        {sidebarCollapsedDesktop && (
                            <div className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-40">
                                Logout
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile overlay */}
            {
                isMobile && sidebarOpen && (
                    <div 
                        className='fixed inset-0 bg-black/10 bg-opacity-25 z-40 backdrop-blur-sm'
                        onClick={() => setSidebarOpen(false)}
                    />
                )
            }

            {/* Main Content */}
            <div 
                className={`flex-1 flex flex-col transition-all duration-300 ${
                    isMobile ? "ml-0" : sidebarCollapsedDesktop ? "ml-16" : "ml-64"
                }`}
            >
                {/* Top Navbar */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center space-x-4">
                        {isMobile && (
                            <button 
                                onClick={toggleSidebar}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                            >
                                {sidebarOpen ? (
                                    <X className='h-5 w-5 text-gray-600' />
                                ) : (
                                    <Menu className='h-5 w-5 text-gray-600' />
                                )}
                            </button>
                        )}
                        {!isMobile && (
                            <button 
                                onClick={toggleSidebarCollapsed}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                <Menu className='h-5 w-5 text-gray-600' /> 
                                {/* {
                                    sidebarCollapsed 
                                        ? <Menu className='h-5 w-5 text-gray-600' /> 
                                        : <X className='h-5 w-5 text-gray-600' /> 
                                } */}
                            </button>
                        )}
                        <div>
                            <h1 className="text-base font-semibold text-gray-900">
                                Welcome back, {user?.name}!
                            </h1>
                            {
                                user?.suspended && 
                                    <p className="text-sm text-red-500 font-bold hidden sm:block">
                                        Account Suspended!
                                    </p>
                                }
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Profile dropdown */}
                        <ProfileDropdown 
                            isOpen={profileDropdownOpen}
                            onToggle={(e) => {
                                e.stopPropagation();
                                setProfileDropdownOpen(!profileDropdownOpen);
                            }}
                            avatar={user?.profilePicture || ""}
                            companyName={user?.name || ""}
                            email={user?.email || ""}
                            onLogout={handleLogout}
                        />
                    </div>
                </header>

                {/* Main content area */}
                <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
            </div>
        </div>
    )
}

export default DashboardLayout