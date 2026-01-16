import React from 'react'

const UseCases = () => {
  const useCases = [
    {
      title: 'Freelancers',
      description: 'Perfect for designers, developers, writers, and consultants who need to invoice clients quickly and professionally.',
      emoji: '👨‍💻',
      gradient: 'from-orange-50 to-orange-100'
    },
    {
      title: 'Small Businesses',
      description: 'Manage all your business transactions efficiently without expensive accounting software or complex systems.',
      emoji: '🏪',
      gradient: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Startups',
      description: 'Scale your invoicing as you grow. Start free and upgrade when you need more features without disruption.',
      emoji: '🚀',
      gradient: 'from-green-50 to-green-100'
    },
    {
      title: 'Service Providers',
      description: 'From cleaning services to repair shops, create professional receipts instantly for every job completed.',
      emoji: '🔧',
      gradient: 'from-orange-50 to-orange-100'
    }
  ]
  
  return (
    <section className='py-20 lg:py-28 bg-white'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4'>
            Perfect for Every Business
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Whether you're a solopreneur or a growing team, PerfectReceipt adapts to your unique business needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <div 
              key={index} 
              className={`bg-linear-to-br ${useCase.gradient} p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
            >
              <div className="text-5xl mb-4">{useCase.emoji}</div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>{useCase.title}</h3>
              <p className='text-gray-600 leading-relaxed'>{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UseCases

