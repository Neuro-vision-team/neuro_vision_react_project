# Medical Dashboard - Complete Frontend Authentication Flow

## Overview

This is a **frontend-only authentication system** for a React medical dashboard application. It provides a complete end-to-end authentication flow using localStorage for persistence, with team credentials management, role-based access, and session handling.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Flow                      │
├─────────────────────────────────────────────────────────┤
│  Team Registration                                        │
│  ├─ Collect: teamName, coachName, credentials, etc      │
│  ├─ Save: Team data to localStorage                     │
│  └─ Save: Credentials (email/password) to auth storage  │
│                                                          │
│  ↓                                                        │
│                                                          │
│  Login Page                                              │
│  ├─ Select Role: Admin or Team Manager                  │
│  ├─ Enter: Email & Password                             │
│  └─ Verify: Against credentials saved during registration
│                                                          │
│  ↓                                                        │
│                                                          │
│  Auth Context                                            │
│  ├─ Create: AuthSession (email, role, teamId, etc)    │
│  ├─ Persist: Session to localStorage                    │
│  └─ Provide: User + Team data to components            │
│                                                          │
│  ↓                                                        │
│                                                          │
│  Protected Routes                                        │
│  ├─ Redirect: Unauthenticated → /login                 │
│  └─ Allow: Authenticated users to dashboard            │
│                                                          │
│  ↓                                                        │
│                                                          │
│  Dashboard Layout                                        │
│  ├─ Load: Team-specific data                           │
│  ├─ Display: Analytics, reports, team info             │
│  └─ Session: Persists across browser refresh            │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### 1. **Auth Context** (`src/app/auth/auth-context.tsx`)

Manages authentication state and provides login/logout functionality.

#### Functions:
- `saveTeamCredentials(teamId, teamName, email, password)` - Save credentials after registration
- `login(email, password, role)` - Authenticate user
- `logout()` - Clear session
- `getTeamData()` - Retrieve team data for authenticated user

#### Storage Keys:
- `neurovision_auth_session` - Current user session
- `neurovision_credentials` - All team credentials
- `registered_teams_v2` - Team data

### 2. **Registration Flow** (`src/app/pages/Registration.tsx`)

When a team is registered:
1. Collect team information (name, sport, coach, etc.)
2. Collect system information (login email & password)
3. Save team to `registered_teams_v2` in localStorage
4. **Call `saveTeamCredentials()`** to store login credentials

```tsx
// After successful team creation
const newTeam = await createTeam(form);
saveTeamCredentials(newTeam.id, newTeam.teamName, newTeam.loginEmail, newTeam.password);
```

### 3. **Login System** (`src/app/pages/Login.tsx`)

Users login with:
- **Role Selector**: Admin or Team Manager
- **Email**: Login email from registration
- **Password**: Password from registration
- **Remember Me**: Saves email for next visit

For Team Managers:
- Email and password are verified against stored credentials
- If valid, session is created with team data
- Redirects to dashboard

For Admin:
- Any email/password works (demo mode)
- Session created with admin privileges

### 4. **Protected Routes** (`src/app/components/auth/RouteAccess.tsx`)

RequireAuth component:
- Checks if user is authenticated
- Shows loading spinner while checking session
- Redirects to login if not authenticated
- Allows access to dashboard if authenticated

### 5. **Layout & Sidebar** 

**Layout** (`src/app/components/Layout.tsx`):
- Loads team data for authenticated user
- Passes team data through Outlet context
- Components can access via `useOutletContext<{teamData}>()`

**Sidebar** (`src/app/components/Sidebar.tsx`):
- Shows current user email and team name
- Displays logout button
- Theme and language toggles
- Navigation menu

## Data Flow

### Registration → Login → Dashboard

