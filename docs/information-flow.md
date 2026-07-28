# Information Flow & Architecture

## 1. Authentication

### Overview
Authentication in LuckyDraw uses **NextAuth v5 (beta.32)** with the **Credentials provider** and **JWT (JSON Web Tokens)** for session management. Passwords are hashed using **bcryptjs**.

### Flow
1. User submits login form (`src/app/login/page.tsx`) with email and password.
2. Form data is sent to the API route `src/app/api/auth/[...nextauth]/route.ts`.
3. NextAuth Credentials handler validates credentials:
   - Fetches user by email from the database via `src/lib/prisma.ts`.
   - Compares password using `bcryptjs.compare()`.
4. On success, NextAuth creates a JWT token containing:
   - `userId`
   - `email`
   - `role` (from `Role` enum: `USER`, `ADMIN`)
5. JWT is signed with `NEXTAUTH_SECRET` and stored in an HTTP-only cookie.
6. On subsequent requests, the JWT is verified and the session is reconstructed.
7. `src/lib/auth.ts` provides `getServerSession()` for server-side session checks.
8. Client-side session access via `useSession()` from `next-auth/react`.

### Authorization
- Role-based access control using the `Role` enum.
- Admin-only routes (e.g., event/prize management) check `session.user.role === 'ADMIN'`.
- Protected pages redirect unauthenticated users to `/login`.

### Registration
1. User submits registration form (`src/app/register/page.tsx`).
2. Data is validated using Zod schema (`src/lib/validations/auth.ts`).
3. Password is hashed with `bcryptjs.hash(password, 10)`.
4. User is created in the database via Prisma.
5. User is redirected to the login page.

---

## 2. Event Management

### Overview
Events are the core entity in LuckyDraw. Each event has a status (`EventStatus`: `DRAFT`, `ONGOING`, `COMPLETED`, `CANCELLED`) and can have associated coupons, prizes, and draw results.

### Flow
#### Creation (Admin only)
1. Admin navigates to `/dashboard/events/new`.
2. Fills out the event creation form (`src/app/dashboard/events/new/page.tsx`).
3. Form data is validated using Zod schema (`src/lib/validations/event.ts`).
4. POST request to `src/app/api/events/route.ts`.
5. API handler creates the event in the database with status `DRAFT`.
6. Admin is redirected to the event detail page.

#### Status Management
- Events start as `DRAFT`.
- Admin can change status to `ONGOING` to begin accepting coupon entries.
- Admin can change status to `COMPLETED` after the draw is finished.
- Admin can change status to `CANCELLED` to cancel an event.

#### Listing
- GET `/api/events` returns all events (with optional filtering by status).
- Public event listing at `/events` shows only `ONGOING` and `COMPLETED` events.
- Admin dashboard shows all events with full status filtering.

---

## 3. Coupon Lifecycle

### Overview
Coupons represent entries into an event's draw. Each coupon has a status (`CouponStatus`: `ACTIVE`, `USED`, `EXPIRED`) and is linked to a user and an event.

### Flow
#### Generation
1. Admin generates coupons for an event via `src/app/api/events/[id]/coupons/route.ts`.
2. Coupons are created with a unique code (e.g., `LUCKYDRAW-XXXX-XXXX`).
3. Each coupon is assigned to a specific user (if targeted) or left unassigned for general distribution.

#### Distribution
- Coupons can be distributed via:
  - Direct assignment to users.
  - Public claim page (`/coupons/claim`) where users enter a code.
  - Bulk email/SMS (future enhancement).

#### Claiming
1. User navigates to `/coupons/claim`.
2. Enters coupon code.
3. POST to `src/app/api/coupons/claim/route.ts`.
4. API validates:
   - Coupon exists.
   - Coupon is `ACTIVE`.
   - Coupon belongs to the event (if specified).
   - User hasn't already claimed this coupon.
5. Coupon is assigned to the user.

#### Usage
1. During a draw, the admin selects coupons to draw from.
2. Selected coupons are marked as `USED`.
3. Used coupons cannot be claimed again.

#### Expiration
- Coupons have an optional `expiresAt` field.
- A cron job (future) or manual process marks expired coupons as `EXPIRED`.

---

## 4. Prize Management

### Overview
Prizes are awarded to winners of an event's draw. Each prize has a status (`PrizeStatus`: `AVAILABLE`, `AWARDED`, `REDEEMED`) and is linked to an event.

### Flow
#### Creation (Admin only)
1. Admin navigates to `/dashboard/events/[id]/prizes/new`.
2. Fills out the prize creation form.
3. Form data is validated using Zod schema (`src/lib/validations/prize.ts`).
4. POST to `src/app/api/events/[id]/prizes/route.ts`.
5. Prize is created in the database with status `AVAILABLE`.

#### Awarding
1. After the draw, the admin awards prizes to winners.
2. POST to `src/app/api/prizes/[id]/award/route.ts`.
3. Prize status changes to `AWARDED`.
4. A `DrawResult` record is created linking the user, event, prize, and coupon.

