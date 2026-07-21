import { Activity, Code, Server, Shield } from 'lucide-react'

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/doctors',
      description: 'Fetch a list of all doctors in the hospital.',
      auth: 'Bearer Token Required',
      response: 'Array of Doctor objects with user details.'
    },
    {
      method: 'POST',
      path: '/api/patients',
      description: 'Register a new patient into the system.',
      auth: 'Receptionist / Admin Only',
      response: 'Created Patient object.'
    },
    {
      method: 'GET',
      path: '/api/appointments',
      description: 'Fetch today\'s appointments for a specific doctor.',
      auth: 'Bearer Token Required',
      response: 'Array of Appointment objects.'
    },
    {
      method: 'POST',
      path: '/api/appointments',
      description: 'Book a new appointment slot for a patient.',
      auth: 'Receptionist / Patient Only',
      response: 'Created Appointment object.'
    }
  ]

  return (
    <div className="container mx-auto px-4 md:px-8 py-16 max-w-screen-xl">
      <div className="flex items-center space-x-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
          <Code className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">API Documentation</h1>
          <p className="text-slate-500">Integrate with the Kanbuvar system using our RESTful API</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-slate-50 p-6 rounded-2xl border">
          <Server className="h-8 w-8 text-blue-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Base URL</h3>
          <code className="bg-white px-3 py-1 rounded border text-sm text-blue-600">https://yourdomain.com/api</code>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border">
          <Shield className="h-8 w-8 text-green-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Authentication</h3>
          <p className="text-sm text-slate-600">Most endpoints require a valid Supabase JWT token passed in the Authorization header.</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border">
          <Activity className="h-8 w-8 text-orange-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Rate Limits</h3>
          <p className="text-sm text-slate-600">API requests are limited to 100 requests per minute per IP address.</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Available Endpoints</h2>
        
        <div className="space-y-4">
          {endpoints.map((endpoint, i) => (
            <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center p-4 border-b bg-slate-50/50 gap-4">
                <span className={`px-3 py-1 text-sm font-bold rounded ${
                  endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                  endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-slate-900 font-semibold">{endpoint.path}</code>
                <span className="md:ml-auto text-xs font-medium text-slate-500 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  {endpoint.auth}
                </span>
              </div>
              <div className="p-4 bg-white space-y-3">
                <p className="text-slate-600 text-sm">{endpoint.description}</p>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Response</h4>
                  <p className="text-sm font-medium text-slate-700">{endpoint.response}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
