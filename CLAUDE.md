# CLAUDE.md — CineMatch Frontend

This file gives Claude Code context about the CineMatch frontend project.
For detailed coding conventions, always read `docs/coding_standards.md` in addition to this file.

---

## Project overview

CineMatch is a mobile-first web app where friends join a shared "watch party" and swipe on movies together. When all members like the same movie, it's a match.

Frontend: React + Vite, mobile-first, dark theme.
Backend: .NET 9 REST API (separate repo). See backend repo for API contracts.

---

## Tech stack

- **React + Vite** — no Next.js
- **React Router** — all routing
- **Framer Motion** — animations (curtain open/close, swipe transitions)
- **Axios** — all API communication via a central instance in `services/api.js`
- **Tailwind CSS + shadcn/ui** — styling (dark theme, consistent design tokens)

---

## Visual design & UX

### Landing page (unauthenticated)

The landing page uses a cinema perspective — the user "stands" behind a sofa. From back to front:

1. **TV/screen** on the wall (furthest away)
2. **Curtains** — two red curtains covering the screen, meeting in the middle (closed on load)
3. **Coffee table** with a popcorn bowl
4. **Sofa** with two people visible from behind (closest to the user)

UI elements (Join Party / Create Party buttons) sit at the bottom of the screen.

### Curtain animation (Framer Motion)

The curtains slide apart horizontally when the user is ready to swipe:
- Left curtain: `translateX(-100%)`
- Right curtain: `translateX(100%)`
- Duration: ~1.2s, `easeInOut` easing
- After curtains open: movie posters / swipe UI fades in on the screen

**Triggers for curtain open:**
- User joins a party with a valid 6-character code → curtains open → swipe session starts
- User creates a party → curtains open → swipe session starts

### Join Party flow

1. User taps "Join Party"
2. A bottom sheet slides up with a 6-character code input (uppercase, no ambiguous chars: no O/0, I/1)
3. On valid code + active party → curtains open
4. On invalid code → inline error message, no curtains

### Create Party flow

1. User taps "Create Party"
2. Party is created via API → user gets a join code to share
3. Curtains open → swipe session starts

### Authenticated landing (party lobby)

When the user is logged in and navigating to the app, show a simple view with:
- "Join Party" button
- "Create Party" button

No cinema scene needed here — that's for the moment of entering a swipe session.

### Swipe session

After curtains open, the TV/screen shows movie posters the user can swipe on (like/dislike). All members of the same party see the same movies in the same order (order is fixed by the backend via `OrderIndex`).

When all active members have liked the same movie → it's a match → show a match screen.

---

## API integration

Base URL from `VITE_API_URL` in `.env`.
JWT token is attached automatically via an Axios request interceptor.

### Key endpoints (backend)

| Action | Method | Endpoint |
|--------|--------|----------|
| Register | POST | `/api/Auth/register` |
| Login | POST | `/api/Auth/login` |
| Get current user | GET | `/api/Auth/me` |
| Forgot password | POST | `/api/Auth/forgot-password` |
| Reset password | POST | `/api/Auth/reset-password` |
| Create party | POST | `/api/WatchParties` |
| Join party | POST | `/api/WatchParties/join` |
| Leave party | POST | `/api/WatchParties/{id}/leave` |
| Get party details | GET | `/api/WatchParties/{id}` |
| Get swipe queue | GET | `/api/Swipes/queue/{watchPartyId}?count=10` |
| Register swipe | POST | `/api/Swipes` |
| Get matches | GET | `/api/Matches/party/{watchPartyId}` |
| Mark match watched | POST | `/api/Matches/{matchId}/watched` |

### Join code format

6 characters, uppercase, alphabet: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous chars).

---

## File structure

```
src/
  components/
    ui/            Generic UI components (Button, Input, Modal, FormField)
    layout/        Header, Footer, ProtectedRoute
    cinema/        CurtainScene, Curtain, CoffeTable, Sofa (landing scene)
    swipe/         SwipeCard, SwipeQueue, MatchScreen
    party/         PartyLobby, JoinPartySheet, CreatePartyModal
  pages/
    LandingPage.jsx
    LoginPage.jsx
    RegisterPage.jsx
    ForgotPasswordPage.jsx
    ResetPasswordPage.jsx
    PartyPage.jsx
  hooks/
    useAuth.js
    useSwipeQueue.js
    useParty.js
  services/
    api.js          Central Axios instance
    authService.js
    watchPartyService.js
    swipeService.js
    matchService.js
  context/
    AuthContext.jsx
  helpers/
  styles/
  App.jsx
  main.jsx
```

---

## Key decisions & constraints

- **Mobile-first** — design for portrait phone viewport first, desktop second
- **Dark theme** — deep dark backgrounds (`#0d0d0f` base), red accents (`#8b1a1a`) for cinema feel
- **No class components** — functional components and hooks only
- **Framer Motion for all animations** — do not use raw CSS transitions for the curtain or swipe animations
- **JWT in localStorage** for now (HttpOnly cookies preferred long-term but not implemented yet)
- **No prop drilling** beyond 2 levels — use Context or custom hooks
- **Components max ~150 lines** — split if larger
- Password minimum length: **8 characters** (matches backend validation)

---

## Read also

- [`docs/coding_standards.md`](docs/coding_standards.md) — naming conventions, Git workflow, component rules, API patterns, form handling, routing, error handling
