# StudyAI - JEE & NEET Learning Platform

## Overview

StudyAI is an AI-powered learning platform aimed at students preparing for IIT-JEE and NEET. It provides comprehensive learning resources including chapter-wise NCERT content, video explanations, audio summaries, quizzes, and flashcards. The platform also features AI chat support for doubt resolution, covering Physics, Chemistry, Mathematics (JEE), and Biology (NEET) for Class 11 and 12 students. The project's ambition is to offer a complete, AI-driven study ecosystem for competitive exam preparation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend is built with React 18 and TypeScript, utilizing Wouter for routing and TanStack React Query for state management. Styling is handled with Tailwind CSS, supporting theming via CSS variables. UI components are sourced from shadcn/ui, built on Radix UI primitives. Vite is used as the build tool. The architecture is component-based, organizing code into pages, reusable components, UI primitives, and custom hooks.

### Backend
The backend uses Express.js 5 with TypeScript, operating as an HTTP server with HMR for development. It exposes RESTful API endpoints under the `/api/` prefix. Data storage is abstracted through an `IStorage` interface, with an in-memory implementation for development and Drizzle ORM for PostgreSQL in production.

### Data Model
The application manages subjects, chapters, and chapter-specific content, including quizzes, flashcards, and key highlights. Shared TypeScript types and Zod schemas in the `shared/` directory ensure consistency between frontend and backend.

### Core Features
- **Learning Content**: Chapter-wise NCERT content, video explanations, and audio summaries.
- **Assessments**: Level-based quizzes (Beginner, Medium, Tough) with a 70% passing threshold and a leaderboard system for tracking performance.
- **Revision Tools**: Interactive, NotebookLM-style flashcards.
- **AI Support**: AI-powered chat for doubt solving per chapter.
- **Progress Tracking**: Local storage for quiz progress and level unlocking.

### Build and Deployment
Development uses `tsx` and Vite's dev server. Production builds utilize a custom script with esbuild for the server and Vite for client assets, outputting to a `dist/` directory.

## External Dependencies

### Database
- PostgreSQL (via `DATABASE_URL`)
- Drizzle ORM
- `connect-pg-simple` (for session storage)

### UI/UX Libraries
- Radix UI (primitives)
- Embla Carousel
- cmdk
- react-day-picker
- recharts
- vaul

### Development Tools
- Replit-specific plugins (cartographer, dev-banner, runtime-error-modal)
- Vite
- TypeScript

### Validation
- Zod
- drizzle-zod
- @hookform/resolvers