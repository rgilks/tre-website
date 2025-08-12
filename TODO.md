# TRE Website Development TODO

## ✅ Completed Tasks

### Logo & Branding

- [x] **Create animated SVG logo** - `docs/logo-animated.svg`
- [x] **Create React component** - `src/components/TRELogo.tsx`

### Project Setup & Infrastructure

- [x] **Initialize Next.js project** with App Router
- [x] **Configure Tailwind CSS** with custom color palette and animations
- [x] **Set up TypeScript** configuration
- [x] **Configure Vitest** for unit testing
- [x] **Set up Prettier** for code formatting
- [x] **Configure PostCSS** with Tailwind and Autoprefixer

### Core Components

- [x] **Create layout component** (`src/app/layout.tsx`) with TRE branding
- [x] **Build hero section** with animated TRE logo
- [x] **Create project grid component** with loading states
- [x] **Build project card component** with proper styling
- [x] **Add navigation header** with logo and menu
- [x] **Create footer** with copyright information

### State Management & Types

- [x] **Create domain types** - Strong type system for projects and components
- [x] **Implement Zustand store** with Immer for immutable updates
- [x] **Add proper error handling** and loading states
- [x] **Create project filtering system** with search and language filters

### Development & Testing

- [x] **Set up development environment** - Dev server working correctly
- [x] **Configure component testing** - All store tests passing
- [x] **Fix test folder structure** - Tests now in same folders as code (following rules)
- [x] **Resolve component issues** - Fixed client/server component boundaries
- [x] **Fix metadata warnings** - Proper viewport export configuration
- [x] **Fix Heroicons imports** - Using correct icon names

### Code Quality & Standards

- [x] **Add data-testid attributes** to all UI components for e2e testing
- [x] **Implement proper error boundaries** and loading states
- [x] **Follow coding rules** - No __tests__ folders, proper client/server separation
- [x] **Ensure all linting issues resolved** - Clean build and development

## 🔄 In Progress

- [ ] **GitHub API Integration** - Basic structure in place, needs testing with real data

## 📋 Next Priority Tasks

### 1. Data Integration & API (Next Priority)

- [ ] **Test GitHub API integration** with real data
- [ ] **Set up environment variables** for GitHub token
- [ ] **Implement screenshot handling** from `docs/screenshot.*` files
- [ ] **Set up Cloudflare Image Resizing** for thumbnails
- [ ] **Implement data caching** with KV storage
- [ ] **Add error boundaries** for graceful failure handling
- [ ] **Test data fetching** with actual GitHub repositories

### 2. Project Detail View

- [ ] **Create project detail route** (`/project/[name]`)
- [ ] **Build iframe embedder** for project websites
- [ ] **Add fallback UI** for non-embeddable sites
- [ ] **Create overlay logo component** with green glow
- [ ] **Implement responsive iframe** with proper sandboxing
- [ ] **Add YouTube video support** - Create `YouTubeEmbed` component
- [ ] **Update project types** to include `youtubeUrl` field
- [ ] **Integrate YouTube videos** in project detail pages
- [ ] **Implement responsive video layout** - 16:9 aspect ratio across devices

### 3. PWA Features

- [ ] **Create web app manifest** (`manifest.webmanifest`)
- [ ] **Generate PWA icons** in multiple sizes
- [ ] **Implement service worker** with offline caching
- [ ] **Add install prompt component**
- [ ] **Configure offline fallbacks**

### 4. Enhanced Styling & Animations

- [ ] **Add more micro-interactions** with Framer Motion
- [ ] **Implement mobile navigation menu** for better mobile UX
- [ ] **Add scroll-triggered animations** for enhanced engagement
- [ ] **Optimize animation performance** for smooth 60fps

### 5. Performance & Optimization

- [ ] **Implement image optimization** with Cloudflare
- [ ] **Add lazy loading** for project screenshots
- [ ] **Optimize bundle size** for fast loading
- [ ] **Set up proper caching headers**
- [ ] **Add performance monitoring**
- [ ] **Implement lazy loading** for YouTube embeds

### 6. Testing & Quality

- [ ] **Add component tests** for key UI elements
- [ ] **Test PWA functionality** with Lighthouse
- [ ] **Validate responsive design** across devices
- [ ] **Test offline functionality**
- [ ] **Performance testing** with real data
- [ ] **Test YouTube embed functionality** across different video formats

### 7. Deployment & CI/CD

- [ ] **Configure Cloudflare Workers** environment
- [ ] **Set up build pipeline** with OpenNext
- [ ] **Configure custom domain** (tre.systems)
- [ ] **Set up monitoring** and error tracking
- [ ] **Implement staging environment**

## 🎨 Design Requirements

### Color Palette

- **Background:** #000000 (Black)
- **Primary:** #39FF14 (Terminal Green)
- **Secondary:** #F5F5DC (Beige)
- **Accent:** #FFFFFF (White)
- **Supporting:** #E8E8D0 (Dark Beige), #2ECC71 (Dark Green)

### Typography

- **Headings:** Modern, tech-inspired fonts
- **Body:** Readable, clean fonts
- **Terminal elements:** Monospace fonts where appropriate

### Layout

- **Hero section:** Full-width with animated logo
- **Project grid:** Responsive cards with screenshots
- **Navigation:** Sticky header with smooth scrolling
- **Footer:** Simple, clean design
- **Video integration:** Responsive YouTube embeds with proper spacing

## 🚀 Performance Targets

- **Lighthouse Score:** 90+ across all categories
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms

## 🌐 Browser Support

- **Modern browsers:** Chrome, Firefox, Safari, Edge
- **Mobile:** iOS Safari, Chrome Mobile
- **PWA:** Installable on supported platforms

## ♿ Accessibility

- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support
- **Focus indicators** for all interactive elements
- **Video accessibility** - Proper ARIA labels and keyboard controls

## 📱 PWA Specifications

### Manifest Features

- **App name:** "Total Reality Engineering"
- **Short name:** "TRE"
- **Description:** "Innovative engineering portfolio"
- **Theme color:** #39FF14 (Terminal Green)
- **Background color:** #000000 (Black)
- **Display mode:** Standalone
- **Orientation:** Portrait and landscape

### Service Worker

- **Precache:** Critical assets and routes
- **Runtime caching:** Images and project data
- **Offline fallback:** Graceful degradation
- **Update strategy:** Stale-while-revalidate

## 📅 Timeline

### Immediate (This Week)

1. **Set up GitHub API integration** - Add environment variables and test data fetching
2. **Create project detail routes** - Build the individual project view pages
3. **Test with real data** - Verify all components work with actual GitHub repositories
4. **Add YouTube video support** - Update types and create embed component

### Short Term (Next 2 Weeks)

1. **Complete PWA implementation** - Manifest, service worker, and offline support
2. **Add advanced animations** - Scroll-triggered effects and micro-interactions
3. **Implement project detail views** - Iframe embedding, YouTube videos, and fallback UI
4. **Test video integration** - Ensure responsive design and performance

### Medium Term (Next Month)

1. **Deploy to Cloudflare Workers** - Set up production environment
2. **Add monitoring and analytics** - Track performance and user engagement
3. **Optimize for production** - Performance tuning and SEO improvements
4. **Video optimization** - Implement lazy loading and performance improvements

## 🔧 Technical Notes

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS with custom animations
- **State Management:** Zustand with Immer
- **Testing:** Vitest for unit tests, Playwright for e2e
- **Deployment:** Cloudflare Workers with OpenNext
- **PWA:** Service worker with offline support
- **Performance:** Image optimization and lazy loading
- **Video Integration:** YouTube iframe API with responsive design
