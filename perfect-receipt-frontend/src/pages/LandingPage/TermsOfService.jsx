import React, { useState } from 'react'
import { ChevronDown, ArrowRight } from 'lucide-react'

// Terms of Service Page
const TermsOfService = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using PerfectReceipt ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    {
      title: '2. Use License',
      content: 'Permission is granted to temporarily download one copy of the materials (information or software) on PerfectReceipt for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile or reverse engineer any software contained on PerfectReceipt; remove any copyright or other proprietary notations from the materials; transfer the materials to another person or "mirror" the materials on any other server.'
    },
    {
      title: '3. Disclaimer',
      content: 'The materials on PerfectReceipt are provided on an "as is" basis. PerfectReceipt makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
    },
    {
      title: '4. Limitations',
      content: 'In no event shall PerfectReceipt or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PerfectReceipt, even if PerfectReceipt or an authorized representative has been notified orally or in writing of the possibility of such damage.'
    },
    {
      title: '5. Accuracy of Materials',
      content: 'The materials appearing on PerfectReceipt could include technical, typographical, or photographic errors. PerfectReceipt does not warrant that any of the materials on its website are accurate, complete, or current. PerfectReceipt may make changes to the materials contained on its website at any time without notice.'
    },
    {
      title: '6. Materials and Content',
      content: 'The materials on PerfectReceipt are protected by copyright law and owned or controlled by PerfectReceipt or the party credited as the material provider. You acknowledge that you do not own the materials and that unauthorized copying and distribution of these materials is prohibited.'
    },
    {
      title: '7. Limitations on Liability',
      content: 'IN NO EVENT SHALL PERFECTRECEIPT OR ITS SUPPLIERS BE LIABLE FOR ANY DAMAGES (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF DATA OR PROFIT, OR DUE TO BUSINESS INTERRUPTION) ARISING OUT OF THE USE OR INABILITY TO USE THE MATERIALS ON PERFECTRECEIPT, EVEN IF PERFECTRECEIPT OR AN AUTHORIZED REPRESENTATIVE HAS BEEN NOTIFIED ORALLY OR IN WRITING OF THE POSSIBILITY OF SUCH DAMAGE.'
    },
    {
      title: '8. Revisions',
      content: 'PerfectReceipt may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.'
    },
    {
      title: '9. Governing Law',
      content: 'These terms and conditions are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.'
    }
  ]

  const [expandedIndex, setExpandedIndex] = useState(0)

  return (
    <div className='bg-white'>
      {/* Hero */}
      <section className='relative bg-linear-to-br from-gray-50 via-orange-50/30 to-white overflow-hidden py-16 lg:pt-24'>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4'>Terms of Service</h1>
          <p className='text-gray-600'>Last updated: December 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className='py-12 lg:py-20 bg-white'>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none mb-12">
            <p className='text-gray-600 leading-relaxed mb-8'>
              Welcome to PerfectReceipt. These Terms of Service ("Terms") constitute a legal agreement between you and PerfectReceipt regarding your use of our website and services. Please read these terms carefully before using our service.
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

          <div className="mt-12 p-6 bg-orange-50 border border-orange-200 rounded-xl">
            <p className='text-gray-700'>
              If you have any questions about these Terms of Service, please contact us at <span className='font-semibold text-orange-600'>perfectmcnelson@gmail.com</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TermsOfService