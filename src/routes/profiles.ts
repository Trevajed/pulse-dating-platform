import { Hono } from 'hono'
import { verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

export const profileRoutes = new Hono<{ Bindings: Bindings }>()

// Middleware to authenticate requests
async function authenticateUser(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return null
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const payload = await verify(token, 'pulse_jwt_secret_2024')
    
    if (!payload.userId) {
      return null
    }

    // Verify session exists
    const session = await c.env.KV.get(`session:${payload.userId}`)
    if (!session) {
      return null
    }

    return payload.userId
  } catch (error) {
    return null
  }
}

// Get user profile (public view)
profileRoutes.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const currentUserId = await authenticateUser(c)
    
    // Get user profile
    const user = await c.env.DB.prepare(`
      SELECT 
        u.id, u.username, u.display_name, u.age, u.bio, u.pronouns,
        u.location_city, u.location_state, u.location_visibility, u.profile_visibility,
        u.created_at, u.last_active
      FROM users u 
      WHERE u.id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Check visibility permissions
    if (user.profile_visibility === 'private' && currentUserId != userId) {
      return c.json({ error: 'Profile is private' }, 403)
    }

    // Get user's hanky codes
    const { results: hankyCodes } = await c.env.DB.prepare(`
      SELECT 
        hc.id, hc.color, hc.position, hc.meaning, hc.description, hc.category,
        uhc.intensity, uhc.created_at as added_at
      FROM user_hanky_codes uhc
      JOIN hanky_codes hc ON uhc.hanky_code_id = hc.id
      WHERE uhc.user_id = ?
      ORDER BY uhc.intensity DESC, hc.category, hc.color
    `).bind(userId).all()

    // Filter location based on visibility settings
    let location = null
    if (user.location_visibility === 'city' && (user.location_city || user.location_state)) {
      location = {
        city: user.location_city,
        state: user.location_state,
        level: 'city'
      }
    } else if (user.location_visibility === 'state' && user.location_state) {
      location = {
        state: user.location_state,
        level: 'state'
      }
    }

    return c.json({
      success: true,
      profile: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        age: user.age,
        bio: user.bio,
        pronouns: user.pronouns,
        location,
        hankyCodes,
        memberSince: user.created_at,
        lastActive: user.last_active,
        isOwnProfile: currentUserId == userId
      }
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

// Update current user's profile
profileRoutes.put('/me', async (c) => {
  try {
    const userId = await authenticateUser(c)
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const updates = await c.req.json()
    const allowedFields = ['display_name', 'bio', 'pronouns', 'location_city', 'location_state', 
                          'location_visibility', 'profile_visibility']
    
    const updateData: any = {}
    const updateFields: string[] = []
    const values: any[] = []

    // Validate and prepare update fields
    for (const field of allowedFields) {
      if (field in updates) {
        updateFields.push(`${field} = ?`)
        values.push(updates[field])
      }
    }

    if (updateFields.length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400)
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(userId)

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
    const result = await c.env.DB.prepare(query).bind(...values).run()

    if (result.success) {
      return c.json({ success: true, message: 'Profile updated successfully' })
    } else {
      return c.json({ error: 'Failed to update profile' }, 500)
    }
  } catch (error) {
    return c.json({ error: 'Profile update failed' }, 500)
  }
})

// Add hanky code to user's profile
profileRoutes.post('/me/hanky-codes', async (c) => {
  try {
    const userId = await authenticateUser(c)
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const { hankyCodeId, intensity = 5 } = await c.req.json()
    
    if (!hankyCodeId) {
      return c.json({ error: 'Hanky code ID is required' }, 400)
    }

    if (intensity < 1 || intensity > 10) {
      return c.json({ error: 'Intensity must be between 1 and 10' }, 400)
    }

    // Check if hanky code exists
    const hankyCode = await c.env.DB.prepare(
      'SELECT id, position FROM hanky_codes WHERE id = ?'
    ).bind(hankyCodeId).first()

    if (!hankyCode) {
      return c.json({ error: 'Hanky code not found' }, 404)
    }

    // Add to user's codes (or update if exists)
    const result = await c.env.DB.prepare(`
      INSERT OR REPLACE INTO user_hanky_codes (user_id, hanky_code_id, position, intensity)
      VALUES (?, ?, ?, ?)
    `).bind(userId, hankyCodeId, hankyCode.position, intensity).run()

    if (result.success) {
      return c.json({ success: true, message: 'Hanky code added to profile' })
    } else {
      return c.json({ error: 'Failed to add hanky code' }, 500)
    }
  } catch (error) {
    return c.json({ error: 'Failed to add hanky code' }, 500)
  }
})

// Remove hanky code from user's profile
profileRoutes.delete('/me/hanky-codes/:codeId', async (c) => {
  try {
    const userId = await authenticateUser(c)
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const codeId = c.req.param('codeId')

    const result = await c.env.DB.prepare(
      'DELETE FROM user_hanky_codes WHERE user_id = ? AND hanky_code_id = ?'
    ).bind(userId, codeId).run()

    if (result.changes && result.changes > 0) {
      return c.json({ success: true, message: 'Hanky code removed from profile' })
    } else {
      return c.json({ error: 'Hanky code not found in profile' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'Failed to remove hanky code' }, 500)
  }
})

// Update hanky code intensity
profileRoutes.put('/me/hanky-codes/:codeId', async (c) => {
  try {
    const userId = await authenticateUser(c)
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const codeId = c.req.param('codeId')
    const { intensity } = await c.req.json()

    if (intensity < 1 || intensity > 10) {
      return c.json({ error: 'Intensity must be between 1 and 10' }, 400)
    }

    const result = await c.env.DB.prepare(
      'UPDATE user_hanky_codes SET intensity = ? WHERE user_id = ? AND hanky_code_id = ?'
    ).bind(intensity, userId, codeId).run()

    if (result.changes && result.changes > 0) {
      return c.json({ success: true, message: 'Hanky code intensity updated' })
    } else {
      return c.json({ error: 'Hanky code not found in profile' }, 404)
    }
  } catch (error) {
    return c.json({ error: 'Failed to update hanky code' }, 500)
  }
})

// Search profiles by location
profileRoutes.get('/search/location', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    const city = c.req.query('city')
    const state = c.req.query('state')
    const minAge = parseInt(c.req.query('minAge') || '18')
    const maxAge = parseInt(c.req.query('maxAge') || '100')

    if (!city && !state) {
      return c.json({ error: 'City or state parameter required' }, 400)
    }

    let whereConditions = ['u.profile_visibility != ?', 'u.age BETWEEN ? AND ?']
    let bindings = ['private', minAge, maxAge]

    if (currentUserId) {
      whereConditions.push('u.id != ?')
      bindings.push(currentUserId)
    }

    if (city) {
      whereConditions.push('LOWER(u.location_city) = LOWER(?)')
      bindings.push(city)
    }
    if (state) {
      whereConditions.push('LOWER(u.location_state) = LOWER(?)')
      bindings.push(state)
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        u.id, u.username, u.display_name, u.age, u.pronouns,
        u.location_city, u.location_state, u.location_visibility,
        u.last_active,
        COUNT(uhc.hanky_code_id) as hanky_code_count
      FROM users u
      LEFT JOIN user_hanky_codes uhc ON u.id = uhc.user_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY u.id
      ORDER BY u.last_active DESC
      LIMIT 50
    `).bind(...bindings).all()

    return c.json({
      success: true,
      profiles: results,
      total: results.length
    })
  } catch (error) {
    return c.json({ error: 'Profile search failed' }, 500)
  }
})

