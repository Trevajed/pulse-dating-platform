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

// Main application page - SPA container
app.get('/', (c) => {
  return c.render(
    <div id="app" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: var(--pulse-bg-primary);">
      <div style="text-align: center; color: var(--pulse-text-secondary);">
        <div className="spinner" style="margin: 0 auto 2rem;"></div>
        <p style="font-size: 1.5rem; font-weight: 600; background: linear-gradient(135deg, var(--pulse-electric-blue) 0%, var(--pulse-purple) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Loading PULSE...
        </p>
        <p style="margin-top: 0.5rem; font-size: 0.875rem;">
          Digital Hanky Code Dating Platform
        </p>
      </div>
    </div>
  )
})

// All other routes handled by SPA
app.get('*', (c) => {
  // Check if it's not an API route
  if (!c.req.path.startsWith('/api/')) {
    return c.render(
      <div id="app" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: var(--pulse-bg-primary);">
        <div style="text-align: center; color: var(--pulse-text-secondary);">
          <div className="spinner" style="margin: 0 auto 2rem;"></div>
          <p style="font-size: 1.5rem; font-weight: 600; background: linear-gradient(135deg, var(--pulse-electric-blue) 0%, var(--pulse-purple) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Loading PULSE...
          </p>
          <p style="margin-top: 0.5rem; font-size: 0.875rem;">
            Digital Hanky Code Dating Platform
          </p>
        </div>
      </div>
    )
  }
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
