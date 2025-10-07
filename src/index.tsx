import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

// Type definitions for Cloudflare bindings
type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  AI: Ai;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Use renderer for HTML pages
app.use(renderer)

// API Routes
import { authRoutes } from './routes/auth'
import { hankyCodeRoutes } from './routes/hanky-codes'
import { profileRoutes } from './routes/profiles'
import { matchRoutes } from './routes/matches'
import { messageRoutes } from './routes/messages'
import { safetyRoutes } from './routes/safety'

// Mount API routes
app.route('/api/auth', authRoutes)
app.route('/api/hanky-codes', hankyCodeRoutes)
app.route('/api/profiles', profileRoutes)
app.route('/api/matches', matchRoutes)
app.route('/api/messages', messageRoutes)
app.route('/api/safety', safetyRoutes)

// Main application page
app.get('/', (c) => {
  return c.render(
    <div id="app">
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Navigation */}
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-purple-400">
                  ✨ PULSE
                </h1>
                <span className="ml-2 text-sm text-gray-400">
                  Digital Hanky Code Dating
                </span>
              </div>
              <div className="flex space-x-4">
                <button className="text-gray-300 hover:text-white px-3 py-2 text-sm">
                  Explore Codes
                </button>
                <button className="text-gray-300 hover:text-white px-3 py-2 text-sm">
                  Matches
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Connect Through <span className="text-purple-400">Cultural Heritage</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              PULSE revives the authentic hanky code tradition for modern LGBTQ+ dating. 
              Discover meaningful connections through our community's rich cultural language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold">
                Explore Hanky Codes
              </button>
              <button className="border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold">
                Learn the History
              </button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-3xl mb-4">🏳️‍🌈</div>
              <h3 className="text-xl font-semibold text-white mb-2">Cultural Authenticity</h3>
              <p className="text-gray-300">
                Genuine hanky code meanings rooted in LGBTQ+ leather community history and tradition.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Privacy First</h3>
              <p className="text-gray-300">
                Your safety matters. Neighborhood-level location sharing and comprehensive privacy controls.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-3xl mb-4">💝</div>
              <h3 className="text-xl font-semibold text-white mb-2">Meaningful Matches</h3>
              <p className="text-gray-300">
                Connect based on authentic interests, not just photos. Find your community.
              </p>
            </div>
          </div>

          {/* Quick Hanky Code Preview */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Discover Your Colors
            </h3>
            <div id="hanky-code-preview" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Will be populated by JavaScript */}
            </div>
            <div className="text-center mt-6">
              <button className="text-purple-400 hover:text-purple-300 underline">
                View All Hanky Codes →
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-400">
              <p>© 2024 PULSE Digital Hanky Code Dating Platform</p>
              <p className="text-sm mt-2">
                Built with respect for LGBTQ+ leather community heritage
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
})

// Hanky Code Reference Page
app.get('/codes', (c) => {
  return c.render(
    <div id="hanky-codes-page" className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-purple-400 mb-8">Hanky Code Reference</h1>
        <div id="hanky-codes-container" className="space-y-4">
          {/* Will be populated by JavaScript */}
        </div>
      </div>
    </div>
  )
})

// Profile page placeholder
app.get('/profile', (c) => {
  return c.render(
    <div id="profile-page" className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-purple-400 mb-8">Your Profile</h1>
        <div id="profile-container">
          {/* Will be populated by JavaScript */}
        </div>
      </div>
    </div>
  )
})

// API health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    service: 'PULSE Dating MVP',
    timestamp: new Date().toISOString()
  })
})

export default app
