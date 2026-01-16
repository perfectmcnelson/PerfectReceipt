import React from 'react'
import { CheckCircle, Users, Lightbulb, Heart } from 'lucide-react'

// About Us Page
const AboutUs = () => {
  const team = [
    {
      name: 'Ejike McNelson',
      role: 'Founder & CEO',
      bio: 'Prince Ejike McNelson, is the Co-Founder and CEO, providing strategic leadership focused on innovation, scalability, and long-term value creation with end users at heart. His multidisciplinary expertise drives modern, affordable digital solutions aligned with market needs and sustainable growth.',
      avatar: '/images/mcnelsonperfect.png'
    },
    {
      name: 'Dike Perfect',
      role: 'Head of Design',
      bio: `Dike Perfect is the UI/UX Team Coordinator and a core contributor to the project, helping shape a scalable, user-centered product through strong design standards and cross-team collaboration.`,
      avatar: '/images/dikeperfect.png'
    }
  ]

  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously improve our product to stay ahead of industry trends.'
    },
    {
      icon: Heart,
      title: 'Customer Focus',
      description: 'Your success is our success. We listen and adapt to your needs.'
    },
    {
      icon: CheckCircle,
      title: 'Reliability',
      description: 'Enterprise-grade reliability you can depend on for your business.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We believe in building a supportive community of successful businesses.'
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
              About <span className='bg-linear-to-r from-orange-600 to-orange-900 bg-clip-text text-transparent'>Perfect<i className='not-italic text-green-700'>Receipt</i></span>
            </h1>
            <p className='text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
              We're on a mission to simplify invoicing and receipts for businesses worldwide, so you can focus on what matters most.
            </p>
          </div>
        </div>
      </section>

      <section className='py-20 lg:py-28 bg-white'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-6'>About PerfectReceipt</h2>
                    <p className='text-lg text-gray-600 mb-4 leading-relaxed'>
                        PerfectReceipt is built to make invoicing and receipt management effortless. No complexity, no clutter—just fast, reliable tools that help you stay organized.
                    </p>
                    <p className='text-lg text-gray-600 mb-4 leading-relaxed'>
                        Create professional invoices, track payments, manage receipts, and stay on top of your records with ease. Everything is designed to save you time so you can focus on growing your business.
                    </p>
                    <p className='text-lg text-gray-600 leading-relaxed'>
                        Today, thousands of users trust PerfectReceipt for smooth, stress-free billing. Our goal is simple: give you a powerful, intuitive platform that just works.
                    </p>
                </div>
            <div className="bg-linear-to-br from-orange-100 to-purple-100 rounded-2xl h-96 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📈</div>
                    <p className="text-gray-600 font-semibold">Built for seamless growth</p>
                </div>
            </div>
            </div>
        </div>
        </section>

      {/* Values Section */}
      <section className='py-20 lg:py-28 bg-linear-to-br from-gray-50 to-orange-50/30'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>Our Core Values</h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>The principles that guide everything we do.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-14 h-14 bg-linear-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className='w-7 h-7 text-orange-600' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-3'>{value.title}</h3>
                <p className='text-gray-600'>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className='py-20 lg:py-28 bg-white'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>Meet Our Team</h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>Talented people dedicated to helping your business succeed.</p>
          </div>
          
          <div className="w-full flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-0 md:w-[80%]">
                {team.map((member, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 p-6 ">
                    <div className="w-full flex items-center justify-center overflow-hidden">
                        <img src={member.avatar} alt={member.name} className='object-cover' width={"200px"} />
                    </div>
                    <div className="text-center mt-6">
                        <h3 className='text-lg font-bold text-gray-900 mb-1'>{member.name}</h3>
                        <p className='text-orange-600 font-semibold text-sm mb-3'>{member.role}</p>
                        <p className='text-gray-600 text-sm'>{member.bio}</p>
                    </div>
                </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className='py-16 bg-linear-to-r from-orange-900 to-orange-800'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">10,000+</div>
              <div className="text-orange-100 text-sm lg:text-base">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">500K+</div>
              <div className="text-orange-100 text-sm lg:text-base">Invoices Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">3 Years</div>
              <div className="text-orange-100 text-sm lg:text-base">In Business</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">150+</div>
              <div className="text-orange-100 text-sm lg:text-base">Countries</div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  )
}

export default AboutUs