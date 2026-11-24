# Support Desk: Implementation Plan (Production Deployment Tonight)

---

## 1. Executive Summary & Strategy

The project documentation provides a 15-phase curriculum for building an enterprise support desk.
Per your instructions for **deploying tonight** with **basic functional features**, we are adhering to the *lazy senior developer* principle (Ponytail rule): **build the minimum edge-case correct code that delivers real production utility without unnecessary abstractions or mock data**.

### Current Baseline vs. Tonight's Goal
* **Current Status in Repository (`D:\support-desk`)**:
  * **Phase 1 Backend**: Initialized (Node.js, Express 5, TypeScript, MongoDB, JWT auth, User model with roles: `admin`, `manager`, `agent`, `customer`).
  * **Missing for Live Use**:
    1. Ticket domain model & endpoints (Phase 5).
    2. Basic status lifecycle & assignment (Phase 6).
    3. Frontend (Next.js + Tailwind CSS).
    4. Render & Vercel deployment wiring.
* **Tonight's Scope (What will be live)**:
  * **Real User Authentication**: Customers register; Agents & Admins log in.
  * **Real Ticket Management**:
    * Customers create real tickets with Title, Description, Category, Priority.
    * Auto-generated human-readable ticket numbers (`SD-2026-00001`) via atomic MongoDB sequence counter.
    * Customers view their submitted tickets and status.
    * Support agents & admins view all incoming tickets, filter by status/priority, assign them, and transition statuses (`open` -> `in_progress` -> `resolved` -> `closed`).
  * **No Mock or Demo Data**: The application directly creates and manages real MongoDB records from the browser UI.
* **Deferred to Future Iterations**:
  * Socket.io real-time chat / WebSockets (Phase 12).
  * BullMQ / Redis background workers (Phase 11).
  * AWS S3 file upload attachments (Phase 7).
  * Automated E2E test suites (Phase 13).

---

## 2. Architecture & Repository Structure

To support separate deployments to **Render** (Node.js backend) and **Vercel** (Next.js frontend) cleanly:

```text
support-desk/
├── src/                          # Express.js 5 + TypeScript Backend (Existing)
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── admin.controller.ts
│   │   └── ticket.controller.ts  # [NEW] Ticket CRUD & status workflow
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── role.middleware.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Ticket.ts             # [NEW] Ticket schema & TypeScript types
│   │   └── Counter.ts            # [NEW] Atomic sequential ticket ID generator
│   ├── routes/
│   │   ├── auth.route.ts
│   │   ├── admin.routes.ts
│   │   └── ticket.routes.ts      # [NEW] /api/tickets endpoints
│   ├── app.ts                    # Updated with CORS & ticket router
│   └── server.ts
├── frontend/                     # [NEW] Next.js (App Router) + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Global layout & fonts
│   │   │   ├── page.tsx          # Landing / redirect to login or dashboard
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx      # Customer & Agent unified dashboard
│   │   │   │   └── tickets/
│   │   │   │       ├── new/page.tsx # Create ticket modal/page
│   │   │   │       └── [id]/page.tsx # Ticket detail & status management
│   │   ├── components/           # Reusable UI components (Navbar, Badge, Table)
│   │   └── lib/
│   │       ├── api.ts            # Typed fetch client with JWT interceptor
│   │       └── auth.ts           # Token storage & user context
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── package.json                  # Backend dependencies & build scripts
└── tsconfig.json                 # Backend TypeScript configuration
```

---

## 3. Backend Specification (Phase 5 & Phase 6 Core)

### 3.1 Data Models

#### A. `src/models/Counter.ts`
Guarantees collision-free sequential ticket numbering under concurrent requests without race conditions:
```typescript
interface ICounter {
  _id: string; // e.g., "ticket_2026"
  sequence: number;
}
```

