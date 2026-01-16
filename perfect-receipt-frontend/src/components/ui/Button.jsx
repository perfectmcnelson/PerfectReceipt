import React from 'react'
import { Loader2 } from 'lucide-react'

const Button = ({
    variant = "primary",
    size = "medium",
    isLoading = false,
    otherClasses = "",
    children,
    icon: Icon,
    ...props
}) => {


    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap";

    const variantClasses = {
        primary: "bg-orange-900 text-white hover:bg-orange-800",
        // secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200",
        secondary: "bg-purple-900 text-white hover:bg-purple-800 border border-slate-200",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
        success: "bg-green-600 hover:bg-green-700 text-white",
        // danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizeClasses = {
        small: "px-3 py-1 h-8 text-sm",
        medium: "px-4 py-2 h-10 text-sm",
        large: "px-6 py-3 text-base",
    };

  return (
    <button
        className={`${baseClasses} ${otherClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
        disabled={isLoading}
        {...props}
    >
        {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
            <>
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                {children}
            </>
        )}
    </button>
  )
}

export default Button