```
1. REGISTRATION
   └─ Team Data Structure:
      {
        id: "team-1234567890",
        teamName: "Sports Medicine Team",
        coachName: "Dr. Ahmed Hassan",
        loginEmail: "doctor@aspu.medical",
        password: "medical2024!",
        country: "Syria",
        city: "Damascus",
        players: [],
        createdAt: "2026-05-25T...",
        ...otherFields
      }
   └─ Stored in: localStorage["registered_teams_v2"]
   └─ Credentials saved separately

2. CREDENTIALS STORAGE
   └─ Structure:
      {
        "team-1234567890": {
          teamId: "team-1234567890",
          teamName: "Sports Medicine Team",
          email: "doctor@aspu.medical",
          password: "medical2024!"
        }
      }
   └─ Stored in: localStorage["neurovision_credentials"]

3. LOGIN
   └─ User enters email + password
   └─ System verifies against stored credentials
   └─ Creates AuthSession:
      {
        email: "doctor@aspu.medical",
        role: "team_manager",
        teamId: "team-1234567890",
        teamName: "Sports Medicine Team",
        loginTime: 1234567890
      }
   └─ Stored in: localStorage["neurovision_auth_session"]

4. DASHBOARD
   └─ Layout retrieves teamData via getTeamData()
   └─ Passes to Outlet context
   └─ Components display team-specific information
   └─ Session persists across page refreshes
```

## Usage Examples

### In Registration:
```tsx
import { saveTeamCredentials } from "../auth/auth-context";

// After creating team
const newTeam = await createTeam(form);
saveTeamCredentials(
  newTeam.id,
  newTeam.teamName,
  newTeam.loginEmail,
  newTeam.password
);
```

### In Login:
```tsx
import { useAuth } from "../auth/auth-context";

export const Login = () => {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password, role);
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };
};
```

### In Protected Component:
```tsx
import { useAuth } from "../auth/auth-context";
import { useOutletContext } from "react-router";
import type { Team } from "../types/team";

export const Dashboard = () => {
  const { session, getTeamData } = useAuth();
  const { teamData } = useOutletContext<{ teamData: Team | null }>();

  return (
    <div>
      <h1>Welcome, {session?.email}</h1>
      <p>Team: {teamData?.teamName}</p>
    </div>
  );
};
```

## Session Persistence

### Automatic Session Recovery
- On app start, AuthProvider checks for stored session
- If valid session exists (within 24 hours), user stays logged in
- If session expired or invalid, user redirected to login

### Session Timeout
- Sessions valid for 24 hours
- Logout clears session immediately
- Manual logout via sidebar button

### Remember Me
- When checked, saves email to localStorage
- Email auto-fills on next login
- Password never stored (security)

## Role-Based Behavior

### Admin Role
- Demo mode - any credentials accepted
- Access to admin dashboard
- Full system access
- Session: `{ role: "admin", teamId: "ADMIN", teamName: "Admin Dashboard" }`

### Team Manager Role
- Must use credentials from registration
- Access only to their team's data
- Credentials must match exactly
- Session includes: `{ role: "team_manager", teamId: "...", teamName: "..." }`

## LocalStorage Structure

```javascript
// Credentials
localStorage["neurovision_credentials"] = {
  "team-1": { email: "...", password: "...", teamId: "...", teamName: "..." },
  "team-2": { email: "...", password: "...", teamId: "...", teamName: "..." }
}

// Active Session
localStorage["neurovision_auth_session"] = {
  email: "doctor@aspu.medical",
  role: "team_manager",
  teamId: "team-1",
  teamName: "Sports Medicine Team",
  loginTime: 1234567890
}

// Team Data
localStorage["registered_teams_v2"] = [
  { id: "team-1", teamName: "...", loginEmail: "...", password: "...", ... },
  { id: "team-2", teamName: "...", loginEmail: "...", password: "...", ... }
]

// UI Preferences
localStorage["remember_email"] = "doctor@aspu.medical" // if remember me checked
```

## Security Considerations

### Frontend Demo Limitations
⚠️ This is a **frontend-only demo** implementation:
- ✅ Suitable for: Prototypes, demos, development
- ❌ Not suitable for: Production applications
- ❌ Passwords stored in plain text localStorage
- ❌ No encryption or hashing
- ❌ No backend validation

### For Production Implementation
1. **Move to Backend**:
   - Hash passwords with bcrypt/argon2
   - Validate credentials server-side
   - Use JWT or session tokens
   - Store sessions securely

