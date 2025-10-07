import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

export const hankyCodeRoutes = new Hono<{ Bindings: Bindings }>()

// Get all hanky codes
hankyCodeRoutes.get('/', async (c) => {
  try {
    const category = c.req.query('category') // Filter by category if provided
    
    let query = `
      SELECT id, color, position, meaning, description, category, cultural_context 
      FROM hanky_codes
    `
    let bindings: string[] = []
    
    if (category && category !== 'all') {
      query += ' WHERE category = ?'
      bindings.push(category)
    }
    
    query += ' ORDER BY category, color, position'
    
    const stmt = bindings.length > 0 ? 
      c.env.DB.prepare(query).bind(...bindings) : 
      c.env.DB.prepare(query)
    
    const { results } = await stmt.all()
    
    return c.json({
      success: true,
      codes: results,
      total: results.length
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch hanky codes' }, 500)
  }
})

// Get hanky code categories
hankyCodeRoutes.get('/categories', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT DISTINCT category, COUNT(*) as count 
      FROM hanky_codes 
      GROUP BY category 
      ORDER BY category
    `).all()
    
    return c.json({
      success: true,
      categories: results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch categories' }, 500)
  }
})

// Get specific hanky code by ID
hankyCodeRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const code = await c.env.DB.prepare(`
      SELECT id, color, position, meaning, description, category, cultural_context, created_at
      FROM hanky_codes 
      WHERE id = ?
    `).bind(id).first()
    
    if (!code) {
      return c.json({ error: 'Hanky code not found' }, 404)
    }
    
    return c.json({
      success: true,
      code
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch hanky code' }, 500)
  }
})

// Search hanky codes by color or meaning
hankyCodeRoutes.get('/search/:query', async (c) => {
  try {
    const query = c.req.param('query').toLowerCase()
    
    const { results } = await c.env.DB.prepare(`
      SELECT id, color, position, meaning, description, category, cultural_context
      FROM hanky_codes 
      WHERE LOWER(color) LIKE ? OR LOWER(meaning) LIKE ? OR LOWER(description) LIKE ?
      ORDER BY 
        CASE 
          WHEN LOWER(color) = ? THEN 1
          WHEN LOWER(color) LIKE ? THEN 2
          WHEN LOWER(meaning) LIKE ? THEN 3
          ELSE 4
        END,
        color, position
    `).bind(
      `%${query}%`, `%${query}%`, `%${query}%`, // Search terms
      query, `${query}%`, `%${query}%` // Ranking terms
    ).all()
    
    return c.json({
      success: true,
      codes: results,
      query,
      total: results.length
    })
  } catch (error) {
    return c.json({ error: 'Search failed' }, 500)
  }
})

// Get popular hanky codes (most used by users)
hankyCodeRoutes.get('/popular/top', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        hc.id, hc.color, hc.position, hc.meaning, hc.description, hc.category,
        COUNT(uhc.user_id) as user_count,
        AVG(uhc.intensity) as avg_intensity
      FROM hanky_codes hc
      LEFT JOIN user_hanky_codes uhc ON hc.id = uhc.hanky_code_id
      GROUP BY hc.id, hc.color, hc.position, hc.meaning, hc.description, hc.category
      ORDER BY user_count DESC, avg_intensity DESC
      LIMIT ?
    `).bind(limit).all()
    
    return c.json({
      success: true,
      popularCodes: results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch popular codes' }, 500)
  }
})

// Get hanky codes by color family (similar colors)
hankyCodeRoutes.get('/colors/:colorFamily', async (c) => {
  try {
    const colorFamily = c.req.param('colorFamily').toLowerCase()
    
    // Define color families for better grouping
    const colorFamilies: Record<string, string[]> = {
      'blue': ['blue', 'light blue', 'dark blue', 'navy', 'teal'],
      'red': ['red', 'maroon', 'burgundy', 'pink', 'rose'],
      'black': ['black', 'grey', 'gray', 'charcoal'],
      'white': ['white', 'cream', 'beige'],
      'green': ['green', 'olive', 'forest green'],
      'yellow': ['yellow', 'gold', 'amber'],
      'purple': ['purple', 'violet', 'lavender'],
      'brown': ['brown', 'tan', 'chocolate'],
      'orange': ['orange', 'peach', 'coral']
    }
    
    const colors = colorFamilies[colorFamily] || [colorFamily]
    const placeholders = colors.map(() => '?').join(',')
    
    const { results } = await c.env.DB.prepare(`
      SELECT id, color, position, meaning, description, category, cultural_context
      FROM hanky_codes 
      WHERE LOWER(color) IN (${placeholders})
      ORDER BY 
        CASE position WHEN 'left' THEN 1 WHEN 'right' THEN 2 END,
        color
    `).bind(...colors).all()
    
    return c.json({
      success: true,
      colorFamily,
      codes: results,
      total: results.length
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch color family codes' }, 500)
  }
})

// Get educational content about hanky codes
hankyCodeRoutes.get('/education/history', async (c) => {
  return c.json({
    success: true,
    history: {
      origin: "The hanky code (also known as the handkerchief code or flagging) originated in the 1970s gay leather community in San Francisco and New York.",
      purpose: "It served as a discrete way for LGBTQ+ individuals to communicate sexual preferences and interests in an era when homosexuality was heavily criminalized.",
      cultural_significance: "The code became an integral part of leather culture and BDSM communities, representing both practicality and pride in sexual identity.",
      modern_relevance: "Today, hanky codes continue to be used within LGBTQ+ communities as both historical homage and practical communication tool.",
      respect: "Understanding and using hanky codes requires respect for their cultural origins and the communities that created them."
    },
    guidelines: {
      authenticity: "Learn the traditional meanings before creating personal interpretations",
      consent: "Displaying a hanky code is not consent - always communicate directly",
      safety: "Use codes as conversation starters, not assumptions about someone's interests",
      community: "Respect the leather and BDSM communities that preserve this tradition"
    }
  })
})