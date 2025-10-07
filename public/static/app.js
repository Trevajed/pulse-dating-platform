// PULSE Digital Hanky Code Dating Platform - Frontend JavaScript
class PulseApp {
  constructor() {
    this.currentUser = null
    this.authToken = localStorage.getItem('pulse_auth_token')
    this.apiBase = '/api'
    this.init()
  }

  async init() {
    // Check authentication status
    if (this.authToken) {
      await this.checkAuth()
    }
    
    this.setupEventListeners()
    this.loadInitialData()
  }

  // API Helper Methods
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

  // Authentication
  async checkAuth() {
    try {
      const response = await this.apiRequest('/auth/me')
      this.currentUser = response.user
      this.updateUI()
    } catch (error) {
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
      
      this.showNotification('Welcome back to PULSE!', 'success')
      this.updateUI()
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
      
      this.showNotification('Welcome to PULSE! 🏳️‍🌈', 'success')
      this.updateUI()
      return true
    } catch (error) {
      return false
    }
  }

  logout() {
    this.authToken = null
    this.currentUser = null
    localStorage.removeItem('pulse_auth_token')
    this.updateUI()
    this.showNotification('Goodbye! Stay safe out there. 💜', 'info')
  }

  // Hanky Code Functions
  async loadHankyCodes(category = 'all') {
    try {
      const response = await this.apiRequest(`/hanky-codes?category=${category}`)
      return response.codes
    } catch (error) {
      return []
    }
  }

  async searchHankyCodes(query) {
    try {
      const response = await this.apiRequest(`/hanky-codes/search/${encodeURIComponent(query)}`)
      return response.codes
    } catch (error) {
      return []
    }
  }

  async getPopularHankyCodes() {
    try {
      const response = await this.apiRequest('/hanky-codes/popular/top?limit=6')
      return response.popularCodes
    } catch (error) {
      return []
    }
  }

  // Profile Functions
  async getUserProfile(userId) {
    try {
      const response = await this.apiRequest(`/profiles/${userId}`)
      return response.profile
    } catch (error) {
      return null
    }
  }

  async updateProfile(profileData) {
    try {
      await this.apiRequest('/profiles/me', {
        method: 'PUT',
        body: profileData
      })
      this.showNotification('Profile updated successfully!', 'success')
      return true
    } catch (error) {
      return false
    }
  }

  async addHankyCodeToProfile(hankyCodeId, intensity = 5) {
    try {
      await this.apiRequest('/profiles/me/hanky-codes', {
        method: 'POST',
        body: { hankyCodeId, intensity }
      })
      this.showNotification('Hanky code added to your profile!', 'success')
      return true
    } catch (error) {
      return false
    }
  }

