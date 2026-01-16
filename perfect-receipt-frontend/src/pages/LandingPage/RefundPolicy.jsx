import { ChevronDown } from "lucide-react"
import { useState } from "react"

const RefundPolicy = () => {
  const sections = [
    {
      title: '1. Free Plan',
      content: 'The Free plan can be cancelled at any time without penalty. All data associated with your account will remain accessible for 30 days after cancellation, after which it will be permanently deleted.'
    },
    {
      title: '2. Paid Plans',
      content: 'Paid plans are billed monthly or annually depending on your selection. You can cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing cycle.'
    },
    {
      title: '3. Refund Policy',
      content: 'We offer a 30-day money-back guarantee for new subscriptions. If you are not satisfied with your purchase within 30 days, contact our support team at perfectmcnelson@gmail.com with your request. Full refunds are issued to the original payment method.'
    },
    {
      title: '4. Refunds After 30 Days',
      content: 'Refunds requested after the 30-day period will be evaluated on a case-by-case basis. We may issue partial refunds or account credits at our discretion. Refunds for service interruptions due to technical issues will be credited as account credits.'
    },
    {
      title: '5. Proration and Credits',
      content: 'When you upgrade to a higher plan, you will be charged the difference prorated for the remainder of your billing cycle. When you downgrade, any overpayment will be credited to your account for future billing periods.'
    },
    {
      title: '6. Cancellation Process',
      content: 'To cancel your subscription, log into your account, navigate to Billing Settings, and click "Cancel Subscription". You will receive a confirmation email. Your service will remain active until the end of your current billing period.'
    },
    {
      title: '7. No Refund for Unused Credits',
      content: 'If you purchase add-on credits or features that remain unused at the time of cancellation, these will not be refunded. Credits expire 12 months from the date of purchase.'
    },
    {
      title: '8. Reactivation',
      content: 'You can reactivate your account at any time within 90 days of cancellation. After 90 days, your account data will be permanently deleted. Reactivation follows normal signup procedures and billing terms.'
    }
  ]

  const [expandedIndex, setExpandedIndex] = useState(0)

  return (
    <div className='bg-white'>
      {/* Hero */}
      <section className='relative bg-linear-to-br from-gray-50 via-orange-50/30 to-white overflow-hidden py-16 lg:pt-24'>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4'>Refund & Cancellation Policy</h1>
          <p className='text-gray-600'>Last updated: December 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className='py-12 lg:py-20 bg-white'>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none mb-12">
            <p className='text-gray-600 leading-relaxed mb-8'>
              At PerfectReceipt, we want you to be completely satisfied with your subscription. This policy outlines our refund and cancellation procedures.
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                  className='w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors'
                >
                  <span className='text-lg font-semibold text-gray-900 text-left'>{section.title}</span>
                  <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`} />
                </button>
                {expandedIndex === index && (
                  <div className="p-6 text-gray-600 leading-relaxed border-t border-gray-100">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-xl">
            <p className='text-gray-700'>
              Questions about our refund policy? Contact us at <span className='font-semibold text-green-600'>perfectmcnelson@gmail.com</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default RefundPolicy