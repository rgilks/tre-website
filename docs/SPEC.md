# Project Specification

## Overview

Total Reality Engineering (TRE) is a personal contracting business showcasing innovative software engineering projects. The website demonstrates technical excellence through a portfolio of cutting-edge projects built with modern web technologies.

## Architecture

### Core Principles

- **Elegance and Simplicity**: Clean, maintainable code with minimal complexity and direct implementations
- **Type Safety**: Strong TypeScript typing throughout the codebase
- **Performance**: Efficient data fetching and caching strategies
- **Maintainability**: Well-organized, testable code structure with focused responsibilities

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with Immer for immutable updates
- **Testing**: Vitest for unit tests, Playwright for E2E tests with automated CI/CD
- **Deployment**: Open-Next for Cloudflare Workers
- **Animation**: Framer Motion for smooth interactions

### Cloudflare Workers Configuration

#### KV Binding Management

The application uses Cloudflare KV for caching GitHub data and project screenshots. A custom `worker.js` file ensures proper exposure of KV bindings to Next.js functions:

- **Custom Worker**: `worker.js` exposes `env.GITHUB_CACHE` to `globalThis.GITHUB_CACHE`
- **Environment Access**: Next.js functions access KV bindings through the global scope
- **Fallback Handling**: Graceful degradation to in-memory caching when KV is unavailable

#### Cron Job System

Automated data refresh via Cloudflare Workers cron triggers:

- **Schedule**: Every 6 hours (0, 6, 12, 18 UTC)
- **Endpoint**: `/api/cron` with Bearer token authentication
- **Function**: `refreshProjects()` clears cache and fetches fresh data
- **Error Handling**: Comprehensive error handling with fallback strategies

## Project Structure

### Core Modules

#### 1. Domain Types (`src/types/`)

- **`project.ts`**: Consolidated project interfaces including `Project`, `GitHubApiResponse`, and `ProjectFilters`
- **Single source of truth** for all project-related data structures
- **Eliminated redundant interfaces** for better maintainability

#### 2. Data Layer (`src/lib/`)

- **`github.ts`**: GitHub API integration with simplified, focused functions
- **`projects.ts`**: High-level project management with caching and error handling
- **`cacheService.ts`**: Flexible caching layer supporting both Cloudflare KV and fallback storage
- **`imageCache.ts`**: Image caching and optimization services

#### 3. State Management (`src/store/`)

- **`projectStore.ts`**: Centralized project state with consolidated filtering logic
- **Integrated filtering and sorting** in single `applyFilters` function
- **Immer integration** for immutable state updates
- **Simplified state management** with reduced complexity

#### 4. UI Components (`src/components/`)

- **`ProjectCard.tsx`**: Simplified project display with direct styling and inline logic
- **`ProjectGrid.tsx`**: Streamlined grid layout with simplified state handling
- **`HeroSection.tsx`**: Engaging hero section with focused animation utilities
- **Component interfaces** defined locally where possible to reduce coupling

#### 5. Utilities (`src/lib/`)

- **`projectUtils.ts`**: Focused utility functions for essential project operations
- **`animationUtils.ts`**: Streamlined animation configurations for hero section
- **`dateUtils.ts`**: Date formatting utilities

## Key Features

### 1. Project Portfolio

- **GitHub Integration**: Automatic project fetching from GitHub repositories
- **Smart Caching**: Multi-layer caching for performance and reliability
- **Screenshot Support**: Automatic project screenshot discovery and caching
- **Topic Tagging**: Project categorization with visual topic display

### 2. Performance Optimizations

- **Server-Side Rendering**: Initial project data fetched server-side
- **Image Optimization**: Cloudflare Images integration for fast image delivery
- **Progressive Enhancement**: Graceful degradation when services are unavailable

### 3. User Experience

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Mobile Optimizations**: iPhone-specific viewport handling and status bar styling
- **Logo Scaling**: Responsive SVG logo that scales appropriately on all devices
- **Smooth Animations**: Framer Motion for engaging interactions
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **PWA Support**: Progressive Web App capabilities with app shortcuts

### 4. Branding and Assets

