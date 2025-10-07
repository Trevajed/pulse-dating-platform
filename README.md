# 🏳️‍🌈 PULSE Digital Hanky Code Dating Platform MVP

## Project Overview

**PULSE** is the first-mover Digital Hanky Code dating platform that revives authentic LGBTQ+ leather community traditions for modern dating. Built with respect for cultural heritage and community safety as core priorities.

- **Name**: PULSE Digital Hanky Code Dating Platform MVP
- **Goal**: Connect LGBTQ+ individuals through authentic hanky code traditions with modern safety features
- **Tech Stack**: Hono + TypeScript + Cloudflare Pages + D1 Database + TailwindCSS
- **Cultural Focus**: Authentic hanky code meanings rooted in leather community history

## 🌐 Live URLs

- **Development**: https://3000-iju8bxbwiobw4nr6ugbeq-6532622b.e2b.dev
- **API Health**: https://3000-iju8bxbwiobw4nr6ugbeq-6532622b.e2b.dev/api/health
- **GitHub**: https://github.com/Trevajed/pulse-dating-platform
- **Production**: *[To be deployed to Cloudflare Pages]*

## 📊 Data Architecture

### **Data Models & Storage Services**

**Cloudflare D1 Database (SQLite):**
- **Users**: Profile data, preferences, authentication, privacy settings
- **Hanky Codes**: Culturally authentic code meanings, categories, historical context
- **User Hanky Codes**: Many-to-many relationship with intensity levels (1-10)
- **Matches**: Compatibility scoring, match status, algorithmic data
- **Messages**: End-to-end conversation system with read receipts
- **Safety Reports**: Community moderation, auto-flagging system

**Cloudflare KV Storage:**
- **Sessions**: JWT token management, user authentication state
- **Rate Limiting**: Message throttling, API abuse prevention
- **Blocking**: User block relationships, safety controls
- **Moderation**: Auto-flagging, temporary restrictions

**Data Flow:**
1. **Authentication** → JWT tokens stored in KV, session management
2. **Profile Creation** → User preferences linked to authentic hanky codes
3. **Matching Algorithm** → Compatibility scoring based on complementary codes (left/right positioning)
4. **Messaging** → Real-time conversations between accepted matches
5. **Safety System** → Community reporting, auto-moderation, emergency features

### **Cultural Data Authenticity**
- **22 authentic hanky code meanings** from 1970s leather community
- **Historical context** and **cultural significance** preserved
- **Educational content** about LGBTQ+ leather community heritage
- **Respectful modern adaptations** for digital dating

## 🎯 Currently Completed Features

### ✅ **Core Authentication System**
- User registration with age verification (18+)
- Secure JWT-based login/logout
- Profile visibility controls (private/community/public)
- Session management with automatic expiration

### ✅ **Comprehensive Hanky Code System**
- **Culturally authentic code database** with historical context
- **Category filtering** (general, BDSM, fetish, romantic, casual)
- **Search functionality** by color, meaning, or description
- **Educational resources** about hanky code history and cultural significance
- **Popular codes tracking** based on community usage

### ✅ **Advanced Profile System**
- **Detailed user profiles** with pronouns, location, bio
- **Hanky code selection** with intensity levels (1-10 scale)
- **Privacy controls** for location visibility (hidden/city/state/country)
- **Profile compatibility** suggestions based on code complementarity

### ✅ **Intelligent Matching Algorithm**
- **Complementary code matching** (left/right position compatibility)
- **Compatibility scoring** (0-100%) based on shared interests
- **Geographic filtering** with privacy-first location sharing
- **Match discovery** with cultural authenticity focus

### ✅ **Complete Messaging System**
- **Real-time messaging** between accepted matches
- **Read receipts** and message status tracking
- **Rate limiting** (10 messages/minute) to prevent spam
- **Message deletion** (5-minute window for sender)
- **Conversation management** with unread counts

### ✅ **Comprehensive Safety Features**
- **Community reporting system** with multiple report categories
- **Auto-moderation** based on report thresholds
- **User blocking** with mutual protection
- **Emergency panic button** with crisis resources
- **Safety guidelines** and educational content
- **LGBTQ+ crisis hotlines** and community resources

### ✅ **Responsive PWA Frontend**
- **Dark theme** optimized for LGBTQ+ community aesthetics
- **Mobile-first responsive design** with progressive enhancement
- **Interactive hanky code exploration** with color-coded interface
- **Real-time notifications** and user feedback system
- **Accessibility features** with WCAG compliance considerations

## 🔗 API Endpoints Summary

### **Authentication (`/api/auth`)**
- `POST /register` - Create new user account
- `POST /login` - User authentication
- `POST /logout` - Session termination
- `GET /me` - Current user profile data

### **Hanky Codes (`/api/hanky-codes`)**
- `GET /` - All hanky codes with optional category filtering
- `GET /categories` - Available code categories
- `GET /search/:query` - Search codes by color/meaning
- `GET /popular/top` - Most popular codes in community
- `GET /education/history` - Cultural education content

### **Profiles (`/api/profiles`)**
- `GET /:userId` - Public profile view with privacy controls
- `PUT /me` - Update current user profile
- `POST /me/hanky-codes` - Add code to profile with intensity
- `DELETE /me/hanky-codes/:codeId` - Remove code from profile
- `GET /search/location` - Location-based profile discovery
- `GET /suggestions/compatible` - Compatible profile recommendations

### **Matches (`/api/matches`)**
- `GET /discover` - Discover potential matches with filtering
- `POST /create` - Create match (like someone)
- `GET /my-matches` - Current user's matches by status
- `PUT /:matchId/accept` - Accept incoming match
- `PUT /:matchId/decline` - Decline match
- `GET /stats` - Match statistics and performance

