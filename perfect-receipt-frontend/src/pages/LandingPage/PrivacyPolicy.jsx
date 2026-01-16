import { ChevronDown } from "lucide-react"
import { useState } from "react"

const PrivacyPolicy = () => {
  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly, such as when you create an account, use our service, or contact us. This includes: Account information (name, email, password), business details, invoice and receipt data, payment information, and communication preferences.'
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the information we collect to: Provide and improve our services, process transactions, send service updates, respond to inquiries, detect and prevent fraud, comply with legal obligations, and personalize your experience. We do not sell your personal data to third parties.'
    },
    {
      title: '3. Data Security',
      content: 'We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits to protect your data. However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.'
    },
    {
      title: '4. Third-Party Services',
      content: 'We may use third-party service providers for payment processing, email delivery, analytics, and customer support. These providers are contractually obligated to use your information only as necessary to provide services to us and maintain the confidentiality of your data.'
    },
    {
      title: '5. Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to enhance your experience, remember preferences, and analyze how you use our service. You can control cookie settings through your browser, though disabling cookies may limit functionality.'
    },
    {
      title: '6. Data Retention',
      content: 'We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You can request deletion of your data at any time, subject to legal obligations.'
    },
    {
      title: '7. Your Rights',
      content: 'You have the right to access, correct, or delete your personal information. You can also opt-out of marketing communications. For GDPR and CCPA compliance, you may request data portability or lodge complaints with relevant authorities.'
    },
    {
      title: '8. International Data Transfers',
      content: 'If you are outside Federal Republic of Nigeria, your information may be transferred to and stored in the Federal Republic of Nigeria. By using our service, you consent to this transfer and processing of your data in the Federal Republic of Nigeria.'
    },
    {
      title: '9. Children\'s Privacy',
      content: 'Our service is not intended for individuals under 18 years of age. We do not knowingly collect information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information promptly.'
    },
    {
      title: '10. Changes to Privacy Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of material changes by email or prominent notice on our website. Your continued use of the service constitutes acceptance of the updated policy.'
    }
  ]

  const [expandedIndex, setExpandedIndex] = useState(0)

  return (
    <div className='bg-white'>
      {/* Hero */}
      <section className='relative bg-linear-to-br from-gray-50 via-orange-50/30 to-white overflow-hidden py-16 lg:pt-24'>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4'>Privacy Policy</h1>
          <p className='text-gray-600'>Last updated: December 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className='py-12 lg:py-20 bg-white'>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none mb-12">
            <p className='text-gray-600 leading-relaxed mb-8'>
              PerfectReceipt ("we", "us", "our") operates the PerfectReceipt website and service. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
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

          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <p className='text-gray-700'>
              If you have any questions about this Privacy Policy, please contact us at <span className='font-semibold text-blue-600'>perfectmcnelson@gmail.com</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicy