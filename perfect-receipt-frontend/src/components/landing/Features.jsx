import React from 'react'
import { ArrowRight } from 'lucide-react'
import { features } from '../../utils/data'

const Features = () => {

    return (
        <section id='features' className='py-20 lg:py-28 bg-gray-50'>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className='text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4'>Built for Freelancers, Startups, and Businesses That Move Fast.</h2>
                    <p className='text-xl text-gray-600 max-w-3xl mx-auto'>From invoice creation to receipt generation, do it all in one place—fast, simple, and secure. No stress, no clutter.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {
                        features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-y-1 border border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                                    <feature.icon className='w-8 h-8 text-orange-900' />
                                </div>
                                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                                    {feature.title}
                                </h3>
                                <p className='text-gray-600 leading-relaxed'>
                                    {feature.description}
                                </p>
                                {/* <a href="#" className='inline-flex items-center text-orange-900 font-medium mt-4 hover:text-black transition-colors duration-200'>
                                    Learn More <ArrowRight className='w-4 h-4 ml-2' size={16} />
                                </a> */}
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    )
}

export default Features