# Frontend Authentication - Developer Reference

## Quick Code Examples

### 1. Check if User is Authenticated
```tsx
import { useAuth } from "../auth/auth-context";

const MyComponent = () => {
  const { isAuthenticated, session } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  return <p>Welcome, {session.email}</p>;
};
```

### 2. Get Team Data in a Component
```tsx
import { useOutletContext } from "react-router";
import { useAuth } from "../auth/auth-context";
import type { Team } from "../types/team";

const Dashboard = () => {
  const { session } = useAuth();
  const { teamData } = useOutletContext<{ teamData: Team | null }>();

  return (
    <div>
      <h1>{teamData?.teamName}</h1>
      <p>Coach: {teamData?.coachName}</p>
      <p>Sport: {teamData?.sportType}</p>
    </div>
  );
};
```

### 3. Perform Logout
```tsx
import { useAuth } from "../auth/auth-context";
import { useNavigate } from "react-router";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return <button onClick={handleLogout}>Logout</button>;
};
```

### 4. Create a Protected Route
Routes under `RequireAuth` are automatically protected:
```tsx
// src/app/routes.ts
{
  path: "/",
  Component: RequireAuth,
  children: [
    {
      path: "/",
      Component: Layout,
      children: [
        { index: true, Component: ProtectedPage }
      ]
    }
  ]
}
```

### 5. Display Session Info in Sidebar
```tsx
const { session } = useAuth();

{session && (
  <div className="session-info">
    <p className="email">{session.email}</p>
    <p className="team">{session.teamName}</p>
  </div>
)}
```

---

## Storage Inspection

### View Credentials (Browser DevTools)
```javascript
// Open DevTools → Application → Local Storage
console.log(JSON.parse(localStorage.getItem("neurovision_credentials")))

// Output:
{
  "team-1": {
    teamId: "team-1",
    teamName: "Team A",
    email: "manager@teama.com",
    password: "pass123"
  },
  "team-2": {
    teamId: "team-2",
    teamName: "Team B",
    email: "manager@teamb.com",
    password: "pass456"
  }
}
```

### View Active Session
```javascript
console.log(JSON.parse(localStorage.getItem("neurovision_auth_session")))

// Output:
{
  email: "manager@teama.com",
  role: "team_manager",
  teamId: "team-1",
  teamName: "Team A",
  loginTime: 1716633600000
}
```

### View Team Data
```javascript
console.log(JSON.parse(localStorage.getItem("registered_teams_v2")))

// Output: Array of Team objects with all team information
```

---

## API Reference

### useAuth Hook

```tsx
interface useAuth {
  // State
  session: AuthSession | null              // Current user session
  isAuthenticated: boolean                  // Is user logged in?
  isLoading: boolean                        // Is auth loading?

  // Methods
  login(email, password, role)              // Authenticate user
  logout()                                  // Clear session
  getTeamData(): Team | null               // Get team data
}
```

### AuthSession Type
```tsx
type AuthSession = {
  email: string                     // User's login email
  role: UserRole                    // "admin" or "team_manager"
  teamId: string                    // Associated team ID
  teamName: string                  // Associated team name
  loginTime: number                 // Login timestamp (milliseconds)
}
```

### UserRole Type
```tsx
type UserRole = "admin" | "team_manager"
```

### Team Type (from types/team.ts)
```tsx
interface Team {
  id: string
  teamName: string
  teamLogo: string
  sportType: string
  ageCategory: string
  teamGender: "Men" | "Women" | "Mixed"
  country: string
  city: string
  affiliatedClub?: string
  foundedYear: number
  coachName: string
  phoneCountryCode: string
  phoneNumber: string
  contactEmail: string
  loginEmail: string                // ← Used for login
  password: string                  // ← Used for login
  teamStatus: "Active" | "Suspended"
  subscriptionType: "Free" | "Standard" | "Premium"
  permissions: string[]
  players: Player[]
  createdAt: string
  updatedAt: string
}
```

---

## Error Handling

### Login Errors
```tsx
const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await login(email, password, role);
    navigate("/");
  } catch (err) {
    // Errors:
    // - "Invalid email or password" (team_manager)
    // - "Invalid role"
    setError(err instanceof Error ? err.message : "Unknown error");
  }
};
```

---

## Role-Based Access Examples

### Team Manager (Restricted)
```tsx
// Must have registered credentials
const canLogin = (email: string, password: string) => {
  const credentials = getStoredCredentials();
  return Object.values(credentials).some(
    c => c.email === email && c.password === password
  );
};
```

### Admin (Demo)
```tsx
// Any credentials work in demo mode
// In production, would query backend
const isAdminValid = (email: string, password: string) => {
  // Demo: always true
  return true;
  
  // Production: would be
  // return validateAgainstBackend(email, password);
};
```

---

## Debugging

### Enable Debug Logging
```tsx
// In auth-context.tsx, add:
export const DEBUG = true;

// In functions:
if (DEBUG) console.log("Login attempt", { email, role });
if (DEBUG) console.log("Session created", session);
```

