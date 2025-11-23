import { useState } from 'react'
import Dashboard from './components/Dashboard'
import { Activity } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Mini ERP - Inventario Médico</h1>
              </div>
            </div>
            <div className="text-right">
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Dashboard />
      </main>
    </div>
  )
}

export default App