2. **Security Headers**:
   - HTTPS/SSL encryption
   - HttpOnly cookies
   - CSRF protection
   - Rate limiting

3. **Additional Measures**:
   - Two-factor authentication (if needed)
   - Password reset flow
   - Account recovery
   - Activity logging

## Testing the Flow

### Step 1: Create a Team (Registration)
```
1. Go to "/" (Team Registration page)
2. Fill in team details:
   - Team Name: "Test Sports Team"
   - Coach: "Dr. Test Coach"
   - Sport: "Football"
   - Location: "Syria" / "Damascus"
3. Complete all steps
4. In System Information:
   - Email: "test@sports.com"
   - Password: "test123456"
5. Click Save
```

### Step 2: Login (Login Page)
```
1. Go to "/login"
2. Select Role: "Team Manager"
3. Enter:
   - Email: "test@sports.com"
   - Password: "test123456"
4. Click Continue
5. Should redirect to dashboard
```

### Step 3: Verify Session
```
1. Refresh the page
2. Should remain logged in
3. Check localStorage in DevTools
4. Verify session data is persisted
```

### Step 4: Logout
```
1. In Sidebar, click "Logout"
2. Should redirect to login page
3. localStorage session cleared
```

## File Structure

```
src/app/
├── auth/
│   └── auth-context.tsx          # Auth management & storage
├── components/
│   ├── auth/
│   │   └── RouteAccess.tsx        # Protected routes wrapper
│   ├── Layout.tsx                 # Main layout with team data
│   └── Sidebar.tsx                # Navigation & logout
├── pages/
│   ├── Login.tsx                  # Login form
│   ├── Registration.tsx           # Team registration form
│   ├── TeamDetails.tsx            # Team dashboard
│   ├── Assessments.tsx            # Medical assessments
│   └── ...other pages
├── types/
│   └── team.ts                    # Team & Auth interfaces
├── data/
│   └── teams.ts                   # localStorage CRUD operations
└── routes.ts                      # Route configuration with RequireAuth
```

## Common Tasks

### Add a new protected page
1. Create component in `src/app/pages/`
2. Add route to `src/app/routes.ts` under RequireAuth
3. Use `useAuth()` hook to access session
4. Use `useOutletContext()` to access teamData

### Access team data in a component
```tsx
import { useOutletContext } from "react-router";
import type { Team } from "../types/team";

const { teamData } = useOutletContext<{ teamData: Team | null }>();
// Use teamData...
```

### Check if user is authenticated
```tsx
import { useAuth } from "../auth/auth-context";

const { session, isAuthenticated } = useAuth();
if (isAuthenticated) {
  // User is logged in
}
```

### Dynamically populate dashboard with team data
```tsx
const { teamData } = useOutletContext<{ teamData: Team | null }>();

return (
  <div>
    <h1>{teamData?.teamName}</h1>
    <p>Coach: {teamData?.coachName}</p>
    <p>Sport: {teamData?.sportType}</p>
    {/* Display team analytics, reports, etc */}
  </div>
);
```

## Next Steps

1. **Extend Dashboard**: Add analytics, reports, KPI cards
2. **Add More Roles**: Create different dashboards per role
3. **Persist More Data**: Save assessments, reports, medical stats
4. **Implement Backend**: Replace localStorage with API calls
5. **Add Security**: Implement proper auth with JWT tokens

## Troubleshooting

### User redirects to login after refresh
- Check if session key is being saved correctly
- Verify 24-hour timeout hasn't expired
- Clear localStorage and re-login

### Login fails with "Invalid credentials"
- Verify email matches exactly what was saved during registration
- Check password is correct
- Ensure team was saved successfully during registration

### Team data not loading in dashboard
- Confirm team exists in `registered_teams_v2`
- Check teamId in session matches team in storage
- Verify `getTeamData()` is being called

### Remember me not working
- Check browser localStorage is enabled
- Verify checkbox state is being saved
- Inspect localStorage["remember_email"]

---

**Documentation Version**: 1.0  
**Last Updated**: May 25, 2026  
**Project**: Medical Sports Dashboard - Frontend Auth Flow
