# EcoPoints Waste Management Platform

## Overview

EcoPoints is a video-based waste management platform that incentivizes proper waste disposal through a points-reward system. The platform serves three primary user roles: tourists who submit videos of waste disposal for points, moderators who review submissions, and city council members who monitor analytics and budget data. The system combines automated verification with human moderation to ensure legitimate submissions while providing comprehensive fraud detection tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses React with TypeScript, built with Vite for development and production bundling. The UI is built with shadcn/ui components providing a consistent design system based on Radix UI primitives and Tailwind CSS for styling. The application uses Wouter for client-side routing and TanStack Query for server state management. The architecture supports role-based navigation and authentication state management through custom hooks.

### Backend Architecture
The server is built with Express.js and TypeScript, following a RESTful API design. Authentication is handled through Replit's OpenID Connect (OIDC) system with Passport.js strategies. The application uses session-based authentication with PostgreSQL session storage. File uploads are managed with Multer middleware, storing videos locally with configurable size and type restrictions. The server implements role-based access control through middleware that checks user permissions against database records.

### Database Design
The system uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema includes user management (users, user_wallets), content management (video_submissions, submission_events), financial operations (cashout_requests, payout_transactions), and administrative features (bin_locations, reports_cache, sessions). The database supports user roles (tourist, moderator, council) and tracks submission statuses through an approval workflow (queued → auto_verified → needs_review → approved/rejected).

### Data Storage Solutions
Videos are stored in a local uploads directory with plans for S3 integration based on the processing pipeline described in the MVP documentation. The system uses Neon Database as the PostgreSQL provider with connection pooling. Session data is persisted in PostgreSQL using connect-pg-simple for reliable authentication state management.

### Authentication and Authorization
Authentication leverages Replit's OIDC system, allowing users to sign in with their Replit accounts. The system maintains user sessions in PostgreSQL and implements role-based access control at both the route level and UI level. Users are automatically assigned the 'tourist' role upon first login, with manual role assignment for moderators and council members.

### Processing Pipeline Architecture
The codebase references a worker queue system (BullMQ/RabbitMQ) for video processing tasks including upload ingestion, FFmpeg transcoding, thumbnail generation, perceptual hash generation for duplicate detection, GPS validation, and ML-based content verification. The current implementation provides the foundation for this processing pipeline with submission status tracking and automated verification placeholders.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting with connection pooling via @neondatabase/serverless
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL operations with migration support

### Authentication Services
- **Replit OIDC**: OpenID Connect authentication provider integrated with Passport.js for user authentication
- **Passport.js**: Authentication middleware supporting the Replit OIDC strategy

### UI and Styling
- **Radix UI**: Headless UI component library providing accessible primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework for styling with custom design tokens
- **shadcn/ui**: Pre-built component library combining Radix UI with Tailwind CSS styling

### Development Tools
- **Vite**: Frontend build tool and development server with HMR support
- **TypeScript**: Type safety across the entire application stack
- **TanStack Query**: Server state management with caching, synchronization, and error handling

### File Processing
- **Multer**: Multipart form data handling for video file uploads
- **Local File System**: Current storage solution for uploaded videos with configurable upload directory

### Future Integrations
- **AWS S3**: Planned object storage for videos and thumbnails
- **FFmpeg**: Video processing for transcoding and thumbnail generation
- **Worker Queue System**: BullMQ or RabbitMQ for background job processing
- **ML Services**: Automated content verification and fraud detection
- **Payment Gateways**: Payout processing for user rewards