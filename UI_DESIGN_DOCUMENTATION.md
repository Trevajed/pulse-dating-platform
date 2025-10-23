# 🎨 PULSE UI Design Documentation

## Overview

PULSE features a modern, accessible user interface designed specifically for the LGBTQ+ leather community with respect for cultural heritage and a focus on usability and safety.

---

## 🌈 Design Philosophy

### **Core Principles**

1. **Cultural Authenticity** - Color-coded elements reflect historical hanky code colors
2. **Sophisticated Comfort** - Dark theme with electric blue and purple accents creates a welcoming, modern atmosphere
3. **Accessibility First** - WCAG AA compliance mandated by EU law (June 2025 deadline)
4. **Clean & Focused** - Avoid overwhelming new users with too much information at once
5. **Privacy & Safety** - Visual cues for security features and clear safety controls

---

## 🎨 Color System

### **Primary Brand Colors**

```css
Electric Blue (Primary): #00D4FF
├─ Hover: #00B8E6
├─ Light: #33DFFF
└─ Dark: #0099CC

Purple (Secondary): #A855F7
├─ Hover: #9333EA
├─ Light: #C084FC
└─ Dark: #7E22CE
```

### **Semantic Colors**

- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Info**: #00D4FF (Electric Blue)

### **Dark Theme Neutrals**

- **Background Primary**: #0A0A0F (Deep black-blue)
- **Background Secondary**: #1A1A2E (Elevated surfaces)
- **Background Tertiary**: #252538 (Cards, inputs)
- **Background Elevated**: #2D2D44 (Modals, dropdowns)

- **Text Primary**: #FFFFFF (High contrast)
- **Text Secondary**: #C7C7D1 (Body text)
- **Text Tertiary**: #8E8E9E (Hints, metadata)
- **Text Disabled**: #5E5E6E (Disabled state)

- **Border Primary**: #3A3A52 (Visible borders)
- **Border Secondary**: #2A2A3E (Subtle dividers)

### **Historical Hanky Code Colors**

```css
--hanky-red: #DC2626      (Fisting)
--hanky-black: #1F2937    (S&M)
--hanky-blue: #2563EB     (Oral)
--hanky-yellow: #EAB308   (Watersports)
--hanky-grey: #6B7280     (Bondage)
--hanky-orange: #EA580C   (Anything Goes)
--hanky-white: #F9FAFB    (Masturbation)
--hanky-brown: #92400E    (Scat)
--hanky-pink: #EC4899     (Romantic)
--hanky-green: #16A34A    (Hustler/Trade)
--hanky-purple: #9333EA   (Piercing)
--hanky-light-blue: #60A5FA (Oral 69)
--hanky-maroon: #7C2D12   (Cut/Uncut)
```

---

## 📐 Layout System

### **Spacing Scale**

```
xs:  0.25rem  (4px)
sm:  0.5rem   (8px)
md:  1rem     (16px)
lg:  1.5rem   (24px)
xl:  2rem     (32px)
2xl: 3rem     (48px)
3xl: 4rem     (64px)
```

### **Typography Scale**

```
xs:   0.75rem   (12px)
sm:   0.875rem  (14px)
base: 1rem      (16px)
lg:   1.125rem  (18px)
xl:   1.25rem   (20px)
2xl:  1.5rem    (24px)
3xl:  1.875rem  (30px)
4xl:  2.25rem   (36px)
5xl:  3rem      (48px)
```

### **Container System**

- **Default**: 1280px max-width
- **Small**: 640px max-width (forms, profiles)
- **Large**: 1536px max-width (dashboards)

---

## 🧩 Component Library

### **Buttons**

#### Primary Button
- **Use**: Main actions (Sign Up, Create Match, Send Message)
- **Style**: Gradient background (electric blue → purple)
- **States**: Hover (lift + glow), Active (press down), Disabled (50% opacity)

#### Secondary Button
- **Use**: Alternative actions (Cancel, Back, Browse)
- **Style**: Solid background with border
- **States**: Hover (brighter background), Focus (blue outline)

#### Ghost Button
- **Use**: Tertiary actions (navigation links)
- **Style**: Transparent background, text color only
- **States**: Hover (subtle background), Focus (outline)

### **Forms**