#### Redemption
1. Winner claims their prize through the dashboard.
2. POST to `src/app/api/prizes/[id]/redeem/route.ts`.
3. Prize status changes to `REDEEMED`.

---

## 5. Lucky Draw Execution

### Overview
The draw process randomly selects winning coupons from an event's pool of active coupons. Results are recorded in the `DrawResult` model with a `result` field (`DrawResultResultStatus`: `WINNER`, `LOSER`).

### Flow
#### Preparation
1. Admin ensures the event status is `ONGOING`.
2. Admin verifies sufficient coupons are available.
3. Admin navigates to `/dashboard/events/[id]/draw`.

#### Drawing
1. Admin specifies the number of winners and prizes.
2. POST to `src/app/api/events/[id]/draw/route.ts`.
3. API handler:
   - Fetches all `ACTIVE` coupons for the event.
   - Randomly selects N coupons using a secure random algorithm.
   - Creates `DrawResult` records for all drawn coupons (WINNER or LOSER).
   - Updates drawn coupons to `USED` status.
   - Awards prizes to winners.
4. Event status changes to `COMPLETED`.

#### Results
- Winners are notified (email/SMS - future enhancement).
- Results are viewable on the event detail page (`/events/[id]`).
- Winners can see their prizes in their dashboard.

---

## 6. OpenAPI Documentation

### Overview
The API is documented using **OpenAPI 3.1** with `@asteasolutions/zod-to-openapi` v9.1.0. Zod schemas are automatically converted to OpenAPI schemas.

### Structure
- **Schema definitions**: `src/lib/validations/*.ts` (Zod schemas)
- **OpenAPI generation**: `src/lib/openapi.ts` (builds the OpenAPI document)
- **API documentation page**: `src/app/api-docs/page.tsx` (Swagger UI)
- **Static assets**: `docs-assets/` (for Swagger UI rendering)

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/[...nextauth]` | NextAuth authentication |
| GET | `/api/events` | List all events |
| POST | `/api/events` | Create an event (admin) |
| GET | `/api/events/[id]` | Get event details |
| PUT | `/api/events/[id]` | Update event (admin) |
| DELETE | `/api/events/[id]` | Delete event (admin) |
| GET | `/api/events/[id]/coupons` | List event coupons |
| POST | `/api/events/[id]/coupons` | Generate coupons (admin) |
| POST | `/api/events/[id]/draw` | Execute draw (admin) |
| POST | `/api/coupons/claim` | Claim a coupon |
| GET | `/api/prizes` | List prizes |
| POST | `/api/prizes` | Create prize (admin) |
| POST | `/api/prizes/[id]/award` | Award prize (admin) |
| POST | `/api/prizes/[id]/redeem` | Redeem prize |

### Accessing Documentation
- Swagger UI: `/api-docs`
- Raw JSON: `/api-docs/json`

---

## 7. Database Relationship Diagram

### Models
```
User
├── id: String (PK, UUID)
├── email: String (unique)
├── password: String (hashed)
├── name: String?
├── role: Role (enum: USER, ADMIN)
├── createdAt: DateTime
└── updatedAt: DateTime

Event
├── id: String (PK, UUID)
├── name: String
├── description: String?
├── status: EventStatus (enum: DRAFT, ONGOING, COMPLETED, CANCELLED)
├── startDate: DateTime?
├── endDate: DateTime?
├── createdAt: DateTime
└── updatedAt: DateTime

Coupon
├── id: String (PK, UUID)
├── code: String (unique)
├── eventId: String (FK → Event)
├── userId: String? (FK → User)
├── status: CouponStatus (enum: ACTIVE, USED, EXPIRED)
├── expiresAt: DateTime?
├── createdAt: DateTime
└── updatedAt: DateTime

Prize
├── id: String (PK, UUID)
├── name: String
├── description: String?
├── eventId: String (FK → Event)
├── status: PrizeStatus (enum: AVAILABLE, AWARDED, REDEEMED)
├── quantity: Int
├── createdAt: DateTime
└── updatedAt: DateTime

DrawResult
├── id: String (PK, UUID)
├── eventId: String (FK → Event)
├── couponId: String (FK → Coupon)
├── userId: String (FK → User)
├── prizeId: String? (FK → Prize)
├── result: DrawResultResultStatus (enum: WINNER, LOSER)
├── createdAt: DateTime
└── updatedAt: DateTime
```

### Relationships
```
User ──< Coupon >── Event
User ──< DrawResult >── Event
Event ──< Coupon
Event ──< Prize
Event ──< DrawResult
Coupon ──< DrawResult
Prize ──< DrawResult
```

### Key Constraints
- `Coupon.code` is unique.
- `User.email` is unique.
- `DrawResult.couponId` is unique (each coupon can only be drawn once).
- Foreign key constraints enforce referential integrity.
- All timestamps default to `now()` and update on modification.