  // Matching Functions
  async discoverMatches(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString()
      const response = await this.apiRequest(`/matches/discover?${params}`)
      return response.potentialMatches
    } catch (error) {
      return []
    }
  }

  async createMatch(targetUserId) {
    try {
      const response = await this.apiRequest('/matches/create', {
        method: 'POST',
        body: { targetUserId }
      })
      this.showNotification('Match created! 💖', 'success')
      return response.match
    } catch (error) {
      return null
    }
  }

  async getMyMatches(status = 'all') {
    try {
      const response = await this.apiRequest(`/matches/my-matches?status=${status}`)
      return response.matches
    } catch (error) {
      return []
    }
  }

  // UI Helper Functions
  updateUI() {
    const navButtons = document.querySelector('.nav-buttons')
    if (!navButtons) return

    if (this.currentUser) {
      navButtons.innerHTML = `
        <span class="text-gray-300">Welcome, ${this.currentUser.displayName}</span>
        <button onclick="pulseApp.showProfile()" class="text-gray-300 hover:text-white px-3 py-2 text-sm">
          Profile
        </button>
        <button onclick="pulseApp.showMatches()" class="text-gray-300 hover:text-white px-3 py-2 text-sm">
          Matches
        </button>
        <button onclick="pulseApp.logout()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
          Logout
        </button>
      `
    } else {
      navButtons.innerHTML = `
        <button onclick="pulseApp.showHankyCodes()" class="text-gray-300 hover:text-white px-3 py-2 text-sm">
          Explore Codes
        </button>
        <button onclick="pulseApp.showRegister()" class="text-gray-300 hover:text-white px-3 py-2 text-sm">
          Sign Up
        </button>
        <button onclick="pulseApp.showLogin()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
          Sign In
        </button>
      `
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    const colors = {
      success: 'bg-green-600',
      error: 'bg-red-600', 
      warning: 'bg-yellow-600',
      info: 'bg-blue-600'
    }
    
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm`
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    `
    
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 5000)
  }

  // Navigation Functions
  async showHankyCodes() {
    const codes = await this.loadHankyCodes()
    const categories = ['general', 'bdsm', 'fetish', 'romantic', 'casual']
    
    const content = `
      <div class="min-h-screen bg-gray-900 text-white">
        <div class="max-w-6xl mx-auto py-8 px-4">
          <div class="flex items-center justify-between mb-8">
            <h1 class="text-3xl font-bold text-purple-400">Hanky Code Reference</h1>
            <button onclick="window.history.back()" class="text-purple-400 hover:text-purple-300">
              ← Back
            </button>
          </div>
          
          <!-- Search -->
          <div class="mb-6">
            <input 
              type="text" 
              id="hanky-search"
              placeholder="Search by color or meaning..." 
              class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white"
              onkeyup="pulseApp.handleHankySearch(event)"
            />
          </div>
          
          <!-- Category Filter -->
          <div class="mb-8">
            <div class="flex flex-wrap gap-2">
              <button onclick="pulseApp.filterHankyCodes('all')" 
                      class="filter-btn active bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                All
              </button>
              ${categories.map(cat => `
                <button onclick="pulseApp.filterHankyCodes('${cat}')" 
                        class="filter-btn bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg capitalize">
                  ${cat}
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Codes Grid -->
          <div id="hanky-codes-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${this.renderHankyCodesGrid(codes)}
          </div>
        </div>
      </div>
    `
    
    document.body.innerHTML = content
  }

  renderHankyCodesGrid(codes) {
    return codes.map(code => `
      <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
        <div class="flex items-center mb-3">
          <div class="w-8 h-8 rounded-full mr-3 border-2 border-gray-600" 
               style="background-color: ${this.getColorHex(code.color)}"></div>
          <div>
            <h3 class="font-semibold text-white">${code.color}</h3>
            <span class="text-sm text-gray-400 capitalize">${code.position} • ${code.category}</span>
          </div>
        </div>
        <p class="text-purple-300 font-medium mb-2">${code.meaning}</p>
        <p class="text-gray-300 text-sm mb-3">${code.description || ''}</p>
        ${code.cultural_context ? `
          <p class="text-xs text-gray-400 italic">${code.cultural_context}</p>
        ` : ''}
        ${this.currentUser ? `
          <button onclick="pulseApp.addHankyCodeToProfile(${code.id})" 
                  class="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
            Add to Profile
          </button>
        ` : ''}
      </div>
    `).join('')
  }

  getColorHex(colorName) {
    const colorMap = {
      'red': '#dc2626', 'black': '#1f2937', 'blue': '#2563eb', 'yellow': '#eab308',
      'grey': '#6b7280', 'gray': '#6b7280', 'orange': '#ea580c', 'white': '#f9fafb',
      'brown': '#92400e', 'pink': '#ec4899', 'green': '#16a34a', 'purple': '#9333ea',
      'light blue': '#60a5fa', 'maroon': '#7c2d12'
    }
    return colorMap[colorName.toLowerCase()] || '#6b7280'
  }

  async handleHankySearch(event) {
    const query = event.target.value.trim()
    if (query.length === 0) {
      this.showHankyCodes()
      return
    }
    
    if (query.length >= 2) {
      const codes = await this.searchHankyCodes(query)
      document.getElementById('hanky-codes-grid').innerHTML = this.renderHankyCodesGrid(codes)
    }
  }

  async filterHankyCodes(category) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-purple-600', 'hover:bg-purple-700')
      btn.classList.add('bg-gray-700', 'hover:bg-gray-600')
    })
    event.target.classList.add('active', 'bg-purple-600', 'hover:bg-purple-700')
    
    const codes = await this.loadHankyCodes(category)
    document.getElementById('hanky-codes-grid').innerHTML = this.renderHankyCodesGrid(codes)
  }

  showLogin() {
    const modal = this.createModal('Sign In to PULSE', `
      <form onsubmit="pulseApp.handleLogin(event)">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input type="email" name="email" required 
                 class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input type="password" name="password" required 
                 class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
        </div>
        <div class="flex gap-4">
          <button type="submit" 
                  class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold">
            Sign In
          </button>
          <button type="button" onclick="pulseApp.closeModal()" 
                  class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg">
            Cancel
          </button>
        </div>
      </form>
    `)
    document.body.appendChild(modal)
  }

  showRegister() {
    const modal = this.createModal('Join PULSE Community', `
      <form onsubmit="pulseApp.handleRegister(event)">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input type="email" name="email" required 
                   class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input type="text" name="username" required 
                   class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
            <input type="text" name="displayName" required 
                   class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Age</label>
            <input type="number" name="age" min="18" max="100" required 
                   class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Pronouns</label>
          <select name="pronouns" 
                  class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
            <option value="they/them">they/them</option>
            <option value="he/him">he/him</option>
            <option value="she/her">she/her</option>
            <option value="other">other</option>
          </select>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input type="password" name="password" required minlength="6"
                 class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
        </div>
        <div class="flex gap-4">
          <button type="submit" 
                  class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold">
            Join PULSE
          </button>
          <button type="button" onclick="pulseApp.closeModal()" 
                  class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg">
            Cancel
          </button>
        </div>
      </form>
    `)
    document.body.appendChild(modal)
  }

  createModal(title, content) {
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-bold text-white mb-4">${title}</h2>
        ${content}
      </div>
    `
    return modal
  }

  closeModal() {
    const modal = document.querySelector('.fixed.inset-0')
    if (modal) modal.remove()
  }

  async handleLogin(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const email = formData.get('email')
    const password = formData.get('password')
    
    const success = await this.login(email, password)
    if (success) {
      this.closeModal()
      window.location.href = '/'
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
    
    const success = await this.register(userData)
    if (success) {
      this.closeModal()
      window.location.href = '/'
    }
  }

  // Load initial data for homepage
  async loadInitialData() {
    if (!document.getElementById('hanky-code-preview')) return
    
    try {
      const popularCodes = await this.getPopularHankyCodes()
      const previewContainer = document.getElementById('hanky-code-preview')
      
      previewContainer.innerHTML = popularCodes.map(code => `
        <div class="text-center">
          <div class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-gray-600" 
               style="background-color: ${this.getColorHex(code.color)}"></div>
          <p class="text-sm text-white font-medium">${code.color}</p>
          <p class="text-xs text-gray-400">${code.position}</p>
        </div>
      `).join('')
    } catch (error) {
      console.log('Could not load popular codes')
    }
  }

  setupEventListeners() {
    // Add nav buttons container to existing nav
    const nav = document.querySelector('nav .flex.items-center.justify-between')
    if (nav && !document.querySelector('.nav-buttons')) {
      const navButtons = document.createElement('div')
      navButtons.className = 'nav-buttons flex space-x-4'
      nav.appendChild(navButtons)
      this.updateUI()
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pulseApp = new PulseApp()
})

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PulseApp
}