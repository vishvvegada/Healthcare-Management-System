import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, MessageSquare, Send } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <div className="bg-slate-900 text-white relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-12 right-12 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl" />
        
        <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-screen-xl text-center">
          <div className="inline-flex items-center rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-sm text-blue-200 font-medium mb-6 backdrop-blur-md">
            <MessageSquare className="mr-2 h-4 w-4" />
            We're Here to Help
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium">
            Whether you need medical assistance, have inquiries about our services, or want to provide feedback, our team is ready to listen.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16 -mt-16 relative z-20 max-w-screen-xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Send us a Message</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Full Name</label>
                    <input type="text" id="name" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all focus:bg-white" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
                    <input type="email" id="email" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all focus:bg-white" placeholder="john@example.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-700">Subject</label>
                  <input type="text" id="subject" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all focus:bg-white" placeholder="How can we help?" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700">Message</label>
                  <textarea id="message" rows={5} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all focus:bg-white resize-none" placeholder="Please describe your inquiry in detail..."></textarea>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 group">
                  Send Message
                  <Send className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Button>
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 group hover:-translate-y-1 transition-transform">
              <div className="flex items-start space-x-5">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                  <MapPin className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Our Location</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    123 Health Avenue, Medical District<br />New York, NY 10001
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 group hover:-translate-y-1 transition-transform">
              <div className="flex items-start space-x-5">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                  <Phone className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Phone Number</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    <span className="block hover:text-indigo-600 cursor-pointer transition-colors">+1 (555) 123-4567</span>
                    <span className="block hover:text-indigo-600 cursor-pointer transition-colors">+1 (555) 987-6543</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 group hover:-translate-y-1 transition-transform">
              <div className="flex items-start space-x-5">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 transition-colors">
                  <Mail className="h-7 w-7 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Email Address</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    <span className="block hover:text-emerald-600 cursor-pointer transition-colors">contact@kanbuvar.com</span>
                    <span className="block hover:text-emerald-600 cursor-pointer transition-colors">support@kanbuvar.com</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
