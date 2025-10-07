import { Hono } from 'hono'
import { verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

export const matchRoutes = new Hono<{ Bindings: Bindings }>()

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

// Calculate compatibility score between two users
async function calculateCompatibility(c: any, user1Id: number, user2Id: number): Promise<{ score: number, matchedCodes: number[] }> {
  try {
    // Get hanky codes for both users
    const { results: user1Codes } = await c.env.DB.prepare(`
      SELECT hc.id, hc.color, uhc.position, uhc.intensity 
      FROM user_hanky_codes uhc
      JOIN hanky_codes hc ON uhc.hanky_code_id = hc.id
      WHERE uhc.user_id = ?
    `).bind(user1Id).all()

    const { results: user2Codes } = await c.env.DB.prepare(`
      SELECT hc.id, hc.color, uhc.position, uhc.intensity 
      FROM user_hanky_codes uhc
      JOIN hanky_codes hc ON uhc.hanky_code_id = hc.id
      WHERE uhc.user_id = ?
    `).bind(user2Id).all()

    let totalScore = 0
    let maxPossibleScore = 0
    const matchedCodes: number[] = []

    // Compare codes - higher scores for complementary positions (left/right)
    for (const code1 of user1Codes) {
      maxPossibleScore += 10 // Maximum intensity
      
      const matchingCode = user2Codes.find(code2 => 
        code2.color === code1.color
      )

      if (matchingCode) {
        matchedCodes.push(code1.id)
        
        // Complementary positions (left/right) get higher scores
        if (code1.position !== matchingCode.position) {
          totalScore += Math.min(code1.intensity, matchingCode.intensity) * 1.5
        } else {
          // Same positions get moderate scores
          totalScore += Math.min(code1.intensity, matchingCode.intensity) * 0.8
        }
      }
    }

    // Normalize score to 0-1 range
    const normalizedScore = maxPossibleScore > 0 ? Math.min(totalScore / maxPossibleScore, 1.0) : 0

    return {
      score: normalizedScore,
      matchedCodes
    }
  } catch (error) {
    return { score: 0, matchedCodes: [] }
  }
}

// Get potential matches for current user
matchRoutes.get('/discover', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const limit = parseInt(c.req.query('limit') || '20')
    const minAge = parseInt(c.req.query('minAge') || '18')
    const maxAge = parseInt(c.req.query('maxAge') || '100')

    // Get current user's location for distance filtering
    const currentUser = await c.env.DB.prepare(
      'SELECT location_city, location_state FROM users WHERE id = ?'
    ).bind(currentUserId).first()

    // Find potential matches excluding already matched users
    let locationFilter = ''
    let bindings = [currentUserId, currentUserId, minAge, maxAge]

    if (currentUser?.location_city) {
      locationFilter = 'AND (u.location_city = ? OR u.location_city IS NULL)'
      bindings.push(currentUser.location_city)
    }

    const { results: potentialMatches } = await c.env.DB.prepare(`
      SELECT DISTINCT
        u.id, u.username, u.display_name, u.age, u.pronouns, u.bio,
        u.location_city, u.location_state, u.location_visibility,
        u.last_active,
        COUNT(DISTINCT uhc.hanky_code_id) as hanky_code_count
      FROM users u
      LEFT JOIN user_hanky_codes uhc ON u.id = uhc.user_id
      WHERE u.id != ?
        AND u.profile_visibility IN ('public', 'community')
        AND u.age BETWEEN ? AND ?
        AND u.id NOT IN (
          SELECT CASE 
            WHEN user1_id = ? THEN user2_id 
            ELSE user1_id 
          END
          FROM matches 
          WHERE (user1_id = ? OR user2_id = ?) 
            AND status IN ('accepted', 'declined', 'blocked')
        )
        ${locationFilter}
      GROUP BY u.id
      HAVING hanky_code_count > 0
      ORDER BY u.last_active DESC
      LIMIT ?
    `).bind(...bindings, currentUserId, currentUserId, limit).all()

    // Calculate compatibility scores for each potential match
    const matchesWithScores = []
    
    for (const match of potentialMatches) {
      const { score, matchedCodes } = await calculateCompatibility(c, currentUserId, match.id)
      
      if (score > 0.1) { // Only include matches with some compatibility
        matchesWithScores.push({
          ...match,
          compatibilityScore: Math.round(score * 100),
          matchedCodesCount: matchedCodes.length
        })
      }
    }

    // Sort by compatibility score
    matchesWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    return c.json({
      success: true,
      potentialMatches: matchesWithScores.slice(0, limit)
    })
  } catch (error) {
    return c.json({ error: 'Failed to discover matches' }, 500)
  }
})

