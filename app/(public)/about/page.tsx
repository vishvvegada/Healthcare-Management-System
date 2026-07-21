import { Heart, Target, Sparkles, Building2, Users2, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Premium Header */}
      <div className="relative py-20 lg:py-28 bg-white border-b overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-indigo-50/30" />
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-indigo-100/40 to-transparent" />
        <div className="container relative mx-auto px-4 md:px-8 max-w-screen-xl text-center z-10">
          <div className="inline-flex items-center rounded-full bg-blue-100/50 px-3 py-1 text-sm text-blue-700 font-medium mb-6">
            <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Kanbuvar</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium">
            Kanbuvar is a pioneering healthcare institution dedicated to providing comprehensive and compassionate medical care. Our state-of-the-art infrastructure combined with experienced professionals ensures the best possible outcomes for our patients.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-20 max-w-screen-xl">
        {/* Mission and Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-24 text-left">
          <div className="group p-10 bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">To deliver exceptional patient-centered care and improve the health of our community through relentless innovation, deep compassion, and unwavering excellence in all we do.</p>
            </div>
          </div>
          
          <div className="group p-10 bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">To be the most trusted and respected healthcare provider globally, recognized for defining excellence in patient care, cutting-edge research, and medical education.</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
            <div className="flex flex-col items-center pt-8 md:pt-0">
              <Building2 className="h-10 w-10 text-blue-400 mb-4" />
              <div className="text-5xl font-extrabold text-white mb-2">15+</div>
              <div className="text-blue-200 font-medium tracking-wide">Years of Excellence</div>
            </div>
            <div className="flex flex-col items-center pt-8 md:pt-0">
              <Users2 className="h-10 w-10 text-blue-400 mb-4" />
              <div className="text-5xl font-extrabold text-white mb-2">50k+</div>
              <div className="text-blue-200 font-medium tracking-wide">Happy Patients</div>
            </div>
            <div className="flex flex-col items-center pt-8 md:pt-0">
              <Award className="h-10 w-10 text-blue-400 mb-4" />
              <div className="text-5xl font-extrabold text-white mb-2">200+</div>
              <div className="text-blue-200 font-medium tracking-wide">Expert Doctors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