#### Input Fields
- **Background**: Elevated dark surface (#2D2D44)
- **Border**: Subtle (#3A3A52)
- **Focus State**: Blue border + shadow ring
- **Error State**: Red border + error message below
- **Hint Text**: Tertiary color, small font

#### Labels
- **Position**: Above input (always visible)
- **Font**: Semi-bold, secondary color
- **Required**: Asterisk (*) indicator

### **Cards**

#### Feature Cards
- **Background**: Secondary dark (#1A1A2E)
- **Border**: 1px solid border color
- **Hover**: Lift animation + glow shadow
- **Top Border**: Gradient line appears on hover

#### Hanky Code Cards
- **Background**: Secondary dark
- **Left Border**: 4px colored stripe (hanky color)
- **Color Indicator**: 48px circle with hanky color
- **Metadata**: Position, category badges
- **Cultural Context**: Italicized in info box

### **Navigation**

#### Nav Bar
- **Background**: Gradient (secondary → tertiary)
- **Position**: Sticky top
- **Height**: 70px
- **Logo**: Gradient text effect
- **Shadow**: Elevation shadow + backdrop blur

#### Footer
- **Background**: Secondary dark
- **Border**: Top border
- **Links**: Centered, hover effect
- **Copyright**: Small, tertiary color

### **Modals**

#### Structure
- **Overlay**: Black 75% opacity + blur
- **Container**: Elevated background, rounded corners
- **Max Width**: 500px
- **Padding**: 2rem all sides
- **Shadow**: Large elevation + glow

#### Animations
- **Overlay**: Fade in (150ms)
- **Modal**: Slide up + fade (200ms)
- **Close**: Fade out (150ms)

### **Notifications (Toast)**

#### Types
- **Success**: Green left border
- **Error**: Red left border
- **Warning**: Amber left border
- **Info**: Blue left border

#### Behavior
- **Position**: Top right corner
- **Animation**: Slide in from right
- **Duration**: 5 seconds auto-dismiss
- **Close**: Manual × button

---

## ♿ Accessibility Features (WCAG AA)

### **Keyboard Navigation**

- ✅ All interactive elements focusable
- ✅ Tab order follows visual hierarchy
- ✅ Esc key closes modals
- ✅ Enter/Space activates buttons

### **Focus Indicators**

- ✅ 3px solid electric blue outline
- ✅ 2px offset from element
- ✅ 4.5:1 minimum contrast ratio
- ✅ Visible on all interactive elements

### **Screen Reader Support**

- ✅ Semantic HTML5 elements (`nav`, `main`, `aside`, `footer`)
- ✅ ARIA labels on icon buttons
- ✅ ARIA roles for custom components
- ✅ ARIA live regions for dynamic content
- ✅ Skip-to-main-content link
- ✅ Alt text on all images

### **Color Contrast**

- ✅ Text on background: 7:1 (AAA level)
- ✅ Interactive elements: 4.5:1 minimum
- ✅ Disabled text: Clearly differentiated
- ✅ Focus indicators: 3:1 against background

### **Text & Typography**

- ✅ Base font size: 16px (1rem)
- ✅ Line height: 1.6 for body text
- ✅ Inter font (highly legible)
- ✅ Resizable text up to 200%
- ✅ No text in images (except logos)

### **Form Accessibility**

- ✅ Labels always visible (not placeholders)
- ✅ Error messages announced to screen readers
- ✅ Required fields indicated
- ✅ Form validation feedback
- ✅ Autocomplete attributes

---

## 📱 Responsive Design

### **Breakpoints**

```css
Mobile:  < 768px
Tablet:  768px - 1024px
Desktop: > 1024px
```

### **Mobile Adaptations**

- **Navigation**: Stacks vertically, full-width buttons
- **Grids**: Single column layout
- **Modals**: Full-width on small screens
- **Typography**: Slightly smaller on mobile
- **Touch Targets**: Minimum 44×44px
- **Spacing**: Reduced padding on mobile

---

## 🎬 Animations & Transitions

### **Timing Functions**

```css
Fast:  150ms ease-in-out (micro-interactions)
Base:  200ms ease-in-out (standard)
Slow:  300ms ease-in-out (page transitions)
```

### **Animation Guidelines**

- **Hover Effects**: Lift cards 2-4px
- **Click Effects**: Press down effect
- **Loading States**: Spinner animation
- **Page Transitions**: Fade content
- **Modal Entry**: Slide up + fade in
- **Toast Entry**: Slide from right

### **Performance**

- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Respect `prefers-reduced-motion` media query

---

## 🔍 Interactive States

### **Button States**

1. **Default**: Base styling
2. **Hover**: Lift + glow shadow
3. **Active**: Press down
4. **Focus**: Blue outline ring
5. **Disabled**: 50% opacity, no interaction

### **Input States**

1. **Default**: Subtle border
2. **Focus**: Blue border + shadow ring
3. **Error**: Red border + error message
4. **Disabled**: Grey background, no interaction
5. **Valid**: Green checkmark (optional)

### **Link States**

1. **Default**: Electric blue color
2. **Hover**: Lighter blue
3. **Visited**: Slightly dimmer
4. **Focus**: Outline ring
5. **Active**: Pressed state

---

## 🌐 Pages & Views

### **Home Page (Unauthenticated)**

- Hero section with gradient title
- Call-to-action buttons (Get Started, Learn More)
- Feature cards (3-column grid)
- Footer with links

### **Hanky Codes Explorer**

- Search bar with real-time filtering
- Category filter buttons (All, BDSM, Fetish, etc.)
- Grid of hanky code cards (3 columns)
- Color-coded cards with cultural context
- "Add to Profile" button (if logged in)

### **Discovery Page (Authenticated)**

- Placeholder for matching algorithm
- Coming soon message
- Links to explore codes and edit profile

### **Profile Page (Authenticated)**

- User avatar (gradient circle with initial)
- Display name, username, pronouns
- Placeholder for bio and hanky codes
- Link to add hanky codes

### **Authentication Modals**

#### Login Modal
- Email input
- Password input
- Sign In button
- Cancel button

#### Register Modal
- Email, Username inputs (row)
- Display Name, Age inputs (row)
- Pronouns dropdown
- Password input
- Join PULSE button
- Cancel button

---

## 🎯 User Experience Patterns

### **First-Time User Flow**

1. **Landing**: See hero with clear value proposition
2. **Explore**: Browse hanky codes without account
3. **Register**: Modal appears, simple 6-field form
4. **Welcome**: Success toast, navigate to profile
5. **Complete Profile**: Add hanky codes, set preferences
6. **Discover**: Start finding matches

### **Returning User Flow**

1. **Login**: Quick modal login
2. **Welcome**: Personalized greeting
3. **Navigate**: Access discover, messages, profile
4. **Browse**: Explore new codes or matches

### **Hanky Code Discovery**

1. **Browse**: View all codes on grid
2. **Filter**: Click category to narrow results
3. **Search**: Type color or meaning
4. **Learn**: Read cultural context
5. **Add**: Click "Add to Profile" if interested

---

## 🔐 Safety Visual Design

### **Safety Indicators**

- **Lock Icons**: Privacy controls
- **Shield Icons**: Safety features
- **Eye Icons**: Visibility settings
- **Warning Icons**: Caution messages

### **Trust Signals**

- LGBTQ+ inclusive language throughout
- Cultural respect messaging in footer
- Clear privacy policy links
- Safety resources easily accessible

---

## 📊 Performance Metrics

### **Target Metrics**

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 100KB (achieved: 92.76KB)
- **Lighthouse Score**: 90+ (Accessibility, Performance, Best Practices)

### **Optimizations**

- CSS variables for theming (no duplication)
- Deferred JavaScript loading
- Optimized font loading (Google Fonts)
- Minimal external dependencies
- Efficient re-renders (SPA routing)

---

## 🚀 Future Enhancements

### **Planned Features**

- [ ] Profile photo upload with crop tool
- [ ] Dark/light mode toggle (currently dark only)
- [ ] Enhanced animations (micro-interactions)
- [ ] Skeleton loading states
- [ ] Infinite scroll for hanky codes
- [ ] Advanced search filters
- [ ] Hanky code comparison tool
- [ ] Cultural education modal with history
- [ ] Onboarding tour for new users
- [ ] Keyboard shortcuts reference

### **Advanced Accessibility**

- [ ] High contrast mode
- [ ] Larger text option
- [ ] Dyslexia-friendly font option
- [ ] Voice navigation support
- [ ] More detailed ARIA descriptions

---

## 📚 Resources

### **Design Tools**

- **Figma**: N/A (direct code implementation)
- **Color Palette**: Adobe Color, Coolors
- **Fonts**: Google Fonts (Inter)
- **Icons**: Unicode emojis (accessible)

### **Accessibility Testing**

- **axe DevTools**: Browser extension for auditing
- **WAVE**: WebAIM accessibility checker
- **Lighthouse**: Chrome DevTools audit
- **Screen Readers**: NVDA (Windows), VoiceOver (macOS)

### **Documentation**

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [A11y Project](https://www.a11yproject.com/)

---

## 🎨 Design Tokens (CSS Variables)

All design tokens are defined as CSS custom properties in `/public/static/style.css` under the `:root` selector. This enables:

- Consistent theming across the app
- Easy theme switching (future feature)
- Maintainable code with single source of truth
- Better performance (no CSS-in-JS runtime)

---

**Last Updated**: October 23, 2025  
**Version**: 2.0.0  
**Designer**: PULSE Team  
**Accessibility Compliance**: WCAG 2.1 AA
