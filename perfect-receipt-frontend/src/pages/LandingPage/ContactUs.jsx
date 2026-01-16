import { ArrowRight, CheckCircle, Mail, MapPin, Phone } from "lucide-react"
import { HashLink } from 'react-router-hash-link';
import { useState } from "react"
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";


const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const finalFormData = {...formData}

    try {
        const response = await axiosInstance.post(API_PATHS.EMAIL.SEND_EMAIL, finalFormData);

        if (response.data.success) {
            toast.success("Email Sent Successfully")
            setSubmitted(true)
            setTimeout(() => {
                setFormData({ name: '', email: '', subject: '', message: '' })
                setSubmitted(false)
            }, 3000)
        }

    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send email.");
        console.error(error);
    }

  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'perfectmcnelson@gmail.com',
      description: 'We typically respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+234 915 998 8967',
      description: 'Available Monday to Friday, 9am-5pm WAT'
    },
    {
      icon: MapPin,
      title: 'Office',
      value: 'Lagos State, Nigeria',
      description: '...'
    }
  ]

  return (
    <div className='bg-white'>
      {/* Hero Section */}
      <section className='relative bg-linear-to-br from-gray-50 via-orange-50/30 to-white overflow-hidden py-20 lg:pt-32'>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6'>
              Get in <span className='bg-linear-to-r from-orange-600 to-orange-900 bg-clip-text text-transparent'>Touch</span>
            </h1>
            <p className='text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className='py-20 lg:py-28 bg-white'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 text-center">
                <div className="w-14 h-14 bg-linear-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <method.icon className='w-7 h-7 text-orange-600' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>{method.title}</h3>
                <p className='text-lg text-orange-600 font-semibold mb-2'>{method.value}</p>
                <p className='text-gray-600 text-sm'>{method.description}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-linear-to-br from-gray-50 to-orange-50/30 p-8 lg:p-12 rounded-2xl border border-gray-200">
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>Send us a Message</h2>
              <p className='text-gray-600 mb-8'>Fill out the form below and we'll get back to you shortly.</p>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                  <CheckCircle className='w-5 h-5 text-green-600 shrink-0 mt-0.5' />
                  <div>
                    <p className='font-semibold text-green-900'>Message sent successfully!</p>
                    <p className='text-green-700 text-sm'>Thank you for reaching out. We'll get back to you soon.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className='block text-gray-900 font-semibold mb-2'>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition'
                      placeholder='Your name'
                    />
                  </div>
                  <div>
                    <label className='block text-gray-900 font-semibold mb-2'>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition'
                      placeholder='your@email.com'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-gray-900 font-semibold mb-2'>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition'
                    placeholder='What is this about?'
                  />
                </div>

                <div>
                  <label className='block text-gray-900 font-semibold mb-2'>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none'
                    placeholder='Tell us how we can help...'
                  />
                </div>

                <button
                  type="submit"
                  className='w-full bg-linear-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 text-nowrap'
                >
                  <span>Send Message</span>
                  <ArrowRight className='w-5 h-5' />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className='py-20 lg:py-28 bg-linear-to-br from-gray-50 to-orange-50/30'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>Still Have Questions?</h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>Check out our FAQ page for quick answers to common questions.</p>
          </div>
          <div className="text-center">
            <HashLink smooth to={"/#faq"} className='max-w-40 text-nowrap bg-linear-to-r from-orange-600 to-orange-700 text-white px-4 md:px-8 py-4 rounded-xl font-semibold text-sm md:text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 mx-auto'>
              <span>Visit FAQ</span>
              <ArrowRight className='w-5 h-5' />
            </HashLink>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactUs