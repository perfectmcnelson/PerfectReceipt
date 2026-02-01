import { CheckCircle, X } from "lucide-react"
import { useState } from "react";
import {useNavigate} from "react-router-dom"

const Pricing = ({isAuthenticated}) => {

    const [selectedCycle, setSelectedCycle] = useState('monthly');
    // const redirectUser = () => {
    //     if (!isAuthenticated) {
    //         return <Navigate to="/signup" replace />;
    //     } else {
    //         return <Navigate to="/dashboard" replace />;
    //     }
    // }

    const navigate = useNavigate();

    const redirectUser = () => {
        if (isAuthenticated) {
            navigate('/upgrade-plan');
        } else {
            navigate('/signup');
        }
    }

    const plans = [
        {
            name: 'Free',
            price: { monthly: 0, yearly: 0 },
            description: 'Perfect for getting started',
            features: [
                { text: 'Unlimited invoices', included: true },
                { text: 'Unlimited receipts', included: true },
                { text: '5 emails per month', included: true },
                { text: '2 template styles', included: true },
                { text: 'No ads', included: false },
                { text: 'Email support', included: false },
                { text: 'Priority support', included: false },
                { text: 'Custom branding', included: false }
            ], 
            cta: 'Start Free Trial',
            popular: false
        },
        {
            name: 'Professional',
            price: { monthly: 1500, yearly: 16200 },
            description: 'Best for freelancers',
            features: [
                { text: 'Unlimited invoices', included: true },
                { text: 'Unlimited receipts', included: true },
                { text: '50 emails per month', included: true },
                { text: '4 template styles', included: true },
                { text: 'No ads', included: false },
                { text: 'Email support', included: true },
                { text: 'Priority support', included: false },
                { text: 'Custom branding', included: true }
            ],
            cta: 'Get Started',
            popular: true
        },
        {
            name: 'Business',
            price: { monthly: 5000, yearly: 54000 },
            description: 'For growing teams',
            features: [
                { text: 'Unlimited invoices', included: true },
                { text: 'Unlimited receipts', included: true },
                { text: '200 emails per month', included: true },
                { text: 'All 6 template styles', included: true },
                { text: 'No ads', included: true },
                { text: 'Priority email support', included: true },
                { text: '24/7 priority support', included: true },
                { text: 'Advanced custom branding', included: true }
            ],
            cta: 'Get Started',
            popular: false
        }
    ]

    return (
        <section className='py-20 lg:py-28 bg-linear-to-br from-gray-50 to-orange-50/30'>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4'>
                        Simple, Transparent Pricing
                    </h2>
                    <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                        Start free, upgrade when you need more. No hidden fees, cancel anytime.
                    </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex items-center bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setSelectedCycle('monthly')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition ${selectedCycle === 'monthly'
                                    ? 'bg-white text-slate-900 shadow'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setSelectedCycle('yearly')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition ${selectedCycle === 'yearly'
                                    ? 'bg-white text-slate-900 shadow'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Yearly
                            <span className="ml-2 text-xs text-green-600 font-semibold">Save 10%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div key={index} className={`relative bg-white rounded-2xl p-8 ${plan.popular ? 'border-2 border-orange-600 shadow-2xl scale-105' : 'border border-gray-200 shadow-sm'}`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-orange-600 to-orange-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    Most Popular
                                </div>
                            )}
                            <div className="text-center mb-8">
                                <h3 className='text-2xl font-bold text-gray-900 mb-2'>{plan.name}</h3>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-slate-900">
                                        ₦{plan.price[selectedCycle].toLocaleString()}
                                    </span>
                                    <span className="text-slate-500 ml-2">
                                        /{selectedCycle === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                </div>
                                {selectedCycle === 'yearly' && plan.price.yearly > 0 && (
                                    <p className="text-xs text-green-600 mt-1">
                                        Save ₦{(plan.price.monthly * 12 - plan.price.yearly).toLocaleString()}/year
                                    </p>
                                )}
                                <p className='text-gray-600'>{plan.description}</p>
                            </div>

                            <ul className='space-y-4 mb-8'>
                                {plan.features.map((feature, i) => (
                                    <li key={i} className='flex items-start space-x-3'>
                                        {feature.included ? (
                                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        )}
                                        {/* <CheckCircle className='w-5 h-5 text-green-500 shrink-0 mt-0.5' /> */}
                                        <span className='text-gray-600'>{feature.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <button onClick={redirectUser} className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${plan.popular ? 'bg-linear-to-r from-orange-600 to-orange-700 text-white hover:shadow-xl' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Pricing