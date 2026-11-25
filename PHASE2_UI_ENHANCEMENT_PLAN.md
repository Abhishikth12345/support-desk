# Support Desk: Phase 2 UI & Core Functionality Implementation Plan

**Focus Areas:** UI/UX Redesign, Dark/Light Theme System, SaaS Landing Page, Authentication Upgrades (Forgot Password), Sidebar Layout, Enhanced Dashboard (Search, Multi-Filter, Pagination, Stats), and Role-Specific Operations.

---

## 1. Executive Summary & Design System

To turn Support Desk into a modern, polished SaaS product, we will implement a cohesive design system using **Tailwind CSS dark mode** (`class` strategy), responsive component architecture, and server-driven filtering & pagination.

### Key Goals:
1. **Dark/Light Mode**: Smooth theme toggling with `localStorage` persistence and system-preference detection without layout flash.
2. **SaaS Landing Page**: Complete marketing front-page with Hero, Live Interactive Preview, Feature Grid, Workflow Steps, and Footer.
3. **Authentication Upgrades**:
   * Redesigned Login & Register with password visibility toggle, input validation, and modern card styling.
   * Complete Forgot & Reset Password workflow with backend token verification.
4. **Dashboard with Responsive Sidebar**:
   * Desktop sticky sidebar + mobile sliding drawer.
   * Navigation links: Overview, Tickets, New Ticket, and Profile/Settings.
   * Theme switcher & quick logout.
5. **Data Exploration Engine**:
   * Live search bar (by ticket number, title, or customer email).
   * Multi-facet filters (Status, Priority, Category).
   * Server-side pagination (`page`, `limit`, page selector).
   * Summary metric cards with gradient accents.
6. **Role-Specific Actions**:
   * Dynamic agent assignment dropdown for Admins/Managers.
   * Status progression shortcuts (`Open` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Closed`).

---

## 2. Architecture & File Plan

```text
support-desk/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts        # [UPDATE] Add forgotPassword & resetPassword handlers
│   │   │   ├── ticket.controller.ts      # [UPDATE] Add server pagination, search query, agent listing
│   │   │   └── user.controller.ts        # [NEW] /api/users/agents endpoint for assignment dropdown
│   │   ├── models/
│   │   │   └── User.ts                   # [UPDATE] Add resetPasswordToken & resetPasswordExpires
│   │   └── routes/
│   │       ├── auth.route.ts             # [UPDATE] /forgot-password & /reset-password
│   │       └── ticket.routes.ts          # [UPDATE] Enhanced query parsing
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                # [UPDATE] Theme script injector & Root layout
│   │   │   ├── page.tsx                  # [REWRITE] Full SaaS Landing Page
│   │   │   ├── globals.css               # [UPDATE] Dark mode CSS variables & styling
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx        # [REWRITE] Polished login with password visibility
│   │   │   │   ├── register/page.tsx     # [REWRITE] Polished registration with strength check
│   │   │   │   ├── forgot-password/page.tsx # [NEW] Password reset request
│   │   │   │   └── reset-password/page.tsx  # [NEW] Password reset confirmation
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx            # [NEW] Sidebar + Navbar responsive shell
│   │   │       ├── page.tsx              # [REWRITE] Stats widgets, search, filters & paginated table
│   │   │       └── tickets/
│   │   │           ├── new/page.tsx      # [UPDATE] Polished dark/light form
│   │   │           └── [id]/page.tsx     # [UPDATE] Polished ticket detail with agent assignment
│   │   ├── components/
│   │   │   ├── Sidebar.tsx               # [NEW] Responsive collapsible sidebar
│   │   │   ├── ThemeToggle.tsx           # [NEW] Light/Dark theme toggle button
│   │   │   ├── Pagination.tsx            # [NEW] Reusable pagination bar
│   │   │   └── StatsCard.tsx             # [NEW] Visual metric card with icons & trends
│   │   └── lib/
│   │       ├── theme.ts                  # [NEW] Theme listener & state manager
│   │       └── api.ts                    # [UPDATE] Updated with pagination & search params
│   └── tailwind.config.ts                # [UPDATE] darkMode: "class"
```

---

## 3. Detailed Component & Feature Specifications

### 3.1 Dark / Light Theme System
* Configure Tailwind `darkMode: "class"`.
* Create `src/lib/theme.ts`:
  * Detects user's system preference (`prefers-color-scheme: dark`) on initial load.
  * Checks `localStorage.getItem("theme")`.
  * Adds or removes `.dark` class on `document.documentElement`.
* Create `src/components/ThemeToggle.tsx`:
  * Seamless icon toggle (Sun / Moon) integrated into the top bar and sidebar.

### 3.2 SaaS Landing Page (`frontend/src/app/page.tsx`)
A high-converting, modern landing page matching modern SaaS standards (Linear / Stripe style):
* **Top Navigation**: Logo, Features link, Workflow link, Theme Toggle, Login & Register buttons.
* **Hero Section**:
  * Eyebrow pill: `"SupportDesk 2.0 • Real-time Issue Resolution"`.
  * Bold headline + value proposition subtitle.
  * Primary CTA `"Get Started Free"` + Secondary CTA `"Live Demo / Sign In"`.
  * Interactive Ticket Preview card showing a sample live ticket status workflow.
* **Feature Grid (4 Cards)**:
  1. *Collision-Free Numbering*: Sequential IDs (`SD-2026-00001`) with atomic counters.
  2. *Role-Based Security*: Strict segregation between Customers, Agents, and Administrators.
  3. *State Lifecycle Engine*: Instant transitions (`Open` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Closed`).
  4. *Multi-Facet Search & Filter*: Real-time lookup by priority, category, and keyword.
