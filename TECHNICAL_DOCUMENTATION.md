# Neuro Vision Dashboard — Technical Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication & Session](#4-authentication--session)
5. [Routing & Role-Based Access](#5-routing--role-based-access)
6. [Layout System](#6-layout-system)
7. [State Management](#7-state-management)
8. [API Layer](#8-api-layer)
9. [Backend Integration](#9-backend-integration)
10. [Pages & Features](#10-pages--features)
11. [Component Library](#11-component-library)
12. [Theme & i18n System](#12-theme--i18n-system)
13. [Data Types](#13-data-types)
14. [Environment Configuration](#14-environment-configuration)
15. [Known Limitations & Notes](#15-known-limitations--notes)

---

## 1. Project Overview

Neuro Vision is a role-based medical dashboard for sports concussion assessment. It allows a **Super Admin** to manage teams and users, **Medical Team Managers** to manage their squad and review assessments, and **Medical Staff** to conduct live SCAT-5 and PLR (Pupil Light Reflex) assessments.

The frontend communicates exclusively with a Laravel 12 REST API at `http://192.168.1.184:8000/api/v1`.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19.2.6 |
| Language | TypeScript | ~6.0.2 |
| Build Tool | Vite | 8.0.12 |
| Routing | React Router DOM | 7.15.1 |
| Global State | Zustand | 5.0.13 |
| Server State | TanStack React Query | 5.100.10 |
| Styling | Tailwind CSS | 4.3.0 |
| Component Primitives | Radix UI | (dialog, tabs, slot) |
| Charts | Recharts | 3.8.1 |
| Charts (legacy) | Chart.js + react-chartjs-2 | 4.5.1 / 5.3.1 |
| PDF Export | jsPDF | 4.2.1 |
| QR Code | qrcode.react | 4.2.0 |
| Animation | Framer Motion | 12.38.0 |
| Icons | Lucide React | 1.16.0 |
| OTP/2FA | otplib | 13.4.0 |

---

## 3. Project Structure

```
src/
├── app/
│   ├── App.tsx                   Entry point component
│   ├── providers.tsx             QueryClient + Router + Theme + Language providers
│   ├── language-context.tsx      English/Arabic context provider
│   ├── theme-context.tsx         Thin wrapper exposing Zustand theme to context
│   ├── globals.css               Base styles + utility class definitions
│   └── routes/
│       ├── router.tsx            All routes, lazy loading, role redirect
│       └── RequireAuth.tsx       Route guard (checks token + user in localStorage)
│
├── components/
│   ├── ui.tsx                    GlassCard, RiskBadge, StatCard, PageTitle, Skeleton
│   ├── AnimatedSidebar.tsx       Role-based sidebar nav (Manager / Staff)
│   ├── Topbar.tsx                Fixed top bar with theme/lang/user/logout
│   ├── AssessmentReportDialog.tsx Modal for displaying assessment reports
│   ├── featureBlocks.tsx         Reusable feature card blocks
│   └── primitives/               Radix UI wrappers (button, card, dialog, tabs)
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── Verify2FAPage.tsx
│   ├── DashboardPage.tsx         Admin executive dashboard
│   ├── AdminWorkspacePage.tsx    Admin team + player management workspace
│   ├── MyTeamPage.tsx            Medical Team Manager dashboard
│   ├── MedicalTeamPage.tsx       Medical Staff dashboard
│   ├── AssessmentMedicalPage.tsx Assessment history and report viewer
│   ├── BaselinePage.tsx          Baseline assessment management
│   ├── LiveSessionsPage.tsx      In-progress assessment sessions
│   ├── ScatPage.tsx              SCAT-5 on-field and off-field forms
│   ├── PlrPage.tsx               PLR video capture and analysis
│   ├── AiPage.tsx                AI analysis results viewer
│   ├── TeamsPage.tsx             Team browser (shared)
│   ├── AnalyticsPage.tsx         Analytics and reporting
│   ├── EmergencyPage.tsx         Emergency case management
│   └── SettingsPage.tsx          Admin user management + 2FA info
│
├── services/
│   ├── api/
│   │   ├── client.ts             Fetch wrapper with envelope parsing + auth headers
│   │   ├── auth-session.ts       Session storage/retrieval (token, user, 2FA keys)
│   │   ├── auth.api.ts           Login, 2FA verify, logout, /me
│   │   ├── admin.api.ts          Admin dashboard, teams, users, audit logs
│   │   ├── manager.api.ts        Manager team, staff, players, assessments
│   │   ├── medical.api.ts        Shared player and assessment history endpoints
│   │   ├── assessments.api.ts    Assessment CRUD + complete/cancel
│   │   ├── scat.api.ts           SCAT-5 on-field and off-field forms
│   │   ├── plr.api.ts            PLR video upload and analysis
│   │   └── reports.api.ts        Report generation and comparison
│   ├── authMock.ts               Legacy local auth (partially still used)
│   ├── assessmentHistoryMock.ts  Local mock assessment data (fallback)
│   └── teams.ts                  Local team/player storage (localStorage)
│
├── store/
│   └── uiStore.ts                Zustand: theme, dir, emergencyOpen
│
├── hooks/
│   └── useI18n.ts                Translation hook with en/ar dictionary (368 keys)
│
├── layouts/
│   └── MainLayout.tsx            Conditional layout: Admin vs Medical roles
│
├── types/
│   ├── team.ts                   Team, Player, TeamFormInput, PlayerFormInput, etc.
│   └── index.ts                  AssessmentRecord, RiskLevel
│
├── utils/
│   ├── cn.ts                     Tailwind class merger (clsx + tailwind-merge)
│   └── locations.ts              COUNTRIES, CITIES_BY_COUNTRY, SPORTS, COUNTRY_CODES
│
└── styles/
    └── theme.css                 CSS custom properties for dark/light theming
```

---

## 4. Authentication & Session

### Login Flow

```
POST /auth/login  →  { requires_2fa: false, token, user }
                 └→  { requires_2fa: true, challenge_id }
                                       ↓
                      POST /auth/2fa/verify  →  { token, user }
```

`LoginPage.tsx` calls `loginApi()`. If `requires_2fa` is `true`, the `challenge_id` is stored in `sessionStorage` and the user is redirected to `/auth/verify-2fa`. Otherwise the session is stored immediately.

### Session Storage Keys

| Key | Storage | Purpose |
|---|---|---|
| `neurovision_token` | `localStorage` | Bearer token sent with every API request |
| `neurovision_user` | `localStorage` | Raw `AuthUser` object from backend |
| `neurovision_2fa_challenge_id` | `sessionStorage` | Temporary 2FA challenge ID |
| `neurovision_2fa_email` | `sessionStorage` | Email shown on 2FA screen |
| `ui-theme` | `localStorage` | Persisted dark/light preference |
| `app_language` | `localStorage` | Persisted language (en/ar) |
| `registered_teams_v2` | `localStorage` | Local team/player cache |

### Session Utility — `auth-session.ts`

```ts
getStoredAuthenticatedUser()   // Returns AuthUser | null from localStorage
getStoredSessionUser()         // Returns StoredSessionUser with mapped role
getSessionRole(user)           // Maps super_admin → "Admin", etc.
storeAuthenticatedSession()    // Writes token + user to localStorage
clearAuthenticatedSession()    // Clears token, user, and 2FA sessionStorage keys
getPostLoginRoute(user)        // Returns redirect path based on role
```

### StoredSessionUser Type

```ts
type StoredSessionUser = {
  id: string;
  role: "Admin" | "Medical Staff" | "Medical Team Manager";
  fullName: string;
  email: string;
  teamId?: string;
  teamName?: string;
};
```

### Route Guard — `RequireAuth.tsx`

Checks for both `neurovision_token` **and** a valid `AuthUser` in localStorage. If either is missing, redirects to `/auth/login`. This prevents access after token expiry or manual storage clearing.

---

## 5. Routing & Role-Based Access

### Route Table

| Path | Component | Access |
|---|---|---|
| `/` | LoginPage | Public |
| `/auth/login` | LoginPage | Public |
| `/auth/register` | RegisterPage | Public |
| `/auth/forgot-password` | ForgotPasswordPage | Public |
| `/auth/verify-2fa` | Verify2FAPage | Public |
| `/dashboard` | DashboardIndex† | Auth required |
| `/dashboard/assessments` | AssessmentMedicalPage | Auth required |
| `/dashboard/my-team` | MyTeamPage | Auth required |
| `/dashboard/medical-team` | MedicalTeamPage | Auth required |
| `/dashboard/baseline` | BaselinePage | Auth required |
| `/dashboard/live-sessions` | LiveSessionsPage | Auth required |
| `/dashboard/ai-analysis` | AiPage | Auth required |
| `/dashboard/scat5` | ScatPage | Auth required |
| `/dashboard/plr` | PlrPage | Auth required |
| `/dashboard/emergency` | EmergencyPage | Auth required |
| `/dashboard/teams` | TeamsPage | Auth required |
| `/dashboard/analytics` | AnalyticsPage | Auth required |
| `/dashboard/settings` | SettingsPage | Auth required |

† `DashboardIndex` redirects Medical Team Manager → `/dashboard/my-team`. Admin and Medical Staff see `DashboardPage`.

### Role → Default View

| Backend Role | Frontend Role | Default Route |
|---|---|---|
| `super_admin` | Admin | `/dashboard` → DashboardPage |
| `medical_team_manager` | Medical Team Manager | `/dashboard/my-team` |
| `medical_staff` | Medical Staff | `/dashboard` → DashboardPage |

All pages are **lazy-loaded** via `React.lazy()` wrapped in a `<Suspense>` boundary that shows a `<Skeleton>` placeholder.

---

## 6. Layout System

### Admin Layout (`MainLayout.tsx` — Admin branch)

```
┌─────────────────────────────────────────────┐
│  Header (fixed, z-40)                       │
│  left: 0 on mobile / lg:left-[19.5rem]      │
│  Contains: Theme toggle, Language, Logout   │
├─────────────────────────────────────────────┤
│                                             │
│  AdminWorkspacePage                         │
│  (has its own fixed internal sidebar)       │
│                                             │
└─────────────────────────────────────────────┘
```

`AdminWorkspacePage` renders its own `<aside>` sidebar (fixed, `w-72`, hidden below `lg`). The main content area has `lg:pl-[19.5rem]` padding to avoid overlap. A mobile tab bar (`lg:hidden`) provides navigation on small screens.

### Medical Staff / Manager Layout (`MainLayout.tsx` — default branch)

```
┌───────────────┬────────────────────────────┐
│               │  Topbar (fixed, z-30)      │
│  AnimatedSide │  Theme / Lang / User       │
│  bar          ├────────────────────────────┤
│  (fixed,      │                            │
│  w-[18rem],   │  <Outlet /> (page content) │
│  hidden <md)  │                            │
└───────────────┴────────────────────────────┘
```

Content area uses `md:pl-[19.5rem]` to offset the sidebar. The `Topbar` uses inline `style` for precise positioning relative to the sidebar.

---

## 7. State Management

### Zustand Store — `uiStore.ts`

```ts
useUiStore(state => state.theme)          // 'dark' | 'light'
useUiStore(state => state.toggleTheme)    // Persists to localStorage + applies to DOM
useUiStore(state => state.dir)            // 'ltr' | 'rtl'
useUiStore(state => state.toggleDir)
useUiStore(state => state.emergencyOpen)
useUiStore(state => state.setEmergencyOpen)
```

Theme is applied immediately on import by calling `applyTheme(initialTheme)` — this sets `data-theme` attribute and the `dark` class on `<html>` before React renders, preventing flash of wrong theme.

### Language Context — `language-context.tsx`

Provides `language` (`'en' | 'ar'`) and `toggleLanguage()`. Persists to `app_language` in localStorage.

### Local Team Cache — `services/teams.ts`

Players and team details are stored locally in `registered_teams_v2` (localStorage). This is used as a fallback and for player management while the admin player API is being finalized.

```ts
createTeam(input)              // Creates team locally with id: `team-${Date.now()}`
updateTeam(teamId, input)
createPlayer(teamId, input)    // Appends player to team.players[]
updatePlayer(teamId, playerId, input)
deletePlayer(teamId, playerId)
getPlayersByTeam(teamId, query)
```

---

## 8. API Layer

### HTTP Client — `services/api/client.ts`

All requests go through `apiRequest()` which:
- Auto-attaches `Authorization: Bearer {token}` from `neurovision_token` in localStorage
- Sets `Accept: application/json` and `Content-Type: application/json`
- Parses the backend's envelope format `{ success, message, data, errors }`
- Throws `ApiError` on non-2xx or `success: false` responses
- Extracts human-readable messages from validation errors

```ts
apiGet<T>(path, options?)
apiPost<T, TBody>(path, body?, options?)
apiPut<T, TBody>(path, body?, options?)
apiPatch<T, TBody>(path, body?, options?)
apiDelete<T>(path, options?)
```

### Backend Envelope Format

```json
{
  "success": true,
  "message": "Done.",
  "data": { ... }
}
```

On error:
```json
{
  "success": false,
  "message": "Validation error.",
  "errors": { "email": ["The email field is required."] }
}
```

---

## 9. Backend Integration

**Base URL:** `http://192.168.1.184:8000/api/v1`

### Tested Endpoint Results

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| POST | `/auth/login` | ✅ 200 | Returns token or challenge_id for 2FA |
| POST | `/auth/2fa/verify` | ✅ 422/200 | 422 for bad code, 200 on success |
| GET | `/auth/me` | ✅ 200 | Returns full AuthUser |
| POST | `/auth/logout` | ✅ 200 | Immediately invalidates the token |
| GET | `/admin/dashboard` | ✅ 200 | Returns totals + risk_overview + recent_audit_logs |
| GET | `/admin/teams` | ✅ 200 | Paginated, includes `players[]` per team |
| POST | `/admin/teams` | ✅ | Creates team + manager user |
| GET | `/admin/teams/:id` | ✅ 200 | Single team with players |
| PUT | `/admin/teams/:id` | ✅ | Updates team |
| PATCH | `/admin/teams/:id/status` | ✅ | Suspend / Activate |
| POST | `/admin/managers` | ✅ | Creates manager account |
| GET | `/admin/users` | ✅ 200 | All users, paginated |
| GET | `/admin/audit-logs` | ✅ 200 | Paginated, uses `recorded_at` field |
| GET | `/assessments` | ✅ 200 | All assessments with embedded player |
| GET | `/assessments/:id` | ✅ 200 | Includes PLR tests + SCAT data |
| GET | `/assessments/:id/report` | ✅ 200 | Full report with plr_left, plr_right, SCAT |
| GET | `/assessments/:id/plr` | ✅ 200 | Array of PLR tests + AI classification |
| GET | `/assessments/:id/scat/on-field` | ✅ 200 | Returns null if not recorded |
| GET | `/assessments/:id/scat/off-field` | ✅ 200 | Full SCAT-5 off-field evaluation |
| GET | `/players` | ✅ 200 | All players with team embedded |
| GET | `/players/:id` | ✅ 200 | Single player |
| GET | `/players/:id/history` | ✅ 200 | Player assessment history |
| POST | `/reports/compare` | ⚠️ 422 | Requires same-player assessments |
| GET | `/manager/*` | ✅ 403 | Correct — admin role has no access |

### Backend Field Name Mapping

Backend returns snake_case; the frontend normalizes to camelCase:

| Backend Field | Frontend Field | Location |
|---|---|---|
| `team_name` | `teamName` | Team |
| `team_logo_url` | `teamLogo` | Team |
| `coach_name` | `coachName` | Team |
| `coach_phone` | `phoneCountryCode` + `phoneNumber` (split) | Team |
| `coach_email` | `contactEmail` | Team |
| `age_category` | `ageCategory` | Team |
| `club_academy` | `affiliatedClub` | Team |
| `founded_year` | `foundedYear` | Team |
| `player_name` | `fullName` | Player |
| `shirt_name` | `shirtName` | Player |
| `shirt_number` | `jerseyNumber` | Player |
| `birthdate` | `dateOfBirth` | Player |
| `join_year` | `joinDate` (as `YYYY-01-01`) | Player |
| `photo_url` | `photo` | Player |
| `action_type` | mapped to `label` in audit log display | Audit Log |
| `recorded_at` | mapped to `timestamp` in audit log display | Audit Log |

### Known Backend Issue — Storage Images Return 403

`GET http://192.168.1.184:8000/storage/...` returns **403 Forbidden** because `php artisan storage:link` has not been run on the server. The frontend works around this by preferring the locally-cached base64 image over the broken server URL.

**Fix (run on backend server):**
```bash
php artisan storage:link
```

---

## 10. Pages & Features

### `DashboardPage` — Admin Executive Overview
**Route:** `/dashboard` (Admin only)
**API:** `GET /admin/dashboard`

Displays four stat cards (Total Assessments, High Risk Cases, Teams Registered, Players Registered), an AI Risk Distribution pie chart, a Recent Activity feed, an Assessment Trend area chart, and a Monthly Risk Comparison bar chart. All data comes from the backend. On API failure the page shows an error banner and empty charts.

Key fields consumed from `/admin/dashboard`:
- `total_teams`, `active_teams`, `suspended_teams`
- `total_players`, `total_assessments`
- `risk_overview.low / medium / high`
- `recent_audit_logs[]` — each entry has `action_type`, `description`, `recorded_at`, `user.full_name`

---

### `AdminWorkspacePage` — Team & Player Management
**Route:** `/dashboard` (rendered inside `MainLayout` for Admin role)
**APIs:** `GET/POST/PUT/PATCH /admin/teams`, `POST /admin/managers`

Internal tab navigation:
- **Home** — mini dashboard stats + risk bar chart
- **Team Registration** — 4-step form: Team Info → Contact → System Settings → Review, then switches to player registration phase
- **Teams Management** — searchable/filterable/paginated team cards with Details, Edit, Suspend/Activate, Delete actions
- **Details** (sub-view) — full team profile + embedded player list with search and pagination

Player data is loaded from the `players[]` array embedded in the `/admin/teams` response. Players are also persisted locally via `services/teams.ts` as a fallback.

The team logo is stored as a base64 data URI in local state during upload, then sent as the `logo` field in the JSON payload. On reload, the frontend prefers the local base64 over the backend URL (due to the current 403 issue on storage files).

---

### `MyTeamPage` — Medical Team Manager Dashboard
**Route:** `/dashboard/my-team`
**APIs:** `GET /manager/dashboard`, `GET /manager/team`, `GET /manager/players`, `GET /manager/assessments`, `GET /manager/assessments/:id/report`, `POST /manager/reports/compare`

Full team management view for the manager role. Features: dashboard stats (total players, active, injured, assessments), player roster with full CRUD, staff list, assessment history with report viewer, report comparison, and PDF export via jsPDF.

---

### `MedicalTeamPage` — Medical Staff Dashboard
**Route:** `/dashboard/medical-team`
**APIs:** `GET /manager/team`, `GET /manager/players`, `GET /manager/staff`

Simplified view for staff: team info, player roster, staff list, and their own assessment queue.

---

### `LiveSessionsPage` — Active Assessment Sessions
**Route:** `/dashboard/live-sessions`
**APIs:** `GET /assessments`, `POST /assessments/:id/complete`, `POST /assessments/:id/cancel`

Lists all assessments filterable by status. Staff can complete or cancel a session directly from the list.

---

### `ScatPage` — SCAT-5 Assessment Forms
**Route:** `/dashboard/scat5`
**APIs:** `POST/GET /assessments/:id/scat/on-field`, `POST/GET /assessments/:id/scat/off-field`

Two-phase SCAT-5 form:
- **On-field:** red flags, observable signs, GCS, cervical spine screen, Maddocks questions
- **Off-field:** symptoms checklist, orientation, immediate memory trials, concentration (digits/months backward), coordination/mBESS, delayed recall, clinical notes and concussion diagnosis

---

### `PlrPage` — Pupil Light Reflex Testing
**Route:** `/dashboard/plr`
**APIs:** `POST /assessments/:id/plr`, `GET /assessments/:id/plr`, `POST /assessments/:id/plr/analyze-batch`, `POST /plr-tests/:id/reanalyze`

Video upload interface for left/right eye PLR tests. The backend forwards the video to a Python microservice at `http://192.168.1.184:8001`. Analysis results include: max/min diameter (mm), constriction %, latency (ms), constriction/dilation velocities, T75, confidence score, AI risk level, recommendation, and expert rule trigger results.

---

### `BaselinePage` — Baseline Assessment Management
**Route:** `/dashboard/baseline`
**APIs:** `GET /manager/assessments` (filtered by `assessment_type: baseline`)

Lists completed baseline assessments with report viewing for each entry.

---

### `AssessmentMedicalPage` — Assessment History
**Route:** `/dashboard/assessments`
**APIs:** `GET /manager/assessments`, `GET /assessments/:id/report`

Full assessment history for the team. Filterable by risk level and status. Inline report viewer renders PLR metrics and SCAT scores.

---

### `SettingsPage` — Admin Controls & 2FA Info
**Route:** `/dashboard/settings`
**APIs:** `POST /admin/managers`, `GET /admin/users`

Admin section: create Medical Team Manager accounts and view the full user list. The 2FA card informs that 2FA is managed at login. No passwords are displayed.

---

### `AiPage`, `AnalyticsPage`, `EmergencyPage`, `TeamsPage`

Supplementary pages. `TeamsPage` fetches from the backend. `AiPage` shows AI model results. `EmergencyPage` surfaces high-risk cases. `AnalyticsPage` aggregates assessment trends.

---

## 11. Component Library

### `components/ui.tsx`

| Component | Props | Purpose |
|---|---|---|
| `GlassCard` | `className?, children` | Frosted glass card container |
| `RiskBadge` | `level: 'low' \| 'medium' \| 'high'` | Colored risk indicator pill |
| `StatCard` | `label, value, trend` | Metric card with optional trend arrow |
| `PageTitle` | `title, subtitle?` | Standardized page header |
| `Skeleton` | `className?` | Animated loading placeholder |

### `components/AnimatedSidebar.tsx`

Role-aware sidebar. Hidden below `md` breakpoint. Uses `NavLink` for active-state styling.

**Medical Team Manager nav:**
- `/dashboard/my-team` — My Team
- `/dashboard/assessments` — Assessments
- `/dashboard/baseline` — Baseline

**Medical Staff nav:**
- `/dashboard/medical-team` — Medical Team
- `/dashboard/assessments` — Assessments
- `/dashboard/baseline` — Baseline
- `/dashboard/live-sessions` — Live Sessions
- `/dashboard/scat5` — SCAT-5
- `/dashboard/plr` — PLR

### `components/Topbar.tsx`

Fixed header for Medical roles. Shows: theme toggle, language toggle, user info dropdown (name, email, role), logout button. Positioned dynamically via inline `style` to account for the sidebar offset.

### `components/primitives/`

Radix UI wrappers styled with Tailwind + CVA (class-variance-authority):
- `button.tsx` — variants: default, destructive, outline, ghost, link
- `card.tsx` — Card, CardHeader, CardContent, CardFooter
- `dialog.tsx` — Dialog, DialogContent, DialogHeader, DialogTitle
- `tabs.tsx` — Tabs, TabsList, TabsTrigger, TabsContent

---

## 12. Theme & i18n System

### Theme

Two themes: `dark` (default) and `light`. Applied via:
- `data-theme="dark|light"` on `<html>` — drives CSS custom properties in `styles/theme.css`
- `.dark` class on `<html>` — drives Tailwind `dark:` variants

Theme is initialized synchronously before React renders (in `uiStore.ts` module scope) to prevent flash of wrong theme.

CSS variables defined in `theme.css` cover surface colors, border colors, and shadows. Utility classes in `globals.css`:
- `.theme-surface` — adaptive card background
- `.theme-surface-soft` — subtle secondary surface
- `.theme-muted` — muted text color
- `.neon-border` — glowing cyan border
- `.glass` — frosted glass effect

### i18n — `hooks/useI18n.ts`

```ts
const { t, isArabic, language, toggleLanguage } = useI18n();
t('Key')         // Returns translated string, falls back to the key itself
isArabic         // true when language === 'ar'
toggleLanguage() // Switches en ↔ ar, persists to localStorage
```

The dictionary has 368 translation keys covering all UI text, medical terms, and error messages. Arabic support includes full RTL layout via `dir={isArabic ? 'rtl' : 'ltr'}` on container elements.

---

## 13. Data Types

### `Team`

```ts
interface Team {
  id: string;
  teamName: string;
  teamLogo: string;          // base64 URI (local) or http:// URL (from backend)
  sportType: string;
  ageCategory: string;
  teamGender: "Men" | "Women" | "Mixed";
  country: string;
  city: string;
  affiliatedClub?: string;
  foundedYear: number;
  coachName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  contactEmail: string;
  medicalStaffName: string;
  medicalStaffEmail: string;
  medicalStaffPassword: string;
  loginEmail: string;
  password: string;
  teamStatus: "Active" | "Suspended";
  subscriptionType: "Free" | "Standard" | "Premium";
  permissions: string[];
  players: Player[];
  createdAt: string;
  updatedAt: string;
}
```

### `Player`

```ts
interface Player {
  id: string;
  teamId: string;
  photo: string;             // base64 URI or http:// URL
  fullName: string;
  shirtName: string;
  dateOfBirth: string;
  age: number;
  nationality: string;
  gender: "Male" | "Female";
  heightCm: number;
  weightKg: number;
  jerseyNumber: number;
  position: string;
  preferredSide: "Right" | "Left" | "Both";
  joinDate: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email?: string;
  guardianName?: string;
  status: "Active" | "Injured" | "Suspended";
  createdAt: string;
  updatedAt: string;
}
```

### `StoredSessionUser`

```ts
type StoredSessionUser = {
  id: string;
  role: "Admin" | "Medical Staff" | "Medical Team Manager";
  fullName: string;
  email: string;
  teamId?: string;
  teamName?: string;
};
```

### `AssessmentRecord` (frontend-only)

```ts
interface AssessmentRecord {
  id: string;
  patientName: string;
  team: string;
  injuryDate: string;
  scatStatus: "pending" | "in-progress" | "completed";
  plrStatus: "pending" | "in-progress" | "completed";
  aiClassification: "low" | "medium" | "high";
  assignedMedic: string;
  lastUpdated: string;
  assessmentStatus: "active" | "saved" | "completed" | "cancelled";
}
```

### `RiskLevel`

```ts
type RiskLevel = "low" | "medium" | "high";
```

---

## 14. Environment Configuration

**`.env`** (project root)

```env
VITE_API_BASE_URL=http://192.168.1.184:8000/api/v1
```

This is the only required environment variable. All API calls are relative to this base URL. For local development, point this to a local Laravel instance.

---

## 15. Known Limitations & Notes

### Storage Images Return 403
Team logos and player photos uploaded to the backend are stored at `http://192.168.1.184:8000/storage/...` but return **403 Forbidden** because the Laravel storage symlink has not been created. The frontend currently falls back to the locally-cached base64 image, so logos still display for the session that uploaded them.

**Permanent fix:** run `php artisan storage:link` on the backend server.

### Admin Player API Not Available
The admin role has no `/admin/players` endpoints. Player management in the Admin Workspace uses local `localStorage` via `services/teams.ts`. Players added through the admin workspace are visible locally but not persisted to the backend database. Player creation should eventually go through the manager role's `POST /manager/players` endpoint.

### Manager Endpoints Require Manager Token
All `/manager/*` routes require the `medical_team_manager` role. An admin token receives **403 Forbidden** on these routes. This is correct backend behavior by design.

### `reports/compare` Requires Same-Player Assessments
`POST /reports/compare` returns **422** with `"Assessments must belong to one player"` if you pass assessment IDs from different players. Always validate that selected assessments belong to the same player before calling this endpoint.

### CORS Allowed Origins
The backend CORS configuration explicitly allows:
- `http://localhost:5173` (Vite default dev port)
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- Value of `FRONTEND_URL` environment variable on the backend

If the frontend is served from a different host or port, `FRONTEND_URL` must be updated in the backend `.env`.

### Mock Services Partially Active
`authMock.ts` and `assessmentHistoryMock.ts` are still imported by some pages (`MyTeamPage`, `MedicalTeamPage`). These pages use `getSessionUser()` from the mock instead of `getStoredSessionUser()` from `auth-session.ts`. Migration to the real session utility is in progress.
