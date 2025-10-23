// PULSE Digital Hanky Code Dating Platform - Modern Interactive Frontend
// Electric Blue & Purple Theme with Full Accessibility

class PulseApp {
  constructor() {
    this.currentUser = null
    this.authToken = localStorage.getItem('pulse_auth_token')
    this.apiBase = '/api'
    this.currentPage = 'home'
    this.hankyCodes = []
    this.init()
  }

  async init() {
    console.log('🏳️‍🌈 Initializing PULSE App...')
    
    // Check authentication
    if (this.authToken) {
      await this.checkAuth()
    }
    
    // Set up routing
    this.setupRouting()
    
    // Load initial page
    this.loadPage(this.getCurrentRoute())
    
    console.log('✅ PULSE App initialized!')
  }

  // ==================== ROUTING ====================
  
  setupRouting() {
    // Handle back/forward browser buttons
    window.addEventListener('popstate', (e) => {
      this.loadPage(this.getCurrentRoute())
    })
    
    // Handle all anchor clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-route]')
      if (link) {
        e.preventDefault()
        const route = link.getAttribute('data-route')
        this.navigateTo(route)
      }
    })
  }

  getCurrentRoute() {
    return window.location.hash.slice(1) || 'home'
  }

  navigateTo(route) {
    window.location.hash = route
    this.loadPage(route)
  }

  async loadPage(route) {
    console.log(`📄 Loading page: ${route}`)
    this.currentPage = route
    
    const pages = {
      'home': () => this.renderHomePage(),
      'codes': () => this.renderCodesPage(),
      'discover': () => this.renderDiscoverPage(),
      'matches': () => this.renderMatchesPage(),
      'messages': () => this.renderMessagesPage(),
      'profile': () => this.renderProfilePage(),
      'settings': () => this.renderSettingsPage(),
      'safety': () => this.renderSafetyPage()
    }
    
    const renderFunction = pages[route] || pages['home']
    await renderFunction()
  }

  // ==================== API REQUESTS ====================
  
  async apiRequest(endpoint, options = {}) {
    const url = `${this.apiBase}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
      },
      ...options
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }
      
      return data
    } catch (error) {
      console.error('API Error:', error)
      this.showNotification(error.message, 'error')
      throw error
    }
  }

  // ==================== AUTHENTICATION ====================
  
  async checkAuth() {
    try {
      const response = await this.apiRequest('/auth/me')
      this.currentUser = response.user
      console.log('✅ User authenticated:', this.currentUser.displayName)
    } catch (error) {
      console.log('❌ Authentication failed')
      this.logout()
    }
  }

  async login(email, password) {
    try {
      const response = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      
      this.authToken = response.token
      this.currentUser = response.user
      localStorage.setItem('pulse_auth_token', this.authToken)
      
      this.showNotification(`Welcome back, ${this.currentUser.displayName}! 💜`, 'success')
      this.navigateTo('discover')
      return true
    } catch (error) {
      return false
    }
  }

  async register(userData) {
    try {
      const response = await this.apiRequest('/auth/register', {
        method: 'POST',
        body: userData
      })
      
      this.authToken = response.token
      this.currentUser = response.user
      localStorage.setItem('pulse_auth_token', this.authToken)
      
      this.showNotification(`Welcome to PULSE, ${this.currentUser.displayName}! 🏳️‍🌈`, 'success')
      this.navigateTo('profile')
      return true
    } catch (error) {
      return false
    }
  }

  logout() {
    this.authToken = null
    this.currentUser = null
    localStorage.removeItem('pulse_auth_token')
    this.showNotification('Logged out. Stay safe! 💙', 'info')
    this.navigateTo('home')
  }

  // ==================== HANKY CODES ====================
  
  async loadHankyCodes(category = 'all') {
    try {
      const endpoint = category === 'all' ? '/hanky-codes' : `/hanky-codes?category=${category}`
      const response = await this.apiRequest(endpoint)
      this.hankyCodes = response.codes || []
      return this.hankyCodes
    } catch (error) {
      return []
    }
  }

  async searchHankyCodes(query) {
    try {
      const response = await this.apiRequest(`/hanky-codes/search/${encodeURIComponent(query)}`)
      return response.codes || []
    } catch (error) {
      return []
    }
  }

  getColorHex(colorName) {
    const colorMap = {
      'red': '#DC2626', 'black': '#1F2937', 'blue': '#2563EB', 'yellow': '#EAB308',
      'grey': '#6B7280', 'gray': '#6B7280', 'orange': '#EA580C', 'white': '#F9FAFB',
      'brown': '#92400E', 'pink': '#EC4899', 'green': '#16A34A', 'purple': '#9333EA',
      'light blue': '#60A5FA', 'maroon': '#7C2D12', 'navy': '#1E3A8A', 'teal': '#0D9488'
    }
    return colorMap[colorName.toLowerCase()] || '#6B7280'
  }

  // ==================== PAGE RENDERS ====================
  
  async renderHomePage() {
    const isLoggedIn = !!this.currentUser
    
    const html = `
      <a href="#main" class="skip-to-main">Skip to main content</a>
      
      <!-- Navigation -->
      ${this.renderNav()}
      
      <!-- Main Content -->
      <main id="main" class="hero" role="main">
        <div class="container">
          <h1 class="hero-title">
            Connect Through <span class="gradient-text">Cultural Heritage</span>
          </h1>
          <p class="hero-subtitle">
            PULSE revives the authentic hanky code tradition for modern LGBTQ+ dating. 
            Discover meaningful connections through our community's rich cultural language.
          </p>
          <div class="hero-cta">
            ${isLoggedIn ? `
              <button class="btn btn-primary btn-lg" onclick="pulseApp.navigateTo('discover')" aria-label="Discover matches">
                🔍 Discover Matches
              </button>
              <button class="btn btn-secondary btn-lg" onclick="pulseApp.navigateTo('codes')" aria-label="Explore hanky codes">
                🏳️‍🌈 Explore Codes
              </button>
            ` : `
              <button class="btn btn-primary btn-lg" onclick="pulseApp.showRegisterModal()" aria-label="Get started with PULSE">
                ✨ Get Started
              </button>
              <button class="btn btn-secondary btn-lg" onclick="pulseApp.navigateTo('codes')" aria-label="Learn about hanky codes">
                📚 Learn More
              </button>
            `}
          </div>
        </div>
      </main>
      
      <!-- Features Section -->
      <section class="features" aria-labelledby="features-heading">
        <div class="container">
          <h2 id="features-heading" class="sr-only">Features</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon" role="img" aria-label="Rainbow flag">🏳️‍🌈</div>
              <h3 class="feature-title">Cultural Authenticity</h3>
              <p class="feature-description">
                22 genuine hanky code meanings rooted in LGBTQ+ leather community history since the 1970s.
              </p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon" role="img" aria-label="Lock">🔒</div>
              <h3 class="feature-title">Privacy First</h3>
              <p class="feature-description">
                Your safety matters. Granular location controls, blocking features, and comprehensive safety tools.
              </p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon" role="img" aria-label="Heart with ribbon">💝</div>
              <h3 class="feature-title">Meaningful Matches</h3>
              <p class="feature-description">
                Connect based on authentic shared interests and complementary hanky codes, not just photos.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      ${this.renderFooter()}
    `
    
    document.body.innerHTML = html
  }

  async renderCodesPage() {
    await this.loadHankyCodes()
    const categories = ['general', 'bdsm', 'fetish', 'romantic', 'casual']
    
    const html = `
      <a href="#main" class="skip-to-main">Skip to main content</a>
      ${this.renderNav()}
      
      <main id="main" class="container" style="padding: 3rem 1rem;" role="main">
        <div style="max-width: 1280px; margin: 0 auto;">
          <!-- Header -->
          <div class="flex justify-between items-center mb-xl">
            <h1 style="font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, var(--pulse-electric-blue) 0%, var(--pulse-purple) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              🏳️‍🌈 Hanky Code Reference
            </h1>
            <a href="#home" data-route="home" class="btn btn-ghost" aria-label="Back to home">
              ← Back
            </a>
          </div>
          
          <!-- Search Bar -->
          <div class="mb-xl">
            <label for="hanky-search" class="form-label">Search Hanky Codes</label>
            <input 
              type="search" 
              id="hanky-search"
              class="form-input"
              placeholder="Search by color, meaning, or category..."
              aria-label="Search hanky codes"
              oninput="pulseApp.handleSearch(event)"
            />
          </div>
          
          <!-- Category Filters -->
          <div class="mb-xl" role="group" aria-label="Category filters">
            <div class="flex gap-md" style="flex-wrap: wrap;">
              <button 
                class="btn btn-primary category-filter active" 
                data-category="all"
                onclick="pulseApp.filterCategory('all', event)"
                aria-pressed="true"
              >
                All
              </button>
              ${categories.map(cat => `
                <button 
                  class="btn btn-secondary category-filter" 
                  data-category="${cat}"
                  onclick="pulseApp.filterCategory('${cat}', event)"
                  aria-pressed="false"
                >
                  ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Codes Grid -->
          <div id="codes-grid" class="grid grid-cols-3" role="list" aria-label="Hanky codes">
            ${this.renderHankyCodesGrid(this.hankyCodes)}
          </div>
          
          ${this.hankyCodes.length === 0 ? `
            <div class="text-center" style="padding: 4rem; color: var(--pulse-text-tertiary);">
              <p style="font-size: 1.5rem; margin-bottom: 1rem;">📭</p>
              <p>No hanky codes found matching your search.</p>
            </div>
          ` : ''}
        </div>
      </main>
      
      ${this.renderFooter()}
    `
    
    document.body.innerHTML = html
  }

  renderHankyCodesGrid(codes) {
    return codes.map(code => `
      <div class="hanky-code-card" role="listitem" style="--hanky-code-color: ${this.getColorHex(code.color)};">
        <div class="hanky-code-header">
          <div 
            class="hanky-code-color" 
            style="background-color: ${this.getColorHex(code.color)};"
            role="img"
            aria-label="${code.color} hanky"
          ></div>
          <div class="hanky-code-info">
            <h3>${code.color}</h3>
            <div class="hanky-code-meta">
              <span class="hanky-code-position">${code.position}</span>
              <span>•</span>
              <span class="hanky-code-category">${code.category}</span>
            </div>
          </div>
        </div>
        
        <p class="hanky-code-meaning">${code.meaning}</p>
        
        ${code.description ? `
          <p class="hanky-code-description">${code.description}</p>
        ` : ''}
        
        ${code.cultural_context ? `
          <div class="hanky-code-cultural">
            <strong>Cultural Context:</strong> ${code.cultural_context}
          </div>
        ` : ''}
        
        ${this.currentUser ? `
          <button 
            class="btn btn-primary btn-sm mt-md" 
            onclick="pulseApp.addCodeToProfile(${code.id})"
            aria-label="Add ${code.color} ${code.position} to your profile"
          >
            ➕ Add to Profile
          </button>
        ` : ''}
      </div>
    `).join('')
  }

  async renderDiscoverPage() {
    if (!this.currentUser) {
      this.showNotification('Please sign in to discover matches', 'warning')
      this.navigateTo('home')
      return
    }
    
    const html = `
      <a href="#main" class="skip-to-main">Skip to main content</a>
      ${this.renderNav()}
      
      <main id="main" class="container" style="padding: 3rem 1rem;" role="main">
        <h1 style="font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, var(--pulse-electric-blue) 0%, var(--pulse-purple) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 2rem;">
          🔍 Discover Matches
        </h1>
        
        <div style="text-align: center; padding: 4rem; color: var(--pulse-text-secondary);">
          <div style="font-size: 4rem; margin-bottom: 1rem;">💖</div>
          <h2 style="color: var(--pulse-text-primary); margin-bottom: 1rem;">Coming Soon!</h2>
          <p>The matching algorithm is being fine-tuned to find your perfect complement.</p>
          <p style="margin-top: 1rem;">In the meantime, explore hanky codes and complete your profile!</p>
          <div class="flex gap-md justify-center mt-xl">
            <button class="btn btn-primary" onclick="pulseApp.navigateTo('codes')">
              Explore Codes
            </button>
            <button class="btn btn-secondary" onclick="pulseApp.navigateTo('profile')">
              Edit Profile
            </button>
          </div>
        </div>
      </main>
      
      ${this.renderFooter()}
    `
    
    document.body.innerHTML = html
  }

  async renderProfilePage() {
    if (!this.currentUser) {
      this.showNotification('Please sign in to view your profile', 'warning')
      this.navigateTo('home')
      return
    }
    
    const html = `
      <a href="#main" class="skip-to-main">Skip to main content</a>
      ${this.renderNav()}
      
      <main id="main" class="container" style="padding: 3rem 1rem;" role="main">
        <div class="container-sm">
          <h1 style="font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, var(--pulse-electric-blue) 0%, var(--pulse-purple) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 2rem;">
            👤 Your Profile
          </h1>
          
          <div style="background: var(--pulse-bg-secondary); border: 1px solid var(--pulse-border-primary); border-radius: var(--radius-xl); padding: 2rem;">
            <div style="text-align: center; margin-bottom: 2rem;">
              <div style="width: 120px; height: 120px; background: linear-gradient(135deg, var(--pulse-electric-blue) 0%, var(--pulse-purple) 100%); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                ${this.currentUser.displayName.charAt(0).toUpperCase()}
              </div>
              <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${this.currentUser.displayName}</h2>
              <p style="color: var(--pulse-text-tertiary);">@${this.currentUser.username}</p>
              <p style="color: var(--pulse-text-secondary); margin-top: 0.5rem;">${this.currentUser.pronouns}</p>
            </div>
            
            <div style="text-align: center; padding: 2rem; color: var(--pulse-text-secondary);">
              <p style="font-size: 3rem; margin-bottom: 1rem;">🎨</p>
              <p>Profile customization features coming soon!</p>
              <p style="margin-top: 1rem;">Add your bio, select hanky codes, and set your preferences.</p>
              <button class="btn btn-primary mt-xl" onclick="pulseApp.navigateTo('codes')">
                Add Hanky Codes
              </button>
            </div>
          </div>
        </div>
      </main>
      
      ${this.renderFooter()}
    `
    
    document.body.innerHTML = html
  }

  // ==================== UI COMPONENTS ====================
  
  renderNav() {
    const isLoggedIn = !!this.currentUser
    
    return `
      <nav class="nav" role="navigation" aria-label="Main navigation">
        <div class="nav-container">
          <div class="nav-brand">
            <a href="#home" data-route="home" class="nav-logo" aria-label="PULSE Home">
              ⚡ PULSE
            </a>
            <span class="nav-tagline">Digital Hanky Code Dating</span>
          </div>
          
          <div class="nav-links">
            ${isLoggedIn ? `
              <a href="#codes" data-route="codes" class="btn btn-ghost">Codes</a>
              <a href="#discover" data-route="discover" class="btn btn-ghost">Discover</a>
              <a href="#profile" data-route="profile" class="btn btn-ghost">Profile</a>
              <button class="btn btn-secondary" onclick="pulseApp.logout()" aria-label="Log out">
                Logout
              </button>
            ` : `
              <a href="#codes" data-route="codes" class="btn btn-ghost">Explore Codes</a>
              <button class="btn btn-secondary" onclick="pulseApp.showLoginModal()">
                Sign In
              </button>
              <button class="btn btn-primary" onclick="pulseApp.showRegisterModal()">
                Get Started
              </button>
            `}
          </div>
        </div>
      </nav>
    `
  }

  renderFooter() {
    return `
      <footer class="footer" role="contentinfo">
        <div class="footer-content">
          <p class="footer-text">© 2025 PULSE Digital Hanky Code Dating Platform</p>
          <p class="footer-text">Built with respect for LGBTQ+ leather community heritage 🏳️‍🌈</p>
          <div class="footer-links">
            <a href="#" class="footer-link">Privacy Policy</a>
            <a href="#" class="footer-link">Terms of Service</a>
            <a href="#safety" data-route="safety" class="footer-link">Safety Resources</a>
            <a href="https://github.com/Trevajed/pulse-dating-platform" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
          </div>
        </div>
      </footer>
    `
  }

  // ==================== MODALS ====================
  
  showLoginModal() {
    const modal = `
      <div class="modal-overlay" onclick="pulseApp.closeModal(event)" role="dialog" aria-labelledby="login-title" aria-modal="true">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2 id="login-title" class="modal-title">Sign In to PULSE</h2>
          </div>
          <div class="modal-body">
            <form onsubmit="pulseApp.handleLogin(event)" id="login-form">
              <div class="form-group">
                <label for="login-email" class="form-label">Email</label>
                <input 
                  type="email" 
                  id="login-email"
                  name="email" 
                  class="form-input"
                  required
                  autocomplete="email"
                  placeholder="your@email.com"
                />
              </div>
              
              <div class="form-group">
                <label for="login-password" class="form-label">Password</label>
                <input 
                  type="password" 
                  id="login-password"
                  name="password" 
                  class="form-input"
                  required
                  autocomplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="pulseApp.closeModal()">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
    document.getElementById('login-email').focus()
  }

  showRegisterModal() {
    const modal = `
      <div class="modal-overlay" onclick="pulseApp.closeModal(event)" role="dialog" aria-labelledby="register-title" aria-modal="true">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2 id="register-title" class="modal-title">Join PULSE Community</h2>
          </div>
          <div class="modal-body">
            <form onsubmit="pulseApp.handleRegister(event)" id="register-form">
              <div class="grid grid-cols-2 gap-md">
                <div class="form-group">
                  <label for="reg-email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    id="reg-email"
                    name="email" 
                    class="form-input"
                    required
                    autocomplete="email"
                  />
                </div>
                
                <div class="form-group">
                  <label for="reg-username" class="form-label">Username</label>
                  <input 
                    type="text" 
                    id="reg-username"
                    name="username" 
                    class="form-input"
                    required
                    autocomplete="username"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-md">
                <div class="form-group">
                  <label for="reg-displayName" class="form-label">Display Name</label>
                  <input 
                    type="text" 
                    id="reg-displayName"
                    name="displayName" 
                    class="form-input"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label for="reg-age" class="form-label">Age (18+)</label>
                  <input 
                    type="number" 
                    id="reg-age"
                    name="age" 
                    class="form-input"
                    min="18" 
                    max="100"
                    required
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="reg-pronouns" class="form-label">Pronouns</label>
                <select id="reg-pronouns" name="pronouns" class="form-select" required>
                  <option value="they/them">they/them</option>
                  <option value="he/him">he/him</option>
                  <option value="she/her">she/her</option>
                  <option value="ze/zir">ze/zir</option>
                  <option value="other">other</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="reg-password" class="form-label">Password</label>
                <input 
                  type="password" 
                  id="reg-password"
                  name="password" 
                  class="form-input"
                  required
                  minlength="8"
                  autocomplete="new-password"
                />
                <p class="form-hint">At least 8 characters</p>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="pulseApp.closeModal()">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  Join PULSE
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modal)
    document.getElementById('reg-email').focus()
  }

  closeModal(event) {
    if (event && event.target !== event.currentTarget) return
    const modal = document.querySelector('.modal-overlay')
    if (modal) modal.remove()
  }

  // ==================== EVENT HANDLERS ====================
  
  async handleLogin(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const email = formData.get('email')
    const password = formData.get('password')
    
    const btn = event.target.querySelector('button[type="submit"]')
    btn.disabled = true
    btn.textContent = 'Signing in...'
    
    const success = await this.login(email, password)
    
    if (success) {
      this.closeModal()
    } else {
      btn.disabled = false
      btn.textContent = 'Sign In'
    }
  }

  async handleRegister(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    
    const userData = {
      email: formData.get('email'),
      username: formData.get('username'),
      displayName: formData.get('displayName'),
      age: parseInt(formData.get('age')),
      pronouns: formData.get('pronouns'),
      password: formData.get('password')
    }
    
    const btn = event.target.querySelector('button[type="submit"]')
    btn.disabled = true
    btn.textContent = 'Creating account...'
    
    const success = await this.register(userData)
    
    if (success) {
      this.closeModal()
    } else {
      btn.disabled = false
      btn.textContent = 'Join PULSE'
    }
  }

  async handleSearch(event) {
    const query = event.target.value.trim()
    
    if (query.length === 0) {
      await this.loadHankyCodes()
    } else if (query.length >= 2) {
      this.hankyCodes = await this.searchHankyCodes(query)
    } else {
      return
    }
    
    const grid = document.getElementById('codes-grid')
    if (grid) {
      grid.innerHTML = this.renderHankyCodesGrid(this.hankyCodes)
    }
  }

  async filterCategory(category, event) {
    // Update button states
    document.querySelectorAll('.category-filter').forEach(btn => {
      btn.classList.remove('btn-primary', 'active')
      btn.classList.add('btn-secondary')
      btn.setAttribute('aria-pressed', 'false')
    })
    
    event.target.classList.remove('btn-secondary')
    event.target.classList.add('btn-primary', 'active')
    event.target.setAttribute('aria-pressed', 'true')
    
    // Load and render codes
    this.hankyCodes = await this.loadHankyCodes(category)
    const grid = document.getElementById('codes-grid')
    if (grid) {
      grid.innerHTML = this.renderHankyCodesGrid(this.hankyCodes)
    }
  }

  async addCodeToProfile(codeId) {
    if (!this.currentUser) {
      this.showNotification('Please sign in to add codes to your profile', 'warning')
      return
    }
    
    try {
      await this.apiRequest('/profiles/me/hanky-codes', {
        method: 'POST',
        body: { hankyCodeId: codeId, intensity: 5 }
      })
      this.showNotification('Hanky code added to your profile! 🎉', 'success')
    } catch (error) {
      // Error already shown by apiRequest
    }
  }

  // ==================== NOTIFICATIONS ====================
  
  showNotification(message, type = 'info') {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }
    
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.setAttribute('role', 'alert')
    notification.setAttribute('aria-live', 'polite')
    
    notification.innerHTML = `
      <div class="notification-header">
        <span style="font-weight: 600;">${icons[type]} ${message}</span>
        <button 
          class="notification-close" 
          onclick="this.closest('.notification').remove()"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    `
    
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 5000)
  }
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pulseApp = new PulseApp()
  })
} else {
  window.pulseApp = new PulseApp()
}
