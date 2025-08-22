# Overview

Chandravansh is a comprehensive wellness and personal development web application built with React, Express, and PostgreSQL. It's designed as a holistic life-tracking platform that combines mood tracking, habit management, fitness monitoring, daily quizzes, and gaming features. The app emphasizes user engagement through psychology-based design with attractive animations, patriotic color themes, and a personalized experience.

The application features a splash screen introduction, AI-generated guidance through avatars, comprehensive data tracking with visual analytics, and monetization features including donation options and premium features. It's built with modern web technologies and follows a full-stack architecture pattern.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client is built using React with TypeScript and follows a component-based architecture:

- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

The frontend is organized into distinct feature components (MoodTracker, HabitTracker, FitnessTracker, etc.) with a central navigation system and authentication flow.

## Backend Architecture

The server follows an Express.js REST API pattern:

- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store
- **API Structure**: RESTful endpoints organized by feature domains

The backend implements comprehensive CRUD operations for all major features (moods, habits, fitness, quizzes, games, feedback) with proper authentication middleware.

## Database Design

PostgreSQL database with Drizzle ORM featuring:

- **Users**: Profile management with Replit authentication integration
- **Feature Tables**: Dedicated tables for moods, habits, habit completions, fitness entries, quiz attempts, game history, and feedback
- **Relationships**: Proper foreign key relationships linking all data to users
- **Session Storage**: PostgreSQL-backed session management for authentication

The schema supports comprehensive tracking with timestamps, proper data types, and referential integrity.

## Authentication System

Replit-based authentication using OpenID Connect:

- **Provider**: Replit OAuth integration
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Authorization**: Route-level authentication middleware
- **User Management**: Automatic user creation and profile management

## State Management Pattern

Client-side state follows a server-state pattern:

- **Server State**: TanStack Query for API data fetching, caching, and synchronization
- **Local State**: React useState for component-level UI state
- **Authentication State**: Custom useAuth hook with React Query integration
- **Error Handling**: Centralized error handling with toast notifications

## Component Design System

UI components built on Radix UI primitives:

- **Design System**: shadcn/ui component library
- **Theming**: CSS custom properties with Tailwind CSS integration
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Accessibility**: Radix UI ensures ARIA compliance and keyboard navigation

The system uses a patriotic color scheme (saffron, white, green) with smooth animations and transitions for enhanced user engagement.

# External Dependencies

## Database Services

- **Neon Database**: PostgreSQL hosting with serverless architecture
- **Connection Pooling**: @neondatabase/serverless for optimized connections

## Authentication Services

- **Replit Auth**: OpenID Connect provider for user authentication
- **Session Storage**: connect-pg-simple for PostgreSQL session management

## UI and Design

- **Radix UI**: Comprehensive set of accessible UI components
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework
- **Google Fonts**: Inter font family for typography

## Development and Build Tools

- **Vite**: Fast build tool with React plugin support
- **TypeScript**: Static type checking across the entire stack
- **Drizzle Kit**: Database migration and schema management tools
- **ESBuild**: Server-side bundling for production deployments

## Replit Integration

- **Replit Development Tools**: Development banner and error overlay
- **Cartographer Plugin**: Development environment integration
- **Runtime Error Modal**: Enhanced error reporting during development

The application is optimized for deployment on Replit's infrastructure while maintaining compatibility with standard Node.js hosting environments.