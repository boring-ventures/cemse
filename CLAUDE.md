# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Start development server with Turbopack
pnpm dev

# Build production version
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Prisma commands
pnpm prisma generate        # Generate Prisma client
pnpm prisma db push         # Push schema changes to database
pnpm prisma studio          # Open Prisma Studio GUI
pnpm prisma db reset        # Reset database (careful!)
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Authentication**: Supabase Auth with role-based access control
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state
- **Type Safety**: TypeScript with strict mode enabled

### Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── (auth)/            # Authentication pages (sign-in, sign-up, reset-password)
│   ├── (dashboard)/       # Protected dashboard routes with role-specific views
│   │   ├── admin/         # Admin-only pages
│   │   ├── company/       # Company role pages
│   │   └── youth-content/ # Youth-specific content
│   └── api/               # API endpoints following RESTful patterns
├── components/            # React components organized by feature
│   ├── ui/               # Reusable shadcn/ui components
│   ├── auth/             # Authentication-related components
│   ├── dashboard/        # Dashboard components with role-specific variants
│   └── sidebar/          # Adaptive sidebar with role-based navigation
├── hooks/                # Custom React hooks for API calls and utilities
├── lib/                  # Utility functions and configurations
│   ├── supabase/         # Supabase client and utilities
│   └── validations/      # Zod schemas for form validation
├── services/             # Service layer for API communication
└── types/                # TypeScript type definitions
```

### Key Architectural Patterns

1. **Role-Based Access Control (RBAC)**
   - User roles: YOUTH, ADOLESCENTS, COMPANIES, MUNICIPAL_GOVERNMENTS, TRAINING_CENTERS, NGOS_AND_FOUNDATIONS, SUPERADMIN
   - Role-specific dashboards and navigation in `src/components/dashboard/role-specific/`
   - Role guards implemented via middleware and auth context

2. **API Structure**
   - RESTful endpoints in `src/app/api/`
   - Service layer pattern in `src/services/` for API communication
   - Custom hooks in `src/hooks/` that wrap service calls with TanStack Query

3. **Component Architecture**
   - Adaptive components that render differently based on user role
   - Form components use react-hook-form with Zod validation
   - UI components from shadcn/ui are customized in `src/components/ui/`

4. **Database Schema**
   - Prisma schema defines comprehensive models for users, profiles, courses, jobs, entrepreneurship
   - Extensive use of enums for type safety (UserRole, JobStatus, ApplicationStatus, etc.)
   - Relations between entities properly defined with foreign keys

5. **File Upload System**
   - Supabase Storage for file uploads (avatars, CVs, documents)
   - Upload endpoints in `src/app/api/files/`
   - Support for images, PDFs, and video content

6. **Authentication Flow**
   - Supabase Auth with magic links and password authentication
   - Auth context provider wraps the application
   - Protected routes use middleware for authentication checks

## Important Considerations

- Always use `pnpm` for package management
- Path alias `@/*` maps to `src/*` directory
- Environment variables are required for Supabase configuration
- Database migrations should use `pnpm prisma db push` in development
- The application supports multiple user roles with distinct functionality
- File uploads are handled through Supabase Storage with the "avatars" bucket