import { Hono } from 'hono'
import { verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

export const messageRoutes = new Hono<{ Bindings: Bindings }>()

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

// Get messages for a specific match
messageRoutes.get('/:matchId', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const matchId = c.req.param('matchId')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    // Verify user is part of this match and match is accepted
    const match = await c.env.DB.prepare(
      'SELECT id, user1_id, user2_id, status FROM matches WHERE id = ?'
    ).bind(matchId).first()

    if (!match) {
      return c.json({ error: 'Match not found' }, 404)
    }

    if (match.user1_id != currentUserId && match.user2_id != currentUserId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    if (match.status !== 'accepted') {
      return c.json({ error: 'Can only message accepted matches' }, 403)
    }

    // Get messages
    const { results: messages } = await c.env.DB.prepare(`
      SELECT 
        m.id, m.sender_id, m.content, m.message_type, m.read_at, m.created_at,
        u.username, u.display_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.match_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(matchId, limit, offset).all()

    // Mark messages as read (only messages not sent by current user)
    if (messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => msg.sender_id != currentUserId && !msg.read_at)
        .map(msg => msg.id)

      if (unreadMessageIds.length > 0) {
        const placeholders = unreadMessageIds.map(() => '?').join(',')
        await c.env.DB.prepare(`
          UPDATE messages 
          SET read_at = CURRENT_TIMESTAMP 
          WHERE id IN (${placeholders})
        `).bind(...unreadMessageIds).run()
      }
    }

    return c.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      total: messages.length,
      hasMore: messages.length === limit
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// Send a message
messageRoutes.post('/:matchId/send', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const matchId = c.req.param('matchId')
    const { content, messageType = 'text' } = await c.req.json()

    if (!content || content.trim().length === 0) {
      return c.json({ error: 'Message content is required' }, 400)
    }

    if (content.length > 1000) {
      return c.json({ error: 'Message too long (max 1000 characters)' }, 400)
    }

    // Verify user is part of this match and match is accepted
    const match = await c.env.DB.prepare(
      'SELECT id, user1_id, user2_id, status FROM matches WHERE id = ?'
    ).bind(matchId).first()

    if (!match) {
      return c.json({ error: 'Match not found' }, 404)
    }

    if (match.user1_id != currentUserId && match.user2_id != currentUserId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    if (match.status !== 'accepted') {
      return c.json({ error: 'Can only message accepted matches' }, 403)
    }

    // Check rate limiting (max 10 messages per minute)
    const rateLimitKey = `rate_limit:${currentUserId}:${matchId}`
    const currentCount = await c.env.KV.get(rateLimitKey)
    
    if (currentCount && parseInt(currentCount) >= 10) {
      return c.json({ error: 'Rate limit exceeded. Please wait before sending more messages.' }, 429)
    }

    // Insert message
    const result = await c.env.DB.prepare(`
      INSERT INTO messages (match_id, sender_id, content, message_type)
      VALUES (?, ?, ?, ?)
    `).bind(matchId, currentUserId, content.trim(), messageType).run()

    if (result.success) {
      // Update rate limiting
      const newCount = (parseInt(currentCount || '0') + 1).toString()
      await c.env.KV.put(rateLimitKey, newCount, { expirationTtl: 60 })

      // Get the sent message with user info
      const sentMessage = await c.env.DB.prepare(`
        SELECT 
          m.id, m.sender_id, m.content, m.message_type, m.read_at, m.created_at,
          u.username, u.display_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `).bind(result.meta.last_row_id).first()

      return c.json({
        success: true,
        message: sentMessage
      })
    } else {
      return c.json({ error: 'Failed to send message' }, 500)
    }
  } catch (error) {
    return c.json({ error: 'Failed to send message' }, 500)
  }
})

// Get conversation list for current user
messageRoutes.get('/conversations/list', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const { results: conversations } = await c.env.DB.prepare(`
      SELECT DISTINCT
        m.id as match_id,
        m.compatibility_score,
        m.created_at as matched_at,
        u.id as partner_id,
        u.username,
        u.display_name,
        u.age,
        u.pronouns,
        u.location_city,
        u.location_state,
        u.last_active,
        last_msg.content as last_message,
        last_msg.created_at as last_message_at,
        last_msg.sender_id as last_sender_id,
        COALESCE(unread_count.count, 0) as unread_messages
      FROM matches m
      JOIN users u ON (
        CASE 
          WHEN m.user1_id = ? THEN u.id = m.user2_id
          ELSE u.id = m.user1_id
        END
      )
      LEFT JOIN (
        SELECT DISTINCT
          match_id,
          content,
          created_at,
          sender_id,
          ROW_NUMBER() OVER (PARTITION BY match_id ORDER BY created_at DESC) as rn
        FROM messages
      ) last_msg ON m.id = last_msg.match_id AND last_msg.rn = 1
      LEFT JOIN (
        SELECT 
          match_id,
          COUNT(*) as count
        FROM messages
        WHERE sender_id != ? AND read_at IS NULL
        GROUP BY match_id
      ) unread_count ON m.id = unread_count.match_id
      WHERE (m.user1_id = ? OR m.user2_id = ?)
        AND m.status = 'accepted'
      ORDER BY last_msg.created_at DESC, m.created_at DESC
    `).bind(currentUserId, currentUserId, currentUserId, currentUserId).all()

    return c.json({
      success: true,
      conversations: conversations.map(conv => ({
        matchId: conv.match_id,
        partner: {
          id: conv.partner_id,
          username: conv.username,
          displayName: conv.display_name,
          age: conv.age,
          pronouns: conv.pronouns,
          location: {
            city: conv.location_city,
            state: conv.location_state
          },
          lastActive: conv.last_active
        },
        lastMessage: {
          content: conv.last_message,
          sentAt: conv.last_message_at,
          sentByMe: conv.last_sender_id == currentUserId
        },
        unreadCount: conv.unread_messages,
        matchedAt: conv.matched_at,
        compatibilityPercentage: Math.round(conv.compatibility_score * 100)
      }))
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch conversations' }, 500)
  }
})

// Mark messages as read
messageRoutes.put('/:matchId/mark-read', async (c) => {
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

    // Mark all unread messages from the other user as read
    const result = await c.env.DB.prepare(`
      UPDATE messages 
      SET read_at = CURRENT_TIMESTAMP 
      WHERE match_id = ? 
        AND sender_id != ? 
        AND read_at IS NULL
    `).bind(matchId, currentUserId).run()

    return c.json({
      success: true,
      markedAsRead: result.changes || 0
    })
  } catch (error) {
    return c.json({ error: 'Failed to mark messages as read' }, 500)
  }
})

// Delete a message (soft delete - for sender only)
messageRoutes.delete('/:messageId', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const messageId = c.req.param('messageId')

    // Verify user sent this message and it's less than 5 minutes old
    const message = await c.env.DB.prepare(`
      SELECT id, sender_id, created_at, content
      FROM messages 
      WHERE id = ? AND sender_id = ?
    `).bind(messageId, currentUserId).first()

    if (!message) {
      return c.json({ error: 'Message not found or unauthorized' }, 404)
    }

    // Check if message is less than 5 minutes old
    const messageTime = new Date(message.created_at).getTime()
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    if (now - messageTime > fiveMinutes) {
      return c.json({ error: 'Can only delete messages within 5 minutes of sending' }, 403)
    }

    // Soft delete by updating content
    const result = await c.env.DB.prepare(
      'UPDATE messages SET content = ?, message_type = ? WHERE id = ?'
    ).bind('[Message deleted]', 'system', messageId).run()

    if (result.success) {
      return c.json({ success: true, message: 'Message deleted' })
    } else {
      return c.json({ error: 'Failed to delete message' }, 500)
    }
  } catch (error) {
    return c.json({ error: 'Failed to delete message' }, 500)
  }
})

// Get message statistics
messageRoutes.get('/stats/overview', async (c) => {
  try {
    const currentUserId = await authenticateUser(c)
    if (!currentUserId) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT m.match_id) as active_conversations,
        COUNT(msg.id) as total_messages_sent,
        COUNT(CASE WHEN msg.sender_id != ? THEN 1 END) as total_messages_received,
        COUNT(CASE WHEN msg.sender_id != ? AND msg.read_at IS NULL THEN 1 END) as unread_messages
      FROM matches m
      LEFT JOIN messages msg ON m.id = msg.match_id
      WHERE (m.user1_id = ? OR m.user2_id = ?)
        AND m.status = 'accepted'
    `).bind(currentUserId, currentUserId, currentUserId, currentUserId).first()

    return c.json({
      success: true,
      stats
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch message statistics' }, 500)
  }
})