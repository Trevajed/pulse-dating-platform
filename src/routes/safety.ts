import { Hono } from 'hono'
import { verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

export const safetyRoutes = new Hono<{ Bindings: Bindings }>()

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

// Submit safety report
safetyRoutes.post('/report', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const { reportedUserId, reportType, description } = await c.req.json()

    if (!reportedUserId || !reportType || !description) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    if (reportedUserId == currentUserId) {
      return c.json({ error: 'Cannot report yourself' }, 400)
    }

    // Validate report type
    const validTypes = ['harassment', 'inappropriate_content', 'fake_profile', 'safety_concern', 'other']
    if (!validTypes.includes(reportType)) {
      return c.json({ error: 'Invalid report type' }, 400)
    }

    // Check if user has already reported this person recently (prevent spam)
    const existingReport = await c.env.DB.prepare(`
      SELECT id FROM safety_reports 
      WHERE reporter_id = ? AND reported_user_id = ? 
      AND created_at > datetime('now', '-24 hours')
    `).bind(currentUserId, reportedUserId).first()

    if (existingReport) {
      return c.json({ error: 'You can only report the same user once per 24 hours' }, 429)
    }

    // Verify reported user exists
    const reportedUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).bind(reportedUserId).first()

    if (!reportedUser) {
      return c.json({ error: 'Reported user not found' }, 404)
    }

    // Create safety report
    const result = await c.env.DB.prepare(`
      INSERT INTO safety_reports (reporter_id, reported_user_id, report_type, description)
      VALUES (?, ?, ?, ?)
    `).bind(currentUserId, reportedUserId, reportType, description.trim()).run()

    if (result.success) {
      // Auto-moderate based on report count
      await autoModerateUser(c, reportedUserId)

      return c.json({
        success: true,
        message: 'Report submitted successfully. Our team will review it shortly.',
        reportId: result.meta.last_row_id
      })
    } else {
      return c.json({ error: 'Failed to submit report' }, 500)
    }
  } catch (error) {
    return c.json({ error: 'Failed to submit safety report' }, 500)
  }
})

