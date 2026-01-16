import { BarChart, Clock, Globe, Shield, TrendingUp, Users } from "lucide-react"

const Benefits = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'Save 10+ Hours Weekly',
      description: 'Automate repetitive tasks and focus on growing your business instead of paperwork.'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your data is encrypted and protected with enterprise-grade security measures.'
    },
    {
      icon: TrendingUp,
      title: 'Get Paid 2x Faster',
      description: 'Automated reminders and easy payment options help you get paid quicker.'
    },
    {
      icon: Users,
      title: 'Unlimited Clients',
      description: 'Manage as many clients as you need without any restrictions or extra fees.'
    },
    {
      icon: Globe,
      title: 'Multi-Currency Support',
      description: 'Work with international clients using 150+ currencies and languages.'
    },
    {
      icon: BarChart,
      title: 'Smart Analytics',
      description: 'Track payments, monitor cash flow, and make data-driven decisions.'
    }
  ]
  
  return (
    <section className='py-20 lg:py-28 bg-linear-to-br from-gray-50 to-orange-50/30'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4'>
            Why Choose PerfectReceipt?
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Everything you need to manage your invoicing and receipts professionally.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="w-14 h-14 bg-linear-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <benefit.icon className='w-7 h-7 text-orange-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>{benefit.title}</h3>
              <p className='text-gray-600 leading-relaxed'>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Benefits