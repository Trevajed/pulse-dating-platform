import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

export const authRoutes = new Hono<{ Bindings: Bindings }>()

// Simple password hashing (in production, use bcrypt or similar)
function hashPassword(password: string): string {
  // This is a placeholder - in production, use proper bcrypt
  return btoa(password + 'pulse_salt_2024')
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Generate JWT token
async function generateToken(userId: number): Promise<string> {
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
  }
  return await sign(payload, 'pulse_jwt_secret_2024')
}

// Register new user
authRoutes.post('/register', async (c) => {
  try {
    const { email, username, password, displayName, age, pronouns } = await c.req.json()

    // Validation
    if (!email || !username || !password || !displayName || !age) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    if (age < 18) {
      return c.json({ error: 'Must be 18 or older' }, 400)
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).bind(email, username).first()

    if (existingUser) {
      return c.json({ error: 'Email or username already exists' }, 409)
    }

    // Hash password and create user
    const passwordHash = hashPassword(password)
    
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, username, display_name, age, pronouns, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(email, username, displayName, age, pronouns || 'they/them', passwordHash).run()

    if (result.success) {
      const userId = result.meta.last_row_id
      const token = await generateToken(userId as number)
      
      // Store session
      await c.env.KV.put(`session:${userId}`, token, { expirationTtl: 60 * 60 * 24 * 7 })
      
      return c.json({
        success: true,
        user: {
          id: userId,
          email,
          username,
          displayName,
          age,
          pronouns
        },
        token
      })
    } else {
      return c.json({ error: 'Failed to create user' }, 500)
    }
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// Login user
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400)
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, username, display_name, age, pronouns, password_hash FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user || !verifyPassword(password, user.password_hash as string)) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Update last active
    await c.env.DB.prepare(
      'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(user.id).run()

    const token = await generateToken(user.id as number)
    
    // Store session
    await c.env.KV.put(`session:${user.id}`, token, { expirationTtl: 60 * 60 * 24 * 7 })

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        age: user.age,
        pronouns: user.pronouns
      },
      token
    })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Logout user
authRoutes.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'No authorization header' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = await verify(token, 'pulse_jwt_secret_2024')
    
    if (payload.userId) {
      await c.env.KV.delete(`session:${payload.userId}`)
    }

    return c.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    return c.json({ error: 'Logout failed' }, 500)
  }
})

// Get current user profile
authRoutes.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'No authorization header' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = await verify(token, 'pulse_jwt_secret_2024')
    
    if (!payload.userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    // Verify session exists
    const session = await c.env.KV.get(`session:${payload.userId}`)
    if (!session) {
      return c.json({ error: 'Session expired' }, 401)
    }

    // Get user data
    const user = await c.env.DB.prepare(`
      SELECT id, email, username, display_name, age, bio, pronouns, 
             location_city, location_state, location_visibility, profile_visibility,
             created_at, last_active
      FROM users WHERE id = ?
    `).bind(payload.userId).first()

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        age: user.age,
        bio: user.bio,
        pronouns: user.pronouns,
        location: {
          city: user.location_city,
          state: user.location_state,
          visibility: user.location_visibility
        },
        profileVisibility: user.profile_visibility,
        createdAt: user.created_at,
        lastActive: user.last_active
      }
    })
  } catch (error) {
    return c.json({ error: 'Failed to get user profile' }, 500)
  }
})