import { Activity, Beaker, Pill, Stethoscope, HeartPulse, Brain, Bone, Eye } from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      title: "OPD Consultations",
      description: "Expert consultations across various medical specialties with minimal wait times.",
      icon: Stethoscope,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Laboratory Tests",
      description: "Comprehensive diagnostic and pathology laboratory services with rapid results.",
      icon: Beaker,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Pharmacy Services",
      description: "24/7 in-house pharmacy stocked with genuine medicines and health products.",
      icon: Pill,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Emergency Care",
      description: "Round-the-clock emergency medical services and trauma care by specialized teams.",
      icon: Activity,
      color: "from-rose-500 to-red-500"
    },
    {
      title: "Cardiology",
      description: "Advanced heart care including diagnostics, interventional procedures, and rehab.",
      icon: HeartPulse,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Neurology",
      description: "Expert care for brain, spinal cord, and nervous system disorders.",
      icon: Brain,
      color: "from-violet-500 to-fuchsia-500"
    },
    {
      title: "Orthopedics",
      description: "Comprehensive care for bones, joints, ligaments, tendons, and muscles.",
      icon: Bone,
      color: "from-amber-500 to-orange-500"
    },
    {
      title: "Ophthalmology",
      description: "Complete eye care services from routine checkups to advanced surgeries.",
      icon: Eye,
      color: "from-sky-500 to-blue-500"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b relative overflow-hidden py-20 lg:py-24">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent" />
        
        <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-screen-xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Services</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            We offer a comprehensive suite of medical services to ensure holistic, state-of-the-art care for our patients.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16 max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div key={index} className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-2 overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} opacity-5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-150`} />
              
              <div className="relative z-10">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${service.color} text-white flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{service.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