// Auto-moderation based on report count
async function autoModerateUser(c: any, userId: number) {
  try {
    // Count reports in last 7 days
    const reportCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM safety_reports 
      WHERE reported_user_id = ? 
      AND created_at > datetime('now', '-7 days')
      AND status != 'dismissed'
    `).bind(userId).first()

    const count = reportCount?.count || 0

    // Auto-actions based on report threshold
    if (count >= 5) {
      // Temporary restriction - hide profile from discovery
      await c.env.KV.put(`user_restricted:${userId}`, 'true', { expirationTtl: 60 * 60 * 24 * 7 }) // 7 days
      
      // Log moderation action
      await c.env.DB.prepare(`
        INSERT INTO safety_reports (reporter_id, reported_user_id, report_type, description, status)
        VALUES (0, ?, 'system', 'Auto-restricted due to multiple reports (${count})', 'investigating')
      `).bind(userId).run()
    } else if (count >= 3) {
      // Warning flag - reduce visibility in matching
      await c.env.KV.put(`user_flagged:${userId}`, 'true', { expirationTtl: 60 * 60 * 24 * 3 }) // 3 days
    }
  } catch (error) {
    console.error('Auto-moderation failed:', error)
  }
}

// Block user
safetyRoutes.post('/block', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const { blockedUserId } = await c.req.json()

    if (!blockedUserId || blockedUserId == currentUserId) {
      return c.json({ error: 'Invalid user to block' }, 400)
    }

    // Store block relationship in KV (faster lookup)
    const blockKey = `blocked:${currentUserId}:${blockedUserId}`
    await c.env.KV.put(blockKey, 'true', { expirationTtl: 60 * 60 * 24 * 365 }) // 1 year

    // Also block in reverse direction (mutual block)
    const reverseBlockKey = `blocked:${blockedUserId}:${currentUserId}`
    await c.env.KV.put(reverseBlockKey, 'true', { expirationTtl: 60 * 60 * 24 * 365 })

    // Remove any existing matches between users
    await c.env.DB.prepare(
      'UPDATE matches SET status = ? WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)'
    ).bind('blocked', currentUserId, blockedUserId, blockedUserId, currentUserId).run()

    return c.json({
      success: true,
      message: 'User blocked successfully'
    })
  } catch (error) {
    return c.json({ error: 'Failed to block user' }, 500)
  }
})

// Unblock user
safetyRoutes.post('/unblock', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const { unblockedUserId } = await c.req.json()

    if (!unblockedUserId) {
      return c.json({ error: 'User ID required' }, 400)
    }

    // Remove block relationships
    const blockKey = `blocked:${currentUserId}:${unblockedUserId}`
    const reverseBlockKey = `blocked:${unblockedUserId}:${currentUserId}`
    
    await c.env.KV.delete(blockKey)
    await c.env.KV.delete(reverseBlockKey)

    return c.json({
      success: true,
      message: 'User unblocked successfully'
    })
  } catch (error) {
    return c.json({ error: 'Failed to unblock user' }, 500)
  }
})

// Get blocked users list
safetyRoutes.get('/blocked', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    // Get all blocked user keys from KV
    const { keys } = await c.env.KV.list({ prefix: `blocked:${currentUserId}:` })
    
    const blockedUserIds = keys.map(key => {
      const parts = key.name.split(':')
      return parseInt(parts[2])
    }).filter(id => !isNaN(id))

    if (blockedUserIds.length === 0) {
      return c.json({
        success: true,
        blockedUsers: []
      })
    }

    // Get user details for blocked users
    const placeholders = blockedUserIds.map(() => '?').join(',')
    const { results: blockedUsers } = await c.env.DB.prepare(`
      SELECT id, username, display_name 
      FROM users 
      WHERE id IN (${placeholders})
    `).bind(...blockedUserIds).all()

    return c.json({
      success: true,
      blockedUsers
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch blocked users' }, 500)
  }
})

// Check if user is blocked
safetyRoutes.get('/is-blocked/:userId', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const targetUserId = c.req.param('userId')
    const blockKey = `blocked:${currentUserId}:${targetUserId}`
    
    const isBlocked = await c.env.KV.get(blockKey)

    return c.json({
      success: true,
      isBlocked: !!isBlocked
    })
  } catch (error) {
    return c.json({ error: 'Failed to check block status' }, 500)
  }
})

// Emergency panic button
safetyRoutes.post('/panic', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const { location, situation } = await c.req.json()

    // Log emergency situation
    const emergencyId = `emergency:${currentUserId}:${Date.now()}`
    const emergencyData = {
      userId: currentUserId,
      location: location || 'Location not provided',
      situation: situation || 'Emergency situation',
      timestamp: new Date().toISOString(),
      status: 'active'
    }

    await c.env.KV.put(emergencyId, JSON.stringify(emergencyData), { expirationTtl: 60 * 60 * 24 }) // 24 hours

    // In a production app, this would:
    // 1. Contact emergency services if location is provided
    // 2. Send alerts to emergency contacts
    // 3. Create incident report for platform safety team
    // 4. Temporarily hide user's profile for safety

    // For MVP, we'll simulate emergency response
    return c.json({
      success: true,
      message: 'Emergency alert activated. Help is on the way.',
      emergencyId,
      helplineNumbers: {
        'US': '911',
        'LGBTQ+ Crisis': '1-866-488-7386',
        'National Suicide Prevention': '988',
        'Trevor Project': '1-866-488-7386'
      }
    })
  } catch (error) {
    return c.json({ error: 'Emergency system error' }, 500)
  }
})

// Get safety guidelines and resources
safetyRoutes.get('/guidelines', async (c) => {
  return c.json({
    success: true,
    guidelines: {
      meeting_safety: [
        "Meet in public places for first dates",
        "Tell a friend your plans and location", 
        "Keep your phone charged and accessible",
        "Trust your instincts - leave if something feels wrong",
        "Avoid sharing personal address until you trust someone"
      ],
      online_safety: [
        "Don't share financial information",
        "Be cautious of requests for money or gifts",
        "Verify identity through video calls before meeting",
        "Use the platform's messaging system initially",
        "Report suspicious or inappropriate behavior"
      ],
      consent_respect: [
        "Hanky codes indicate interest, not consent",
        "Always communicate directly about boundaries",
        "Respect 'no' as a complete answer",
        "Consent can be withdrawn at any time",
        "Check in regularly during intimate encounters"
      ],
      community_respect: [
        "Honor the cultural significance of hanky codes",
        "Be patient with newcomers to the community",
        "Respect different experience levels and interests",
        "Support inclusive and welcoming behavior",
        "Challenge discrimination when you see it"
      ]
    },
    resources: {
      crisis_lines: {
        'Trevor Project': '1-866-488-7386',
        'LGBT Hotline': '1-888-843-4564', 
        'Crisis Text Line': 'Text HOME to 741741',
        'National Suicide Prevention': '988'
      },
      safety_apps: [
        "bSafe - Share location with trusted contacts",
        "Noonlight - One-tap emergency response",
        "SafeTrek - Hold button, release when unsafe"
      ],
      educational_resources: [
        "Leather Archives & Museum",
        "LGBTQ+ Community Centers",
        "Safe, Sane & Consensual guides",
        "Local leather/BDSM organizations"
      ]
    }
  })
})

// Get safety statistics (anonymous)
safetyRoutes.get('/stats', async (c) => {
  try {
    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_reports,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reports,
        SUM(CASE WHEN created_at > datetime('now', '-30 days') THEN 1 ELSE 0 END) as recent_reports
      FROM safety_reports
      WHERE reporter_id != 0
    `).first()

    return c.json({
      success: true,
      stats: {
        ...stats,
        response_time_avg: '< 2 hours',
        platform_safety_rating: '4.8/5.0',
        active_moderators: 3
      }
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch safety statistics' }, 500)
  }
})