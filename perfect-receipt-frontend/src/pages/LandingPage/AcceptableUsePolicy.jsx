import { ChevronDown } from "lucide-react"
import { useState } from "react"

const AcceptableUsePolicy = () => {
  const sections = [
    {
      title: '1. Prohibited Activities',
      content: 'You agree not to: (a) use the service for unlawful purposes or in violation of any applicable laws; (b) harass, threaten, or abuse other users; (c) create invoices or receipts containing false, misleading, or fraudulent information; (d) attempt to gain unauthorized access to our systems; (e) transmit viruses, malware, or harmful code; (f) reverse engineer, decompile, or access our source code.'
    },
    {
      title: '2. Acceptable Use of Content',
      content: 'You retain ownership of any content you create using our service. However, you grant us a license to use your data to provide and improve our services. You are responsible for ensuring all content complies with applicable laws and does not infringe on third-party rights. You must not use our service to create content that is defamatory, obscene, or illegal.'
    },
    {
      title: '3. Account Security',
      content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized access or security breach. We are not liable for any damages resulting from unauthorized access to your account.'
    },
    {
      title: '4. Misuse and Suspension',
      content: 'We reserve the right to suspend or terminate your account if you violate this policy or engage in any prohibited activities. We may also report suspected illegal activity to law enforcement authorities. Upon suspension, you will lose access to your account and associated data may be deleted.'
    },
    {
      title: '5. Fair Use',
      content: 'While we offer unlimited invoices on most plans, we expect fair use. Automated bulk generation of invoices solely to test system limits or disrupt service is prohibited. We reserve the right to implement rate limiting or usage restrictions if abuse is detected.'
    },
    {
      title: '6. Tax and Legal Compliance',
      content: 'You are solely responsible for ensuring your use of PerfectReceipt complies with all applicable tax laws, regulations, and compliance requirements in your jurisdiction. We do not provide legal or tax advice. Consult with a qualified professional regarding your obligations.'
    },
    {
      title: '7. Third-Party Content',
      content: 'Our service may contain links to third-party websites. We are not responsible for their content, accuracy, or practices. Your use of third-party services is governed by their terms and policies.'
    }
  ]

  const [expandedIndex, setExpandedIndex] = useState(0)

  return (
    <div className='bg-white'>
      {/* Hero */}
      <section className='relative bg-linear-to-br from-gray-50 via-orange-50/30 to-white overflow-hidden py-16 lg:pt-24'>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4'>Acceptable Use Policy</h1>
          <p className='text-gray-600'>Last updated: December 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className='py-12 lg:py-20 bg-white'>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none mb-12">
            <p className='text-gray-600 leading-relaxed mb-8'>
              This Acceptable Use Policy outlines the standards of conduct required when using PerfectReceipt. By using our service, you agree to comply with this policy and all applicable laws and regulations.
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

          <div className="mt-12 p-6 bg-purple-50 border border-purple-200 rounded-xl">
            <p className='text-gray-700'>
              If you suspect a violation of this policy, please report it to <span className='font-semibold text-purple-600'>perfectmcnelson@gmail.com</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AcceptableUsePolicy