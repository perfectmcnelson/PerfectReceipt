import React, { useState, useEffect } from 'react';
import { 
    Check, 
    X, 
    Loader2, 
    CreditCard, 
    Calendar,
    Download,
    Zap,
    Shield,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import moment from 'moment';
import { useAuth } from '../../context/AuthContext';


const UpgradePlan = () => {
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [billingHistory, setBillingHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingPlan, setProcessingPlan] = useState(null);
    const [selectedCycle, setSelectedCycle] = useState('monthly');
    const {currencyIcon, user} = useAuth()

    const planMessages = {
        premium: ({ name, email }) => `
            Hello,

            I’d like to upgrade my subscription on PerfectReceipt.

            Plan: PREMIUM
            Name: ${name}
            Email: ${email}

            Please send the payment details. Thank you.
        `,

        business: ({ name, email }) => `
            Hello,

            I’d like to upgrade my subscription on PerfectReceipt.

            Plan: BUSINESS
            Name: ${name}
            Email: ${email}

            I’m interested in the Business plan. Please share pricing and payment details.

            Thank you.
        `
    };

    const WHATSAPP_NUMBER = "2348039835547";

    const generateWaLink = (plan, user) => {
        const messageBuilder = planMessages[plan];

        if (!messageBuilder) return "#";

        const message = messageBuilder(user);
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    };

    
    const fetchSubscriptionData = async () => {
        setLoading(true);
        try {
            const [subRes, billingRes] = await Promise.all([
                axiosInstance.get(API_PATHS.SUBSCRIPTION.GET),
                axiosInstance.get(API_PATHS.SUBSCRIPTION.BILLING_HISTORY)
            ]);
            
            setCurrentSubscription(subRes.data);
            setBillingHistory(billingRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subscription data');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const handleUpgrade = async (plan) => {
        setProcessingPlan(plan);
        try {
            const response = await axiosInstance.post(API_PATHS.SUBSCRIPTION.INITIALIZE, {
                plan,
                billingCycle: selectedCycle
            });
            
            // Redirect to Paystack payment page
            window.location.href = response.data.authorizationUrl;
        } catch (error) {
            console.error(error);
            toast.error('Failed to initialize payment');
            setProcessingPlan(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Are you sure you want to cancel your subscription? You can continue using premium features until the end of your billing period.')) {
            return;
        }

        try {
            await axiosInstance.post(API_PATHS.SUBSCRIPTION.CANCEL);
            toast.success('Subscription cancelled successfully');
            fetchSubscriptionData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to cancel subscription');
        }
    };

    const plans = [
        {
            name: 'Free',
            price: { monthly: 0, yearly: 0 },
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
            color: 'gray'
        },
        {
            name: 'Premium',
            price: { monthly: 1500, yearly: 16200 },
            features: [
                { text: 'Unlimited invoices', included: true },
                { text: 'Unlimited receipts', included: true },
                { text: '50 emails per month', included: true },
                { text: '4 template styles', included: true },
                { text: 'No ads', included: true },
                { text: 'Email support', included: true },
                { text: 'Priority support', included: false },
                { text: 'Custom branding', included: true }
            ],
            color: 'orange',
            popular: true
        },
        {
            name: 'Business',
            price: { monthly: 5000, yearly: 54000 },
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
            color: 'purple'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Subscription & Billing</h1>
                <p className="text-sm text-slate-600 mt-1">
                    Manage your subscription plan and billing information
                </p>
            </div>

            {/* Payment Update Alert */}
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />

                <div className="text-sm leading-relaxed">
                    <p className="font-semibold">Payment Update</p>
                    <p>
                        Paystack payment is currently under review. Please use the{" "}
                        <span className="font-medium">WhatsApp upgrade option</span> below to
                        complete your subscription. Your account will be upgraded immediately
                        after payment confirmation.
                    </p>
                </div>
            </div>

            {/* Current Plan Card */}
            <div className="bg-linear-to-r from-orange-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm opacity-90">Current Plan</p>
                        <h2 className="text-3xl font-bold mt-1 capitalize">{currentSubscription?.plan}</h2>
                        {currentSubscription?.currentPeriodEnd && (
                            <p className="text-sm mt-2 opacity-90">
                                {currentSubscription.status === 'cancelled' ? 'Expires' : 'Renews'} on{' '}
                                {moment(currentSubscription.currentPeriodEnd).format('MMM D, YYYY')}
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <Shield className="w-12 h-12 opacity-90" />
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            currentSubscription?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                            {currentSubscription?.status === 'active' ? 'Active' : 'Cancelled'}
                        </span>
                    </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white border-opacity-20">
                    {/** Helper render for each stat block **/}
                    {(() => {
                        const usage = currentSubscription?.usage || {};
                        const limits = currentSubscription?.limits || {};

                        const stats = [
                            {
                                key: 'invoices',
                                label: 'Invoices',
                                used: usage.invoicesCreated || 0,
                                limit: limits.invoicesPerMonth ?? -1
                            },
                            {
                                key: 'receipts',
                                label: 'Receipts',
                                used: usage.receiptsGenerated || 0,
                                limit: limits.receiptsPerMonth ?? -1
                            },
                            {
                                key: 'emails',
                                label: 'Emails',
                                used: usage.emailsSent || 0,
                                limit: limits.emailsPerMonth ?? -1
                            }
                        ];

                        return stats.map((s) => {
                            const isUnlimited = s.limit === -1;
                            const remaining = isUnlimited ? Infinity : Math.max(0, s.limit - s.used);
                            const percent = isUnlimited ? 100 : Math.min(100, Math.round((s.used / Math.max(1, s.limit)) * 100));

                            // color: warning if >80%
                            const barColor = isUnlimited ? 'bg-green-400' : percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-yellow-400' : 'bg-green-400';

                            return (
                                <div key={s.key} className="bg-white bg-opacity-20 rounded-md p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-600">{s.label}</p>
                                        <p className="text-lg font-bold text-slate-900">
                                            {isUnlimited ? 'Unlimited' : `${s.used} / ${s.limit}`}
                                        </p>
                                    </div>

                                    <div className="mt-2">
                                        <div className="w-full bg-slate-200 bg-opacity-40 h-2 rounded overflow-hidden">
                                            <div className={`${barColor} h-2`} style={{ width: `${percent}%` }} />
                                        </div>
                                        <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                                            <span>
                                                {isUnlimited ? 'No limits' : `${remaining} remaining`}
                                            </span>
                                            {!isUnlimited && (
                                                <span className="font-mono text-slate-700">{percent}%</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setSelectedCycle('monthly')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                            selectedCycle === 'monthly'
                                ? 'bg-white text-slate-900 shadow'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setSelectedCycle('yearly')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                            selectedCycle === 'yearly'
                                ? 'bg-white text-slate-900 shadow'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Yearly
                        <span className="ml-2 text-xs text-green-600 font-semibold">Save 10%</span>
                    </button>
                </div>
            </div>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative bg-white rounded-xl border-2 ${
                            plan.popular ? 'border-orange-600' : 'border-slate-200'
                        } p-6 hover:shadow-lg transition`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                                    MOST POPULAR
                                </span>
                            </div>
                        )}

                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
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
                        </div>

                        <ul className="mt-6 space-y-3">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    {feature.included ? (
                                        <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                                    ) : (
                                        <X className="w-5 h-5 text-red-400 mr-2 shrink-0 mt-0.5" />
                                    )}
                                    <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6">
                            {currentSubscription?.plan === plan.name.toLowerCase() ? (
                                currentSubscription?.status === 'active' ? (
                                    <Button
                                        variant="secondary"
                                        otherClasses="w-full"
                                        onClick={handleCancelSubscription}
                                    >
                                        Cancel Plan
                                    </Button>
                                ) : (
                                    <Button variant="secondary" otherClasses="w-full" disabled>
                                        Current Plan
                                    </Button>
                                )
                            ) :  plan.name === 'Free' ? (
                                <Button 
                                    variant="secondary" 
                                    otherClasses="w-full" 
                                    disabled
                                >
                                    Downgrade
                                </Button>
                            ) : (
                                <div className="flex flex-col">
                                    <Button
                                        variant={plan.popular ? 'primary' : 'secondary'}
                                        // className="inline-block bg-orange-500 w-full"
                                        otherClasses="w-full"
                                        // onClick={() => handleUpgrade(plan.name.toLowerCase())}
                                        isLoading={processingPlan === plan.name.toLowerCase()}
                                        // disabled={processingPlan !== null}
                                        disabled
                                    >
                                        {currentSubscription?.plan === 'free' ? 'Upgrade' : 'Switch to ' + plan.name}
                                    </Button>
                                    <a href={generateWaLink(plan.name.toLowerCase(), user)} target='_blank' rel='noopener noreferrer' className="mt-2 block font-medium text-center text-sm text-white bg-green-600 hover:bg-green-900 px-4 py-2 h-10 border border-green-600">
                                        {currentSubscription?.plan === 'free' ? 'Upgrade' : 'Switch to ' + plan.name + ' via WhatsApp'}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Billing History
                    </h3>
                </div>

                {billingHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {billingHistory.map((transaction) => (
                                    <tr key={transaction._id}>
                                        <td className="px-6 py-4 text-sm text-slate-900">
                                            {moment(transaction.createdAt).format('MMM D, YYYY')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {transaction.plan.charAt(0).toUpperCase() + transaction.plan.slice(1)} Plan ({transaction.billingCycle})
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                            {currencyIcon}{transaction.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                transaction.status === 'success'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-orange-600 hover:text-orange-800 text-sm">
                                                <Download className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center text-slate-500">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No billing history yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpgradePlan;
