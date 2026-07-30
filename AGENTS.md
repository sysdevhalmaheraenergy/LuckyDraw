<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project: LuckyDraw

Digital lucky draw / raffle application built with Next.js 16, Prisma, and PostgreSQL.

### Tech Stack
- **Framework:** Next.js 16 (App Router, Server Actions)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js (Credentials provider + bcrypt)
- **Storage:** Firebase Admin (image uploads for prizes)
- **UI:** Tailwind CSS v4, Framer Motion
- **Validation:** Zod (with OpenAPI generation)
- **Deployment:** Docker + docker-compose, Jenkins CI/CD

### Project Structure
```
src/
  app/                 # Next.js App Router (pages, layouts, route handlers)
    (api|api-docs)/    # API routes and Swagger docs
    (auth)/            # Login, register
    (dashboard)/       # Event management, prize management, draw results
    (events)/          # Event CRUD
    (coupons)/         # Coupon management
    (uploads)/         # Image upload endpoints
  components/          # Shared React components
  hooks/               # Custom React hooks
  lib/                 # Utilities (auth, prisma, schemas, firebase-admin)
  types/               # TypeScript type definitions
  generated/           # Prisma client, OpenAPI types
prisma/                # Prisma schema and migrations
```

### Key Conventions
- Use `src/lib/prisma.ts` for database access
- API routes use Zod schemas from `src/lib/schemas.ts` for validation
- Auth is handled via NextAuth.js with JWT sessions
- Images are uploaded to Firebase Storage via presigned URLs
- All API responses are typed via Zod schemas with OpenAPI annotations

### Build & Run
```bash
npm install
npm run dev          # localhost:3000
npm run build        # production build
npm run typecheck    # TypeScript validation
npm run lint         # ESLint
```

### Deployment
- Jenkinsfile defines CI/CD pipeline for dev/uat/main branches
- Docker multi-stage build (deps → builder → runner)
- docker-compose.yml for local/production container orchestration
- See DEPLOYMENT.md for full deployment guide
