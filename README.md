# Total Reality Engineering - Portfolio Website

A minimal, flashy portfolio showcasing innovative GitHub projects with a modern, terminal-inspired design.

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm start           # Start production server

# Building
npm run build       # Build for production
npm run build:cf    # Build for Cloudflare Workers

# Testing
npm test            # Run tests in watch mode
npm test -- --run   # Run tests once
npm run test:e2e    # Run Playwright e2e tests

# Code Quality
npm run lint        # Lint code
npm run type-check  # TypeScript type checking
npm run format      # Format code with Prettier
npm run check       # Run all checks (lint + type-check + format)

# Dependencies
npm run deps:update # Update all dependencies
npm run nuke        # Clean install (remove node_modules and reinstall)
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4 with custom animations
- **State Management:** Zustand with Immer
- **Testing:** Vitest for unit tests, Playwright for e2e
- **Deployment:** Cloudflare Workers with OpenNext
- **PWA:** Service worker with offline support
- **Video Integration:** YouTube iframe API with responsive design

## 🎨 Features

- **Animated TRE Logo** - Custom SVG with entrance animations and glow effects
- **Responsive Design** - Mobile-first approach with terminal-inspired aesthetics
- **Project Portfolio** - GitHub integration with screenshots and descriptions
- **Interactive Demos** - Click "Website" button to view projects in embedded iframes
- **YouTube Videos** - Embedded video support for project demonstrations
- **PWA Ready** - Installable with offline support
- **Performance Optimized** - Image optimization and lazy loading

## 🌐 Live Demo

Visit [tre.systems](https://tre.systems) to see the live portfolio.

## 📖 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - state management
- [Framer Motion](https://www.framer.com/motion/) - animation library

## 📝 License

This project is proprietary to Total Reality Engineering.
