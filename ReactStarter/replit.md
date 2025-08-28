# EdgeMarket Trading Platform

## Overview

EdgeMarket is a full-stack multi-trading platform built with React and Express, designed for forex, cryptocurrency, and commodity trading. The application has been successfully moved to the root directory and is configured to run on port 5000. The application provides real-time trading capabilities with both instant and timed trading modes, comprehensive user management, and a modern responsive interface. It features a complete authentication system, balance management, transaction history, and administrative controls for user oversight.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Single Page Application (SPA) with React Router 6**
- Built with React 18 and TypeScript for type safety
- Uses React Router 6 in SPA mode for client-side routing
- Vite as the build tool for fast development and optimized production builds
- TailwindCSS 3 for styling with shadcn/ui component library

**Component Structure**
- Pages directory contains route components (Welcome, Dashboard, Auth, etc.)
- Shared UI components using Radix UI primitives
- Context-based state management for authentication and trading data
- Custom hooks for mobile detection and toast notifications

**State Management**
- React Context API for global state (AuthContext, TradingContext)
- Mock data stores for users, trading pairs, and transactions
- Local storage for user session persistence
- TanStack Query for server state management

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
- Mock authentication system with predefined credentials
- Session persistence using localStorage

**User Management**
- Admin users can view all users and manage accounts
- User balance tracking (total balance vs trading balance)
- Balance conversion functionality between account types

### Trading System

**Multi-Asset Trading Platform**
- Support for forex pairs (EUR/USD, GBP/USD, USD/JPY)
- Cryptocurrency trading capabilities
- Real-time price charts using Recharts
- Price history simulation with realistic market movements

**Trading Modes**
- Instant trading: Immediate buy/sell execution
- Timed trading: Prediction-based trades with duration limits (2-15 minutes)
- Balance management with separate trading and total balances

### Data Models

**Core Entities**
- User: ID, email, role, balances, creation date
- TradingPair: Symbol, name, current price, 24h change, price history
- Transaction: Trade details, amounts, P&L, timestamps, status

**Transaction Types**
- Standard trades: Buy/sell with immediate execution
- Timed trades: Prediction trades with win/loss outcomes
- Balance conversions between account types

### UI/UX Design

**Design System**
- Consistent color scheme with CSS custom properties
- Dark/light mode support through CSS variables
- Responsive design with mobile-first approach
- Professional trading interface with charts and data tables

**Component Library**
- shadcn/ui components built on Radix UI primitives
- Lucide React icons for consistent iconography
- Form handling with React Hook Form and Zod validation
- Toast notifications using Sonner

### Build & Deployment

**Build Configuration**
- Separate Vite configs for client and server builds
- Client builds to `dist/spa` for static files
- Server builds to `dist/server` with Node.js targeting
- TypeScript compilation with path mapping support

**Deployment Strategy**
- Static SPA hosting with API routes
- Serverless function support (Netlify functions included)
- Production server serves SPA with API fallbacks

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and context
- **Express 5**: Backend web framework
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience

### UI & Styling
- **TailwindCSS 3**: Utility-first CSS framework
- **Radix UI**: Headless UI components (@radix-ui/*)
- **Lucide React**: Icon library
- **Recharts**: Chart library for trading visualizations

### State & Data Management
- **TanStack Query**: Server state management
- **React Router 6**: Client-side routing
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### Development Tools
- **Vitest**: Testing framework
- **SWC**: Fast TypeScript/JavaScript compiler
- **Prettier**: Code formatting
- **ESLint**: Code linting (implied)

### Utility Libraries
- **clsx & tailwind-merge**: Class name utilities
- **class-variance-authority**: Component variant handling
- **dotenv**: Environment variable management
- **sonner**: Toast notification system

### Potential Integrations
- **Database**: Currently using mock data, designed for easy migration to Supabase or PostgreSQL
- **Authentication**: Mock system ready for integration with Auth0, Supabase Auth, or similar
- **Payment Processing**: Structure in place for Stripe or similar payment providers
- **Real-time Data**: WebSocket-ready architecture for live market data feeds