// Create a match (like someone)
matchRoutes.post('/create', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const { targetUserId } = await c.req.json()

    if (!targetUserId || targetUserId == currentUserId) {
      return c.json({ error: 'Invalid target user' }, 400)
    }

    // Check if match already exists
    const existingMatch = await c.env.DB.prepare(`
      SELECT id, status FROM matches 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `).bind(currentUserId, targetUserId, targetUserId, currentUserId).first()

    if (existingMatch) {
      return c.json({ 
        error: 'Match already exists', 
        status: existingMatch.status 
      }, 409)
    }

    // Calculate compatibility
    const { score, matchedCodes } = await calculateCompatibility(c, currentUserId, targetUserId)

    // Create match record
    const result = await c.env.DB.prepare(`
      INSERT INTO matches (user1_id, user2_id, compatibility_score, match_type, status, matched_codes)
      VALUES (?, ?, ?, 'mutual_like', 'pending', ?)
    `).bind(
      Math.min(currentUserId, targetUserId), // Consistent ordering
      Math.max(currentUserId, targetUserId),
      score,
      JSON.stringify(matchedCodes)
    ).run()

    if (result.success) {
      return c.json({
        success: true,
        match: {
          id: result.meta.last_row_id,
          compatibilityScore: Math.round(score * 100),
          status: 'pending',
          matchedCodesCount: matchedCodes.length
        }
      })
    } else {
      return c.json({ error: 'Failed to create match' }, 500)
    }
  } catch (error) {
    return c.json({ error: 'Failed to create match' }, 500)
  }
})

// Get current user's matches
matchRoutes.get('/my-matches', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const status = c.req.query('status') || 'all'

    let statusFilter = ''
    let bindings = [currentUserId, currentUserId]

    if (status !== 'all') {
      statusFilter = 'AND m.status = ?'
      bindings.push(status)
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        m.id, m.compatibility_score, m.match_type, m.status, m.matched_codes, m.created_at,
        u.id as partner_id, u.username, u.display_name, u.age, u.pronouns,
        u.location_city, u.location_state, u.location_visibility, u.last_active,
        COUNT(msg.id) as message_count,
        MAX(msg.created_at) as last_message_at
      FROM matches m
      JOIN users u ON (
        CASE 
          WHEN m.user1_id = ? THEN u.id = m.user2_id
          ELSE u.id = m.user1_id
        END
      )
      LEFT JOIN messages msg ON m.id = msg.match_id
      WHERE (m.user1_id = ? OR m.user2_id = ?)
        ${statusFilter}
      GROUP BY m.id, u.id
      ORDER BY 
        CASE m.status 
          WHEN 'accepted' THEN 1 
          WHEN 'pending' THEN 2 
          ELSE 3 
        END,
        last_message_at DESC,
        m.created_at DESC
    `).bind(...bindings, currentUserId).all()

    return c.json({
      success: true,
      matches: results.map(match => ({
        ...match,
        compatibilityPercentage: Math.round(match.compatibility_score * 100),
        matchedCodes: JSON.parse(match.matched_codes || '[]')
      }))
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch matches' }, 500)
  }
})

// Accept a match
matchRoutes.put('/:matchId/accept', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const matchId = c.req.param('matchId')

    // Verify user is part of this match
    const match = await c.env.DB.prepare(
      'SELECT id, user1_id, user2_id, status FROM matches WHERE id = ?'
    ).bind(matchId).first()

    if (!match) {
      return c.json({ error: 'Match not found' }, 404)
    }

    if (match.user1_id != currentUserId && match.user2_id != currentUserId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    if (match.status === 'accepted') {
      return c.json({ success: true, message: 'Match already accepted' })
    }

    // Update match status
    const result = await c.env.DB.prepare(
      'UPDATE matches SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind('accepted', matchId).run()

    if (result.success) {
      return c.json({ success: true, message: 'Match accepted' })
    } else {
      return c.json({ error: 'Failed to accept match' }, 500)
    }
  } catch (error) {
    return c.json({ error: 'Failed to accept match' }, 500)
  }
})

// Decline a match
matchRoutes.put('/:matchId/decline', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const matchId = c.req.param('matchId')

    // Verify user is part of this match
    const match = await c.env.DB.prepare(
      'SELECT id, user1_id, user2_id FROM matches WHERE id = ?'
    ).bind(matchId).first()

    if (!match) {
      return c.json({ error: 'Match not found' }, 404)
    }

    if (match.user1_id != currentUserId && match.user2_id != currentUserId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    // Update match status
    const result = await c.env.DB.prepare(
      'UPDATE matches SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind('declined', matchId).run()

    if (result.success) {
      return c.json({ success: true, message: 'Match declined' })
    } else {
      return c.json({ error: 'Failed to decline match' }, 500)
    }
  } catch (error) {
    return c.json({ error: 'Failed to decline match' }, 500)
  }
})

// Get match statistics
matchRoutes.get('/stats', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_matches,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_matches,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_matches,
        SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) as declined_matches,
        AVG(compatibility_score) as avg_compatibility
      FROM matches 
      WHERE user1_id = ? OR user2_id = ?
    `).bind(currentUserId, currentUserId).first()

    return c.json({
      success: true,
      stats: {
        ...stats,
        avgCompatibilityPercentage: Math.round((stats.avg_compatibility || 0) * 100)
      }
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch match statistics' }, 500)
  }
})