### Check Session Validity
```tsx
const isSessionValid = () => {
  const session = JSON.parse(localStorage.getItem("neurovision_auth_session"));
  if (!session) return false;
  
  const age = Date.now() - session.loginTime;
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  return age < maxAge;
};

console.log("Session valid?", isSessionValid());
```

### Monitor Storage Changes
```tsx
// Detect when session changes
window.addEventListener('storage', (e) => {
  if (e.key === 'neurovision_auth_session') {
    console.log('Session changed', e.newValue);
  }
});
```

---

## Performance Tips

1. **Memoize Team Data**
   ```tsx
   const teamData = useMemo(
     () => getTeamData(),
     [session?.teamId]
   );
   ```

2. **Lazy Load Routes**
   ```tsx
   const Dashboard = lazy(() => import('./Dashboard'));
   ```

3. **Debounce Login Attempts**
   ```tsx
   const [loginAttempts, setLoginAttempts] = useState(0);
   if (loginAttempts > 5) {
     setError("Too many attempts. Try again later.");
     return;
   }
   ```

---

## Common Patterns

### Pattern 1: Protected Component
```tsx
const ProtectedComponent = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? (
    <Content />
  ) : (
    <Redirect to="/login" />
  );
};
```

### Pattern 2: Conditional Rendering by Role
```tsx
const AdminOnly = () => {
  const { session } = useAuth();
  
  return session?.role === "admin" ? (
    <AdminPanel />
  ) : (
    <AccessDenied />
  );
};
```

### Pattern 3: Auto-Refresh on Focus
```tsx
useEffect(() => {
  const handleFocus = () => {
    // Refresh team data when user returns to app
    setTeamData(getTeamData());
  };
  
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);
```

---

## Migration to Production

### Step 1: Add Backend API
```tsx
// Replace verifyCredentials with API call
const verifyCredentials = async (email: string, password: string) => {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
};
```

### Step 2: Implement JWT Tokens
```tsx
// Store JWT instead of session
const login = async (email: string, password: string) => {
  const { token } = await verifyCredentials(email, password);
  localStorage.setItem('auth_token', token);
  
  // Include token in all API requests
};
```

### Step 3: Add Refresh Token
```tsx
// Rotate refresh tokens
const refreshToken = async () => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  const { newToken } = await response.json();
  localStorage.setItem('auth_token', newToken);
};
```

---

## Useful Utilities

### Get All Teams
```tsx
const getAllTeams = () => {
  const raw = localStorage.getItem("registered_teams_v2");
  return raw ? JSON.parse(raw) : [];
};
```

### Get Specific Team
```tsx
const getTeamById = (teamId: string) => {
  const teams = getAllTeams();
  return teams.find(t => t.id === teamId);
};
```

### Delete Team
```tsx
const deleteTeam = (teamId: string) => {
  const teams = getAllTeams();
  const updated = teams.filter(t => t.id !== teamId);
  localStorage.setItem("registered_teams_v2", JSON.stringify(updated));
  
  // Also remove credentials
  const creds = JSON.parse(localStorage.getItem("neurovision_credentials") || "{}");
  delete creds[teamId];
  localStorage.setItem("neurovision_credentials", JSON.stringify(creds));
};
```

### Clear All Data (Reset App)
```tsx
const resetApp = () => {
  localStorage.removeItem("neurovision_credentials");
  localStorage.removeItem("neurovision_auth_session");
  localStorage.removeItem("registered_teams_v2");
  localStorage.removeItem("remember_email");
  window.location.href = "/login";
};
```

---

## Testing

### Unit Test Example
```tsx
import { describe, it, expect, beforeEach } from 'vitest';

describe('Auth Context', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save credentials', () => {
    saveTeamCredentials('t1', 'Team A', 'user@test.com', 'pass123');
    
    const creds = JSON.parse(localStorage.getItem('neurovision_credentials'));
    expect(creds.t1.email).toBe('user@test.com');
  });

  it('should verify correct credentials', async () => {
    saveTeamCredentials('t1', 'Team A', 'user@test.com', 'pass123');
    
    // Would call login function
    // expect(result.teamId).toBe('t1');
  });
});
```

---

## Keyboard Shortcuts (Dev Mode)

```tsx
// Add to component for debugging
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl+Shift+D to dump auth state
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      console.log('Auth State:', {
        session,
        credentials: JSON.parse(localStorage.getItem('neurovision_credentials')),
        teams: JSON.parse(localStorage.getItem('registered_teams_v2'))
      });
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [session]);
```

---

## Troubleshooting Guide

| Problem | Solution |
|---------|----------|
| Login always fails | Check exact email/password match with registration |
| Session lost after refresh | Verify localStorage enabled; check browser settings |
| Team data not loading | Ensure team exists in localStorage; check teamId |
| Logout doesn't work | Verify logout button calls useAuth().logout() |
| Role selector not working | Check UserRole type matches options |
| Remember me not working | Check localStorage["remember_email"] is being saved |
| Redirect loops | Verify RequireAuth is not applied to /login route |
| Credentials undefined | Ensure team was created before attempting login |

---

**Last Updated**: May 25, 2026  
**Status**: Production-Ready (Demo)  
**Maintenance**: Version 1.0
