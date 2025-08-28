# EdgeMarket - Multi Trading Platform

## Overview

EdgeMarket is a full-stack multi-trading platform built with React and Express, designed for forex, cryptocurrency, and commodity trading. The application features real-time trading capabilities, user authentication, balance management, deposit/withdrawal functionality, and comprehensive admin controls. The platform supports both traditional spot trading and timed trading with predictive elements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Single Page Application (SPA) with React Router 6**
- Built with React 18 and TypeScript for type safety
- Uses React Router 6 in SPA mode for client-side routing
- Vite as the build tool for fast development and optimized production builds
- TailwindCSS 3 with shadcn/ui component library for consistent styling

**Component Structure**
- Pages directory contains route components (Welcome, Dashboard, Auth, etc.)
- Shared UI components using Radix UI primitives
- Context-based state management for authentication and trading data
- Custom hooks for mobile detection and toast notifications

**State Management**
- React Context API for global state (AuthContext, TradingContext, ThemeContext)
- Local storage for user session persistence and mock data
- TanStack Query for server state management
- Modular data stores for users, trading pairs, and transactions

**Theme System**
- Dark/light theme support with system preference detection
- Theme persistence in localStorage
- CSS variables for consistent theming across components

### Backend Architecture

**Express Server Integration**
- Express.js server integrated with Vite development server
- RESTful API structure with modular route handlers
- Middleware for CORS, JSON parsing, and static file serving
- Environment variable configuration with dotenv

**Development vs Production**
- Development: Express server runs as Vite middleware
- Production: Standalone Express server serving built SPA files
- Graceful shutdown handling with SIGTERM/SIGINT signals

### Authentication & Authorization

**Role-Based Access Control**
- Two user roles: 'admin' and 'user'
- Protected routes using custom ProtectedRoute component
- Mock authentication system with localStorage persistence
- Admin-only features for user management and transaction oversight

### Trading System

**Multi-Asset Trading Support**
- Forex pairs (EUR/USD, GBP/USD, USD/JPY, etc.)
- Cryptocurrency pairs (BTC/USD, ETH/USD)
- Commodity trading (Gold, Silver, Oil)
- Real-time price data with mock price history generation

**Trading Types**
- Spot trading with instant execution
- Timed trading with duration-based predictions (2-15 minutes)
- Balance conversion between total and trading balances
- P&L tracking with automatic trade resolution

### Financial Management

**Multi-Balance System**
- Total balance for deposits/withdrawals
- Trading balance for active trading
- Balance conversion functionality between accounts
- Transaction history with comprehensive filtering

**Deposit/Withdrawal System**
- Multi-cryptocurrency support (BTC, ETH, USDT, USDC)
- Mock wallet addresses for different crypto types
- Admin approval workflow for withdrawals
- Transaction status tracking (pending, approved, rejected)

### Data Architecture

**Type-Safe Schema Design**
- Shared TypeScript interfaces between client and server
- Database schema definitions for future Supabase integration
- Comprehensive transaction types and status enums
- User management with role-based permissions

**Mock Data Layer**
- In-memory data stores with localStorage persistence
- Real-time price simulation for trading pairs
- Transaction history with automatic updates
- User session management

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with concurrent features
- **React Router 6**: Client-side routing in SPA mode
- **TypeScript**: Type safety across the entire application
- **Vite**: Build tool and development server
- **Express**: Backend server framework

### UI and Styling
- **TailwindCSS 3**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library for consistent iconography

### State Management and Data
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation library
- **@hookform/resolvers**: Form validation resolvers

### Database and Backend (Planned)
- **Drizzle ORM**: Type-safe database ORM
- **PostgreSQL**: Primary database (via Supabase)
- **pg**: PostgreSQL client for Node.js
- **dotenv**: Environment variable management

### Authentication (Future Integration)
- **Supabase**: Backend-as-a-Service for authentication and database
- **OpenID Client**: OAuth and OpenID Connect implementation

### Development and Testing
- **Vitest**: Unit testing framework
- **PostCSS**: CSS processing with autoprefixer
- **Class Variance Authority**: Component variant management
- **clsx & tailwind-merge**: Conditional CSS class utilities

### Utilities and Performance
- **Memoizee**: Function memoization for performance
- **Sonner**: Toast notification system
- **Date utilities**: Date formatting and manipulation