// Get profiles with similar hanky codes
profileRoutes.get('/suggestions/compatible', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    // Find users with complementary hanky codes (left/right matches)
    const { results } = await c.env.DB.prepare(`
      SELECT DISTINCT
        u.id, u.username, u.display_name, u.age, u.pronouns,
        u.location_city, u.location_state, u.location_visibility,
        COUNT(DISTINCT compatible_codes.hanky_code_id) as matching_codes,
        GROUP_CONCAT(hc.color || ' (' || hc.meaning || ')') as shared_interests
      FROM users u
      JOIN user_hanky_codes compatible_codes ON u.id = compatible_codes.user_id
      JOIN hanky_codes hc ON compatible_codes.hanky_code_id = hc.id
      WHERE u.id != ? 
        AND u.profile_visibility != 'private'
        AND EXISTS (
          -- Find users with opposite positions for same hanky codes
          SELECT 1 FROM user_hanky_codes my_codes
          JOIN hanky_codes my_hc ON my_codes.hanky_code_id = my_hc.id
          WHERE my_codes.user_id = ?
            AND my_hc.color = hc.color
            AND my_codes.position != compatible_codes.position
        )
      GROUP BY u.id
      HAVING matching_codes > 0
      ORDER BY matching_codes DESC, u.last_active DESC
      LIMIT 20
    `).bind(currentUserId, currentUserId).all()

    return c.json({
      success: true,
      compatibleProfiles: results
    })
  } catch (error) {
    return c.json({ error: 'Failed to find compatible profiles' }, 500)
  }
})