- **SVG Favicon**: Modern, scalable favicon with black background and TRE branding
- **Progressive Enhancement**: SVG favicon for modern browsers with ICO fallback for legacy support
- **Theme Consistency**: Unified color scheme (#19C15E) across favicon, manifest, and UI elements
- **App Shortcuts**: Quick navigation to Projects, About, and Contact sections from PWA menu

## Data Flow

### 1. Project Fetching

```
GitHub API → Cache Service → Image Cache → UI Components
     ↓              ↓           ↓           ↓
  Raw Data → Cached Data → Screenshots → Display
```

### 2. State Management

```
Server Data → Zustand Store → Filtered Data → Components
     ↓            ↓              ↓            ↓
  Initial → Global State → Filtered State → Rendered
```

### 3. Caching Strategy

```
Primary Cache (Cloudflare KV) → Fallback Cache → Direct Fetch
      ↓              ↓              ↓
   Fast Access → Reliable Access → Fresh Data
```

## Code Quality Standards

### 1. TypeScript

- **Strict Mode**: Enabled for maximum type safety
- **Interface-First**: Prefer interfaces over types for object shapes
- **No Any Types**: Use proper typing or `unknown` when necessary
- **Local Interfaces**: Define component interfaces locally when possible

### 2. Testing

- **Unit Tests**: Vitest for business logic testing
- **Coverage Target**: 85% minimum coverage (currently achieved)
- **Test Location**: Tests co-located with source code
- **Mock Strategy**: Comprehensive mocking for external dependencies

### 3. Code Organization

- **Single Responsibility**: Each function/module has one clear purpose
- **Dependency Injection**: Services accept dependencies as parameters
- **Error Handling**: Consistent error handling patterns throughout
- **Documentation**: Clear JSDoc comments for public APIs
- **Eliminated Abstractions**: Removed unnecessary utility functions and abstractions

## Performance Considerations

### 1. Data Fetching

- **Caching**: Multi-layer caching strategy for GitHub data
- **Rate Limiting**: Respectful GitHub API usage
- **Error Recovery**: Graceful fallbacks when services fail

### 2. Image Optimization

- **Lazy Loading**: Screenshots loaded on demand
- **CDN Integration**: Cloudflare Images for global distribution
- **Format Optimization**: Automatic format selection for best performance

### 3. Bundle Optimization

- **Tree Shaking**: Unused code eliminated from production builds
- **Code Splitting**: Automatic route-based code splitting
- **Asset Optimization**: Optimized images and fonts

## Security

### 1. API Security

- **Token Management**: Secure GitHub token handling
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Strict validation of all external data

### 2. Deployment Security

- **Environment Variables**: Secure configuration management
- **HTTPS Only**: All traffic encrypted in transit
- **CSP Headers**: Content Security Policy implementation

## Deployment

### 1. Cloudflare Workers

- **Edge Computing**: Global distribution for fast access
- **Open-Next**: Optimized Next.js deployment
- **Environment Management**: Secure configuration handling

### 2. Build Process

- **Type Checking**: TypeScript compilation validation
- **Linting**: ESLint for code quality enforcement
- **Testing**: Automated test execution before deployment

### 3. Testing Strategy

- **Unit Tests**: Vitest for component and utility function testing
- **E2E Tests**: Playwright for cross-browser user journey validation
- **CI/CD Integration**: Automated testing integrated with deployment pipeline
- **Fail-Fast Approach**: Build fails immediately if any tests fail, ensuring quality

## Recent Refactoring Achievements

### 1. Component Simplification

- **Eliminated prop drilling**: Removed unnecessary `projectId` props from child components
- **Direct styling**: Replaced utility function calls with inline styling logic
- **Reduced complexity**: Simplified component interfaces and implementations

### 2. State Management Streamlining

- **Consolidated filtering**: Combined filtering and sorting logic into single function
- **Removed abstractions**: Eliminated unnecessary utility functions and interfaces
- **Improved maintainability**: Cleaner, more focused state management code

### 3. Utility Function Optimization

- **Focused utilities**: Kept only essential utility functions that are actually used
- **Removed duplication**: Eliminated redundant code and interfaces
- **Better test coverage**: Improved test quality and coverage

## Future Enhancements

### 1. User Experience

- **Advanced Filtering**: Search and filter projects by various criteria
- **Project Analytics**: View project statistics and metrics
- **Interactive Demos**: Live project demonstrations

### 2. Performance

- **Incremental Static Regeneration**: Dynamic content updates
- **Service Worker**: Offline functionality and caching
- **GraphQL**: More efficient data fetching

### 3. Content Management

- **CMS Integration**: Easy content updates
- **Blog Section**: Technical articles and insights
- **Project Showcases**: Detailed project walkthroughs

## Maintenance

### 1. Regular Updates

- **Dependencies**: Monthly dependency updates
- **Security Patches**: Immediate security updates
- **Performance Monitoring**: Regular performance audits

### 2. Code Quality

- **Automated Testing**: CI/CD pipeline with test automation
- **Code Reviews**: Peer review process for all changes
- **Documentation**: Keeping documentation up to date

### 3. Monitoring

- **Error Tracking**: Monitor and resolve production errors
- **Performance Metrics**: Track Core Web Vitals
- **User Analytics**: Understand user behavior and needs