* **Social Proof / Metrics Banner**: 99.9% uptime, zero mock data, sub-second response times.
* **Footer**: Copyright, quick navigation, and technical links.

### 3.3 Enhanced Authentication Flow
* **Login (`/login`)**:
  * Modern centered glass card with dark/light background.
  * Password visibility toggle (eye icon).
  * Link to `/forgot-password`.
  * Helpful validation feedback.
* **Register (`/register`)**:
  * Real-time password length and validation indicator.
  * One-click account creation and automatic login session initiation.
* **Forgot Password (`/forgot-password`) & Reset Password (`/reset-password`)**:
  * Backend generates secure random crypto reset token with 1-hour expiry.
  * Endpoint `POST /api/auth/forgot-password` verifies email and returns the reset link token.
  * Endpoint `POST /api/auth/reset-password` hashes new password via bcrypt and clears reset tokens.

### 3.4 Dashboard & Sidebar Navigation (`/dashboard/layout.tsx`)
* **Responsive Sidebar (`Sidebar.tsx`)**:
  * Collapsible on mobile via animated hamburger menu; fixed on desktop (64px / 256px).
  * Navigation links with active route highlighting:
    * 📊 **Dashboard / Overview**: Metrics and ticket registry.
    * 🎫 **My Tickets** (for Customer) / **All Tickets** (for Staff).
    * ➕ **Create Ticket**: Direct action.
  * Bottom section: Current user profile avatar, role badge (`Admin`, `Agent`, `Customer`), Theme Toggle, and Sign Out.
* **Top Navbar (`Navbar.tsx`)**:
  * Quick search shortcut, theme toggle, and mobile menu trigger.

### 3.5 Data Exploration: Stats, Search, Filters & Pagination
* **Stats Widget Grid**:
  * Total Tickets, Open Tickets, In-Progress, Resolved.
  * Colored accent badges and indicators.
* **Filter Toolbar**:
  * Real-time search input with debounce (searches title, ticket number, customer name/email).
  * Status filter pills / select: `All`, `Open`, `In Progress`, `Pending`, `Resolved`, `Closed`.
  * Priority filter select: `All`, `Low`, `Medium`, `High`, `Urgent`.
  * Category filter select: `All`, `Technical`, `Billing`, `Account`, `General`, `Other`.
* **Server-Side Pagination**:
  * Query parameters: `?page=1&limit=10`.
  * Controls: Previous, Next, Page Numbers, and showing range (`Showing 1 to 10 of 48 tickets`).

### 3.6 Role-Based Ticket Detail Operations (`/dashboard/tickets/[id]`)
* **Agent Assignment Dropdown**:
  * Admins & Managers can assign or reassign any ticket to any registered agent.
* **Status Action Bar**:
  * Interactive transition buttons for agents to update statuses with one click.
  * Live status pill updating instantly in both light and dark modes.

---

## 4. Phased Execution Steps

1. **Step 1: Backend API Upgrades**
   * Add `resetPasswordToken` and `resetPasswordExpires` to `backend/src/models/User.ts`.
   * Implement `forgotPassword` and `resetPassword` in `auth.controller.ts` and routes.
   * Update `ticket.controller.ts` to support server-side `page`, `limit`, and regex `search`.
   * Add `GET /api/admin/agents` to return list of agents for assignment dropdowns.
   * Verify backend compilation (`npm --prefix backend run build`).

2. **Step 2: Dark/Light Mode Foundation**
   * Configure `darkMode: "class"` in `tailwind.config.ts`.
   * Implement `src/lib/theme.ts` and `src/components/ThemeToggle.tsx`.

3. **Step 3: SaaS Landing Page & Auth Screens**
   * Rewrite `frontend/src/app/page.tsx` with modern SaaS layout.
   * Upgrade `/login` and `/register` pages with dark mode, password toggle, and error states.
   * Build `/forgot-password` and `/reset-password` pages.

4. **Step 4: Responsive Sidebar & Dashboard Overhaul**
   * Implement `frontend/src/app/dashboard/layout.tsx` and `Sidebar.tsx`.
   * Rewrite `frontend/src/app/dashboard/page.tsx` with search, multi-filters, pagination, and stats cards.
   * Upgrade `/dashboard/tickets/new` and `/dashboard/tickets/[id]` with role actions.

5. **Step 5: End-to-End Build & Auto-Deploy Verification**
   * Test both builds (`npm run build` in backend and frontend).
   * Commit and push to `main` $\rightarrow$ Render & Vercel will automatically deploy the upgrades live!
