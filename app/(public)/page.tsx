import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Activity, Calendar, Shield, Clock, ChevronRight, HeartPulse, Stethoscope } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-36 md:pb-40 overflow-hidden">
        {/* Background Gradients & Blurs */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50/50" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
          <div className="w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container px-4 md:px-6 relative mx-auto max-w-screen-xl">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-8 z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-white/60 backdrop-blur-md px-4 py-1.5 text-sm text-blue-700 font-semibold shadow-sm transition-transform hover:scale-105 cursor-default">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse" />
                  Next-Generation Healthcare
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 leading-[1.1]">
                  Premium Care at <br className="hidden md:block"/> Kanbuvar
                </h1>
                <p className="max-w-[600px] text-slate-600 md:text-xl leading-relaxed font-medium">
                  Experience a seamless healthcare journey. Expert doctors, state-of-the-art facilities, and compassionate care, all integrated into one intelligent platform.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row pt-4">
                <Link href="/login">
                  <Button size="lg" className="w-full min-[400px]:w-auto bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg font-semibold shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 rounded-full flex items-center group">
                    Book Appointment
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto h-14 px-8 text-lg font-semibold border-slate-300 hover:bg-slate-100 transition-all hover:-translate-y-1 rounded-full text-slate-700 bg-white/50 backdrop-blur-sm">
                    Discover More
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="mx-auto flex w-full items-center justify-center relative lg:p-0 z-10">
              {/* Premium Hero Graphic */}
              <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex items-center justify-center group transition-transform duration-700 hover:rotate-1">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-indigo-50/50" />
                 <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10 mix-blend-overlay"></div>
                 
                 <div className="relative z-10 bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col items-center gap-6 transform transition-transform duration-500 group-hover:scale-105">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <HeartPulse className="h-12 w-12 text-white animate-pulse" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900">Kanbuvar Portal</h3>
                      <p className="text-slate-500 font-medium mt-1">Intelligent Care System</p>
                    </div>
                 </div>

                 {/* Floating Badges */}
                 <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white animate-[bounce_4s_infinite]">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">200+ Specialists</p>
                        <p className="text-xs text-slate-500 font-medium">Ready to help</p>
                      </div>
                    </div>
                 </div>

                 <div className="absolute bottom-10 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white animate-[bounce_5s_infinite_reverse]">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Instant Booking</p>
                        <p className="text-xs text-slate-500 font-medium">Zero wait time</p>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="container px-4 md:px-6 mx-auto max-w-screen-xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase">Why Choose Us</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">The Kanbuvar Advantage</h3>
            <p className="max-w-[800px] text-slate-500 md:text-xl mt-4 font-medium">
              We integrate world-class medical expertise with cutting-edge technology to provide you with an unparalleled healthcare experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12">
            <div className="group flex flex-col items-start p-8 bg-slate-50 rounded-[2rem] transition-all duration-300 hover:bg-white hover:shadow-2xl hover:-translate-y-2 border border-transparent hover:border-slate-100">
              <div className="h-16 w-16 rounded-2xl bg-blue-100/80 flex items-center justify-center mb-6 transition-colors group-hover:bg-blue-600">
                <Calendar className="h-8 w-8 text-blue-600 transition-colors group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Seamless Scheduling</h3>
              <p className="text-slate-600 leading-relaxed font-medium">Book appointments instantly. Choose your preferred specialist, select a time slot, and manage your visits effortlessly through our digital portal.</p>
            </div>
            
            <div className="group flex flex-col items-start p-8 bg-slate-50 rounded-[2rem] transition-all duration-300 hover:bg-white hover:shadow-2xl hover:-translate-y-2 border border-transparent hover:border-slate-100">
              <div className="h-16 w-16 rounded-2xl bg-indigo-100/80 flex items-center justify-center mb-6 transition-colors group-hover:bg-indigo-600">
                <Shield className="h-8 w-8 text-indigo-600 transition-colors group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Ultra-Secure Records</h3>
              <p className="text-slate-600 leading-relaxed font-medium">Your health data is paramount. We employ bank-grade encryption to ensure your medical history, prescriptions, and lab reports are completely secure yet instantly accessible to you.</p>
            </div>
            
            <div className="group flex flex-col items-start p-8 bg-slate-50 rounded-[2rem] transition-all duration-300 hover:bg-white hover:shadow-2xl hover:-translate-y-2 border border-transparent hover:border-slate-100">
              <div className="h-16 w-16 rounded-2xl bg-emerald-100/80 flex items-center justify-center mb-6 transition-colors group-hover:bg-emerald-600">
                <Clock className="h-8 w-8 text-emerald-600 transition-colors group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">24/7 Connectivity</h3>
              <p className="text-slate-600 leading-relaxed font-medium">Healthcare doesn't stop. Access our platform round-the-clock to check test results, request prescription refills, or contact support whenever you need assistance.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
        
        <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-screen-xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to prioritize your health?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium">Join Kanbuvar today and experience the future of personalized healthcare management.</p>
          <Link href="/login">
             <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 h-14 px-10 text-lg font-bold rounded-full shadow-2xl transition-all hover:scale-105">
               Get Started Now
             </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
