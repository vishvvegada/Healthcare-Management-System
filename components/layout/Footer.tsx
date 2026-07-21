import Link from 'next/link'
import { Activity, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-slate-50/50">
      <div className="container mx-auto max-w-screen-2xl px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl tracking-tight">Kanbuvar</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Providing exceptional healthcare services with state-of-the-art facilities and experienced medical professionals.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-blue-600 transition-colors">Services</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Services</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>OPD Consultations</li>
              <li>Laboratory Tests</li>
              <li>Pharmacy</li>
              <li>Emergency Care</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>123 Health Avenue, Medical District</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>contact@kanbuvar.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Kanbuvar Hospital Management. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
