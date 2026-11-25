# SupportDesk: Admin Role Management, Ticket Assignment & AI Chatbot Assistant Guide

## 1. Executive Summary

This document describes the architecture, API endpoints, frontend interfaces, and operational procedures implemented for **Admin Role Management**, **End-to-End Ticket Assignment Workflow**, and the **AI Chatbot Assistant**.

---

## 2. Architecture & RBAC System

```
                      ┌─────────────────────────────────────────┐
                      │              SupportDesk                │
                      └────────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│   Admin Role &   │             │ Ticket Assignment│             │   AI Assistant   │
│ User Management  │             │     Workflow     │             │     Chatbot      │
└────────┬─────────┘             └────────┬─────────┘             └────────┬─────────┘
         │                                │                                │
 ├── POST /admin/users            ├── Triage Filters               ├── POST /ai/chat
 ├── GET /admin/users             │   ("Assigned to Me",           ├── Floating widget
 ├── Role selector                │    "Unassigned")               ├── 1-click ticket draft
 │   (agent, manager, admin)      ├── Auto status transition       └── Context engine &
 └── Admin UI Table               └── Assignee visual badges           Gemini API support
```

### Role Hierarchy & Permissions

| Role | Permissions & Workspaces |
| :--- | :--- |
| **`admin`** | Full access. Can create subordinate accounts (`agent`, `manager`, `admin`, `customer`), modify user roles, assign tickets, update ticket statuses, and view all system tickets. Self-demotion is strictly protected. |
| **`manager`** | Team triage. Can assign tickets to agents, modify ticket statuses, and view all tickets across the workspace. |
| **`agent`** | Specialist queue. Can update statuses for tickets, view tickets assigned directly to them, and collaborate on resolutions. |
| **`customer`** | Self-service. Submits support tickets, views exclusively their own tickets, and tracks real-time progress. |

---

## 3. Implemented Backend Endpoints

### 3.1. Admin Role & User Management (`/api/admin`)

- **`POST /api/admin/users`**
  - **Auth:** Protected, `authorize("admin")`
  - **Body:** `{ name, email, password, role }`
  - **Features:** Validates 8+ char password, unique email normalization, bcrypt salt (factor 12).
- **`GET /api/admin/users`**
  - **Auth:** Protected, `authorize("admin")`
  - **Query:** `page`, `limit`, `role`, `search`
  - **Features:** Case-insensitive search on name/email, role filtering, pagination metadata.
- **`PATCH /api/admin/users/:id/role`**
  - **Auth:** Protected, `authorize("admin")`
  - **Body:** `{ role: "agent" | "manager" | "admin" | "customer" }`
  - **Features:** Guards against self-demotion to prevent admin lockout.

### 3.2. Ticket Assignment Enhancements (`/api/tickets`)

- **`PATCH /api/tickets/:id/assign`**
  - **Auth:** Protected, `authorize("admin", "manager")`
  - **Body:** `{ agentId: string | null }`
  - **Automation:** 
    - Assigning an agent transitions ticket from `open` &rarr; `in_progress` automatically.
    - Unassigning a ticket (`null`) transitions from `in_progress` &rarr; `open`.
- **`GET /api/tickets?assigned=me|unassigned`**
  - **Auth:** Protected
  - **Query:** Allows quick filtering by workload: `assigned=me` or `assigned=unassigned`.

### 3.4. Email Notification Service (`email.service.ts`)

- **Credentials Delivery:**
  - Automated dispatch on `POST /api/auth/register` and `POST /api/admin/users`.
  - Dispatches an HTML email containing the user's login email, temporary/chosen password, assigned role, and one-click portal sign-in link.
- **Ticket Assignment Notifications:**
  - Automated dispatch on `PATCH /api/tickets/:id/assign`.
  - Notifies the assigned specialist with the ticket ID, summary, priority, category, and direct link to the ticket resolution page.
- **Transporter Architecture:**
  - Production ready with standard SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
  - Zero-config development preview using Ethereal test accounts with live message preview links.

---

## 4. Frontend User Interfaces

1. **Admin Team Management Page (`/dashboard/admin/users`):**
   - Header with active count and `+ Add Team Member` modal.
   - Real-time search by name or email.
   - Filter dropdown by role.
   - Responsive table with inline role changer (`Agent`, `Manager`, `Admin`, `Customer`).
   - Self-admin protected indicator (`You`).

2. **Ticket Triage & Assignment on Dashboard (`/dashboard`):**
   - Workload filter for staff: *"All Workloads"*, *"Assigned to Me"*, *"Unassigned Only"*.
   - Assignee column in table showing agent name badge or *Unassigned* status.
   - Ticket detail page (`/dashboard/tickets/[id]`) with one-click specialist assignment.

3. **Floating AI Assistant Widget (`ChatbotWidget.tsx`):**
   - Accessible via bottom-right floating trigger across all dashboard pages.
   - Suggested query chips (*"How do I reset my password?"*, *"What are your SLAs?"*, *"Report billing issue"*).
   - Instant ticket draft card with **"Draft Ticket Now"** button.
   - Pre-fills `/dashboard/tickets/new` using query parameters with zero retyping.

4. **Landing & Login Page Refinements:**
   - Pure customer-facing value copy (removed developer jargon such as "directly from MongoDB").
   - Responsive breadcrumbs, dark theme (`#0a0e17`, `#111622`, `#1f293d`), and accessible forms.
