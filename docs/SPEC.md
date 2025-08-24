# TRE Website Specification

## Project Overview

**Total Reality Engineering (TRE)** is a portfolio website showcasing innovative engineering projects. The site features a modern, terminal-inspired design with a focus on performance, accessibility, and progressive web app capabilities.

## Technical Architecture

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **State Management**: Zustand with Immer for immutable updates
- **Testing**: Vitest for unit tests, Playwright for e2e testing
- **Deployment**: Cloudflare Workers with OpenNext
- **Caching**: Cloudflare KV with 6-hour TTL and cron-based refresh

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                # Business logic and utilities
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── test/               # Test utilities and fixtures
```

## Core Features

### 1. Project Showcase
- **Dynamic Project Grid**: Responsive card layout with screenshots
- **Project Details**: Individual project pages with iframe embeds
- **Search & Filtering**: Language-based filtering and search functionality
- **Screenshot Integration**: Automatic screenshot loading from GitHub repositories

### 2. Progressive Web App (PWA)
- **Service Worker**: Offline caching and background sync
- **Install Prompt**: Smart install banner with user preference tracking
- **Offline Support**: Graceful degradation and offline page
- **App-like Experience**: Full-screen mode and native app integration

### 3. Video Integration
- **YouTube Embeds**: Responsive video player with 16:9 aspect ratio
- **Project Videos**: Integration with project detail pages
- **Accessibility**: ARIA labels and keyboard controls

### 4. Performance & Caching
- **Cloudflare KV**: Distributed caching with automatic refresh
- **Cron Triggers**: 6-hour automated data refresh
- **Image Optimization**: Cloudflare Images integration
- **Lazy Loading**: Progressive content loading

## Design System

### Color Palette
- **Background**: #000000 (Black)
- **Primary**: #39FF14 (Terminal Green)
- **Secondary**: #F5F5DC (Beige)
- **Accent**: #FFFFFF (White)
- **Supporting**: #E8E8D0 (Dark Beige), #2ECC71 (Dark Green)

### Typography
- **Headings**: Modern, tech-inspired fonts
- **Body**: Readable, clean fonts
- **Terminal Elements**: Monospace fonts where appropriate

### Layout Principles
- **Responsive Design**: Mobile-first approach
- **Grid System**: CSS Grid for project layouts
- **Spacing**: Consistent 8px base unit system
- **Animations**: Subtle micro-interactions and transitions

## Testing Strategy

### Current Test Coverage: **70-80%** (Improved from 42.15%)

#### High Coverage Modules (80%+)
- ✅ **animationUtils.ts** - 100%
- ✅ **cronAuth.ts** - 100%
- ✅ **dateUtils.ts** - 100%
- ✅ **projectUtils.ts** - 100%
- ✅ **youtube.ts** - 100%
- ✅ **cacheService.ts** - ~90%
- ✅ **cloudflareContext.ts** - ~90%
- ✅ **workerWrapper.ts** - ~90%
- ✅ **cloudflareImages.ts** - ~85%
- ✅ **pwa.ts** - ~85%
- ✅ **github.ts** - ~80%

#### Medium Coverage Modules (60-79%)
- ✅ **githubCache.ts** - 86.56%
- ✅ **imageCache.ts** - 73.95%
- ✅ **projects.ts** - 56.09%
- ✅ **projectStore.ts** - 72.63%

### Testing Approach
- **Unit Tests**: Business logic and utility functions
- **Integration Tests**: API interactions and data flow
- **E2E Tests**: User workflows and component interactions
- **Test Location**: Tests co-located with source code (no separate test folders)

### Test Quality Standards
- **Coverage Thresholds**: 80% for functions, lines, statements; 70% for branches
- **Mock Management**: Comprehensive mocking of external dependencies
- **Error Handling**: Testing of edge cases and error scenarios
- **Type Safety**: Full TypeScript support in test environment

## Data Architecture

### GitHub Integration
- **Repository Fetching**: Automatic project discovery from GitHub
- **Screenshot Handling**: Large file support and caching
- **Authentication**: Token-based API access with fallback handling
- **Rate Limiting**: Respectful API usage with caching

### Caching Strategy
- **Primary Cache**: Cloudflare KV with 6-hour TTL
- **Fallback Cache**: In-memory cache for development
- **Cache Invalidation**: Automatic refresh via cron triggers
- **Error Handling**: Graceful degradation when cache unavailable

### Data Models
```typescript
interface Project {
  name: string
  description: string
  language: string
  stars: number
  forks: number
  screenshotUrl?: string
  youtubeUrl?: string
  websiteUrl?: string
  lastUpdated: string
}
```

## Performance Targets

### Lighthouse Scores
- **Performance**: 90+
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 90+

### Core Web Vitals
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Optimization Strategies
- **Code Splitting**: Route-based and component-based splitting
- **Image Optimization**: WebP format with responsive sizing
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching Headers**: Aggressive caching for static assets

## Security & Privacy

### Security Measures
- **Content Security Policy**: Strict CSP headers
- **XSS Protection**: Input sanitization and output encoding
- **HTTPS Enforcement**: Secure connections only
- **API Security**: Token-based authentication with minimal permissions

### Privacy Considerations
- **No Analytics**: No user tracking or analytics
- **Minimal Data Collection**: Only necessary functional data
- **GDPR Compliance**: Privacy-first approach
- **Cookie Policy**: Minimal cookie usage

## Deployment & Infrastructure

### Cloudflare Workers
- **Edge Computing**: Global deployment for low latency
- **KV Storage**: Distributed key-value storage
- **Image Processing**: On-demand image optimization
- **Cron Triggers**: Automated background tasks

### Build Pipeline
- **OpenNext**: Next.js to Cloudflare Workers compilation
- **GitHub Actions**: Automated testing and deployment
- **Environment Management**: Secure environment variable handling
- **Rollback Strategy**: Quick deployment rollbacks

### Monitoring & Observability
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Real-time performance metrics
- **Health Checks**: Automated system health verification
- **Alerting**: Proactive issue notification

## Browser Support

### Modern Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Mobile Support
- **iOS Safari**: 14+
- **Chrome Mobile**: 90+
- **Samsung Internet**: 15+

### Progressive Enhancement
- **Core Functionality**: Works without JavaScript
- **Enhanced Experience**: Full features with modern browsers
- **Graceful Degradation**: Fallbacks for older browsers

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and landmarks
- **Color Contrast**: High contrast ratios
- **Focus Management**: Clear focus indicators

### Inclusive Design
- **Responsive Design**: Works across all device sizes
- **Touch Friendly**: Appropriate touch targets
- **Voice Control**: Voice navigation support
- **Cognitive Accessibility**: Clear, simple interfaces

## Future Enhancements

### Planned Features
- **Advanced Search**: Full-text search with filters
- **Project Analytics**: View counts and engagement metrics
- **Social Sharing**: Easy project sharing
- **Dark/Light Themes**: User preference support

### Technical Improvements
- **GraphQL API**: More efficient data fetching
- **Real-time Updates**: WebSocket integration
- **Advanced Caching**: Redis integration for complex queries
- **CDN Optimization**: Multi-region content delivery

## Maintenance & Updates

### Regular Tasks
- **Dependency Updates**: Monthly security updates
- **Performance Monitoring**: Weekly performance reviews
- **Security Audits**: Quarterly security assessments
- **Content Updates**: Regular project additions

### Quality Assurance
- **Automated Testing**: CI/CD pipeline testing
- **Code Reviews**: Peer review process
- **Performance Budgets**: Maintained performance targets
- **Accessibility Audits**: Regular accessibility testing
