# Total Reality Engineering Website

A modern, elegant portfolio website showcasing innovative software engineering projects. Built with Next.js 15, TypeScript, and Tailwind CSS, featuring a clean terminal-inspired design with smooth animations and progressive web app capabilities.

## ✨ Features

- **Project Portfolio**: Dynamic showcase of GitHub projects with automatic screenshot discovery
- **Modern Architecture**: Clean, maintainable code with strong TypeScript typing
- **Performance Optimized**: Multi-layer caching, image optimization, and server-side rendering
- **Responsive Design**: Mobile-first approach with beautiful animations
- **PWA Ready**: Progressive Web App with offline support
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

## 🏗️ Architecture

### Core Principles

- **Elegance and Simplicity**: Clean, maintainable code with minimal complexity
- **Type Safety**: Strong TypeScript typing throughout the codebase
- **Performance**: Efficient data fetching and caching strategies
- **Maintainability**: Well-organized, testable code structure

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom design system
- **State Management**: Zustand with Immer for immutable updates
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **Deployment**: Open-Next for Cloudflare Workers
- **Animation**: Framer Motion for smooth interactions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub personal access token (for project fetching)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/rgilks/tre-website.git
   cd tre-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure your GitHub token:

   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_USERNAME=your_github_username
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### Run Tests

```bash
# Run all tests with coverage
npm run check

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e
```

### Test Coverage

- **Current Coverage**: 86.34% (target: 80%) ✅
- **Test Strategy**: Unit tests for business logic, E2E tests for user workflows
- **Test Location**: Tests co-located with source code

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                # Business logic and utilities
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── test/               # Test utilities and fixtures
```

### Key Modules

- **`types/project.ts`**: Consolidated domain types and interfaces
- **`lib/github.ts`**: GitHub API integration with simplified functions
- **`store/projectStore.ts`**: Centralized state management with clean filtering
- **`components/ProjectCard.tsx`**: Simplified project display component
- **`lib/projectUtils.ts`**: Focused utility functions for project operations

## 🎨 Design System

### Color Palette

- **Background**: #000000 (Black)
- **Primary**: #39FF14 (Terminal Green)
- **Secondary**: #F5F5DC (Beige)
- **Accent**: #FFFFFF (White)

### Typography

- **Headings**: Modern, tech-inspired fonts
- **Body**: Readable, clean fonts
- **Terminal Elements**: Monospace fonts where appropriate

## 🚀 Deployment

### Cloudflare Workers

```bash
# Build for Cloudflare
npm run build:cf

# Deploy
npm run deploy:cf
```

### Environment Setup

- Configure Cloudflare Workers environment variables
- Set up Cloudflare KV for caching
- Configure Cloudflare Images for optimization

## 📚 Documentation

- **[SPEC.md](docs/SPEC.md)**: Detailed project specification and architecture
- **[TODO.md](docs/TODO.md)**: Current development status and roadmap
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)**: Deployment and infrastructure guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new functionality
- Maintain code coverage above 80%
- Follow the established code organization patterns
- Keep code simple and elegant

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Robert Gilks** - [LinkedIn](https://www.linkedin.com/in/rob-gilks-39bb03/) | [GitHub](https://github.com/rgilks)

Total Reality Engineering is a personal contracting business founded in Australia in 1998 and established in the UK in 2008.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