#### B. `src/models/Ticket.ts`
Matches the specifications from Phase 5 & 6:
```typescript
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketCategory = "technical" | "billing" | "account" | "general" | "other";

export interface ITicket extends Document {
  ticketNumber: string;        // SD-2026-00001 (indexed, unique)
  title: string;               // 3-100 characters
  description: string;         // detailed customer explanation
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;        // default: "open"
  createdBy: mongoose.Types.ObjectId;  // ref: User
  assignedTo?: mongoose.Types.ObjectId | null; // ref: User
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 REST API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token + role |
| `GET` | `/api/auth/profile` | Authenticated | Get current authenticated user profile |
| `POST` | `/api/tickets` | Authenticated | Create a ticket (atomic ticket number generation) |
| `GET` | `/api/tickets` | Authenticated | List tickets (customer sees own; agent/admin sees all) |
| `GET` | `/api/tickets/:id` | Authenticated | Get ticket detail by ID (with permissions check) |
| `PATCH` | `/api/tickets/:id/status` | Agent / Admin | Update ticket lifecycle status |
| `PATCH` | `/api/tickets/:id/assign` | Agent / Admin | Assign ticket to an agent |
| `GET` | `/api/health` | Public | Service health & database connectivity check |

---

## 4. Frontend Specification (Next.js + Tailwind CSS)

### 4.1 Tech Stack
* **Framework**: Next.js (App Router)
* **Styling**: Tailwind CSS (fast, consistent utility styling)
* **Icons**: Inline standard SVG icons (zero external dependency bloat)
* **State & Networking**: Native `fetch` with localStorage JWT handling

### 4.2 Screens & User Flows

1. **Auth Pages (`/login`, `/register`)**:
   * Clean, responsive cards with instant validation.
   * Auto-stores token and user payload upon success.
   * Direct redirection to `/dashboard`.
2. **Dashboard (`/dashboard`)**:
   * **Role-Aware Header**: Shows user's name, role badge (`Customer`, `Agent`, `Admin`), and Logout button.
   * **Metrics Summary Cards** (For Agents/Admins): Open, In Progress, Resolved, Total count.
   * **Customer View**:
     * Quick "Create New Ticket" button.
     * "My Tickets" table with Ticket Number, Title, Category, Priority badge, Status badge, and Created Date.
   * **Agent / Admin View**:
     * Full ticket registry with filters (Status filter, Priority filter).
     * Action to open ticket detail or quickly update status.
3. **Ticket Detail & Management (`/dashboard/tickets/[id]`)**:
   * Displays full ticket description, customer info, timestamps, priority, and current status.
   * **Action Bar for Agents/Admins**:
     * Status transition dropdown / buttons (`Open` -> `In Progress` -> `Resolved` -> `Closed`).
     * Assign to self or available agents.

---

## 5. Deployment Guide: Render (Backend) & Vercel (Frontend)

### 5.1 Render Deployment (Backend)
1. **GitHub Repository**: Push repository to GitHub `Abhishikth12345/support-desk`.
2. **Create New Web Service on Render**:
   * **Root Directory**: `.` (leave empty or set to root)
   * **Runtime**: Node
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
3. **Render Environment Variables**:
   * `PORT`: `5000` (Render binds automatically, code uses `process.env.PORT`)
   * `MONGODB_URI`: `mongodb+srv://<username>:<password>@supportdesk.win0gcy.mongodb.net/supportdesk?retryWrites=true&w=majority`
   * `JWT_SECRET`: `<Secure random secret>`
   * `JWT_EXPIRES_IN`: `1d`
   * `NODE_ENV`: `production`
   * `CORS_ORIGIN`: `*` (or your Vercel URL once generated)

### 5.2 Vercel Deployment (Frontend)
1. **Import GitHub Project into Vercel**:
   * **Root Directory**: Select `frontend`
   * **Framework Preset**: `Next.js`
   * **Build Command**: `npm run build`
2. **Vercel Environment Variables**:
   * `NEXT_PUBLIC_API_URL`: `https://support-desk-api.onrender.com` (your deployed Render URL)

---

## 6. Execution Steps (Once Plan is Approved)

1. **Step 1: Install Backend Dependencies & Validate Compilation**
   * Run `npm install` for the backend.
   * Verify TypeScript compilation passes cleanly.
2. **Step 2: Implement Phase 5 & 6 Ticket Models, Controller, and Routes**
   * Add `Counter.ts` and `Ticket.ts` in `src/models/`.
   * Add `ticket.controller.ts` with create, list, detail, and status update methods.
   * Add `ticket.routes.ts` and mount in `src/app.ts`.
   * Configure CORS in `app.ts` so Vercel can communicate with the backend.
3. **Step 3: Scaffold & Build Frontend in `frontend/`**
   * Initialize Next.js project with Tailwind CSS.
   * Implement typed API client (`api.ts`).
   * Build Auth pages (`/login`, `/register`).
   * Build Customer Dashboard & Ticket Creation flow.
   * Build Agent/Admin Dashboard with ticket status controls.
   * Verify frontend build (`npm run build`).
4. **Step 4: End-to-End Verification Check**
   * Execute live API sanity test (Registration -> Login -> Create Ticket -> Update Status -> Query Ticket list).
5. **Step 5: Deployment Readiness & Hand-off**
   * Prepare `.env.production` guides for both Render and Vercel.
   * Provide exact click-by-click instructions for setting up Render and Vercel deployments.