### **Messages (`/api/messages`)**
- `GET /:matchId` - Conversation history with read status
- `POST /:matchId/send` - Send message with rate limiting
- `GET /conversations/list` - All active conversations
- `PUT /:matchId/mark-read` - Mark messages as read
- `DELETE /:messageId` - Delete recent message (5-minute window)

### **Safety (`/api/safety`)**
- `POST /report` - Submit safety report with auto-moderation
- `POST /block` - Block user with mutual protection
- `POST /unblock` - Remove user block
- `GET /blocked` - List of blocked users
- `POST /panic` - Emergency panic button activation
- `GET /guidelines` - Safety resources and community guidelines

## 🚀 Features Not Yet Implemented

### **Phase 2 - Enhanced Features**
- [ ] **Real-time WebSocket messaging** (limited by Cloudflare Pages constraints)
- [ ] **Image upload for profiles** (requires R2 bucket integration)
- [ ] **Video chat integration** (third-party API integration needed)
- [ ] **Advanced matching ML algorithm** (requires vector database like Weaviate)
- [ ] **Push notifications** (PWA service worker implementation)
- [ ] **Geo-location services** (GPS-based proximity matching)

### **Phase 3 - Community Features**
- [ ] **Event creation and management** (community meetups, leather events)
- [ ] **Group chat functionality** (community discussions)
- [ ] **Mentorship program** (experienced community members helping newcomers)
- [ ] **Cultural education modules** (interactive learning about leather history)
- [ ] **Community guidelines gamification** (safety score, community reputation)

### **Phase 4 - Production Scale**
- [ ] **Advanced moderation tools** (AI-assisted content filtering)
- [ ] **Multi-language support** (internationalization for global LGBTQ+ community)
- [ ] **Premium subscription features** (enhanced matching, priority support)
- [ ] **Integration with leather community organizations** (event calendars, resources)
- [ ] **Advanced analytics dashboard** (community insights, safety metrics)

## 🛠️ Recommended Next Steps for Development

### **Immediate Priorities (Next Sprint)**
1. **Deploy to Cloudflare Pages** production environment
2. **Set up GitHub repository** and version control workflow
3. **Implement basic database seeding** with more diverse hanky codes
4. **Add user onboarding flow** with cultural education
5. **Enhance mobile responsiveness** and PWA capabilities

### **Short-term Goals (1-2 Months)**
1. **Add profile photo upload** using Cloudflare R2 storage
2. **Implement advanced search filters** (age, location radius, experience level)
3. **Create community guidelines enforcement** system
4. **Add email verification** and password reset functionality
5. **Beta testing** with small group of leather community members

### **Medium-term Goals (3-6 Months)**
1. **Cultural advisory board integration** for authenticity validation
2. **Advanced matching algorithm** with machine learning components
3. **Event management system** for community meetups
4. **Mobile app development** (React Native or Progressive Web App)
5. **Partnership with LGBTQ+ organizations** for community outreach

### **Long-term Vision (6+ Months)**
1. **Scale to 50,000+ DAU** with robust infrastructure
2. **International expansion** with cultural adaptations
3. **Advanced safety features** including AI moderation
4. **Premium features** and sustainable business model
5. **Community impact measurement** and cultural preservation initiatives

## 👥 Simple User Guide

### **Getting Started**
1. **Visit the Platform** → Access PULSE through the web URL
2. **Create Account** → Sign up with email, username, age (18+), pronouns
3. **Explore Hanky Codes** → Browse authentic codes and learn their meanings
4. **Build Your Profile** → Add codes that represent your interests/preferences
5. **Discover Matches** → Find compatible community members based on complementary codes
6. **Connect Safely** → Message matches, follow safety guidelines, report concerns

### **Understanding Hanky Codes**
- **Left Position** = Active/Top preference in that activity
- **Right Position** = Receptive/Bottom preference in that activity  
- **Intensity Level** = How interested you are (1-10 scale)
- **Cultural Respect** = Learn the history and meaning behind each code

### **Safety First**
- Meet in public places for first encounters
- Trust your instincts and communicate boundaries clearly
- Use the platform's safety features (reporting, blocking)
- Remember: Hanky codes indicate interest, not consent
- Access crisis resources if needed (Trevor Project: 1-866-488-7386)

## 🚀 Deployment Status

- **Platform**: Cloudflare Pages (Ready for deployment)
- **Status**: ✅ MVP Active in Development Environment
- **Environment**: Development sandbox with full feature set
- **Database**: Local D1 SQLite with production-ready schema
- **Last Updated**: October 7, 2024

## 🏗️ Technical Implementation Details

### **Architecture Pattern**
- **Frontend-Backend Separation** with Hono API routes
- **Edge-first design** optimized for Cloudflare's global network
- **Serverless architecture** with automatic scaling
- **Privacy-by-design** with client-side encryption considerations

### **Security Features**
- **JWT authentication** with secure session management
- **Rate limiting** on all user-facing endpoints
- **Input validation** and SQL injection prevention
- **CORS configuration** for secure cross-origin requests
- **Auto-moderation** system for community safety

### **Performance Optimizations**
- **CDN-based frontend libraries** for fast loading
- **Database indexing** on frequently queried fields
- **Caching strategy** using Cloudflare KV for session data
- **Optimized SQL queries** with prepared statements

---

*Built with ❤️ for the LGBTQ+ leather community. Honoring our history while building our future.*

**Cultural Note**: This platform is developed with deep respect for the leather community that created hanky codes. We acknowledge the historical significance and commit to preserving the authentic cultural meaning while adapting for modern digital connection.