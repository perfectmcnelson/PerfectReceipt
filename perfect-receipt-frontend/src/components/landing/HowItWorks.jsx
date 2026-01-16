import { FileText, Sparkles, Zap } from "lucide-react"

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Enter Your Details',
      description: 'Simply type or paste your invoice information. Our smart system understands natural language.',
      icon: FileText
    },
    {
      number: '02',
      title: 'Customize Your Design',
      description: 'Choose from professional templates or create your own. Add your logo and brand colors.',
      icon: Sparkles
    },
    {
      number: '03',
      title: 'Generate & Send',
      description: 'Create your invoice and receipt instantly. Download, print, or send via email in one click.',
      icon: Zap
    }
  ]
  
  return (
    <section className='py-20 lg:py-28 bg-white' id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4'>
            How It Works
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Creating professional invoices has never been easier. Get started in three simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-linear-to-r from-orange-200 to-transparent -translate-x-1/2"></div>
              )}
              <div className="relative bg-linear-to-br from-orange-50 to-white p-8 rounded-2xl border border-orange-100 hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-linear-to-br from-orange-600 to-orange-700 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
                  {step.number}
                </div>
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                  <step.icon className='w-7 h-7 text-orange-600' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-3'>{step.title}</h3>
                <p className='text-gray-600 leading-relaxed'>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks