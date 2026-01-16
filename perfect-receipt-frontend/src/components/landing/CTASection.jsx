import { Star, Users } from "lucide-react"
import { Link } from "react-router-dom"

const CTASection = ({ isAuthenticated }) => {

  return (
    <section className='py-20 lg:py-28 bg-linear-to-r from-orange-900 to-orange-800 relative overflow-hidden'>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6'>
          Ready to Transform Your Invoicing?
        </h2>
        <p className='text-xl text-orange-100 mb-10 max-w-2xl mx-auto'>
          Join thousands of businesses that trust PerfectReceipt for their invoicing needs. Start your free trial today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* <Link to="/signup" className='bg-white text-orange-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-300 hover:scale-105 shadow-xl'>
            Start Free Trial
          </Link> */}
          {isAuthenticated ? (
              <Link to="/dashboard" className='group bg-linear-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2'>
                <span>Go to Dashboard</span>
                {/* <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' /> */}
              </Link>
            ) : (
              <Link to="/signup" className='group bg-linear-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2'>
                <span>Start Free Trial</span>
                {/* <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' /> */}
              </Link>
            )}
          <a href="#demo" className='border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-orange-900 transition-all duration-300'>
            Schedule a Demo
          </a>
        </div>
        <div className="mt-8 flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <Star className='w-5 h-5 text-yellow-400 fill-current' />
            <span className='text-orange-100'>4.9/5 Rating</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className='w-5 h-5 text-orange-200' />
            <span className='text-orange-100'>10,000+ Users</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection