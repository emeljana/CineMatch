# CLAUDE.md — CineMatch Frontend

This document provides Claude (and other AI assistants) with context about the CineMatch frontend project. Read this before suggesting code, making changes, or creating new files.

---

## Project Overview

CineMatch is a mobile-first web application where friends join a shared "WatchParty" and swipe on movies together (Tinder-style). When all active members of the party have liked the same movie, a match is created and shown to everyone. This repository contains only the frontend. The backend (ASP.NET Core / .NET 10) lives in a separate repository.

---

## Tech Stack

- **React 19** — functional components and hooks only, no class components
- **Vite** — build tool and dev server
- **JavaScript / JSX** — no TypeScript
- **React Router v7** — client-side routing
- **Framer Motion** — all animations (curtain open/close, swipe transitions)
- **Axios** — HTTP client via a central instance in `services/api.js`
- **Tailwind CSS + shadcn/ui** — styling (dark theme, consistent design tokens)
- **ESLint** — flat config with React hooks and React refresh plugins

---

## Visual Design & UX

### Theme

Mobile-first, dark theme. Base background: `#0d0d0f`. Red cinema accent: `#8b1a1a`. Design for portrait phone viewport first, desktop second.

### Landing page (unauthenticated)

The landing page uses a cinema perspective — the user "stands" behind a sofa. From back to front:

1. **TV/screen** on the wall (furthest away)
2. **Curtains** — two red curtains covering the screen, meeting in the middle (closed on load)
3. **Coffee table** with a popcorn bowl
4. **Sofa** with two people visible from behind (closest to the user)

UI elements (Join Party / Create Party buttons) sit at the bottom of the screen.

### Curtain animation (Framer Motion)

The curtains slide apart horizontally when the user enters a swipe session:

- Left curtain: `translateX(-100%)`
- Right curtain: `translateX(100%)`
- Duration: ~1.2s, `easeInOut` easing
- After curtains open: movie posters / swipe UI fades in on the screen

**Use Framer Motion for all animations — never raw CSS transitions for curtain or swipe animations.**

**Triggers for curtain open:**
- User joins a party with a valid join code → curtains open → swipe session starts
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

When the user is logged in, show a simple view with "Join Party" and "Create Party" buttons. No cinema scene here — that is reserved for entering a swipe session.

### Swipe session

After curtains open, the TV/screen shows movie posters the user can swipe on (like/dislike). All members of the same party see the same movies in the same order (fixed by the backend). When all active members have liked the same movie → show a match screen.

---

## Project Structure

**All source code lives under `src/`.** No exceptions.

```
src/
  components/
    ui/             Generic UI components (Button, Input, Modal, FormField)
    layout/         Layout components (Header, Footer, ProtectedRoute)
    cinema/         CurtainScene, Curtain, CoffeeTable, Sofa (landing scene)
    swipe/          SwipeCard, SwipeQueue, MatchScreen
    party/          PartyLobby, JoinPartySheet, CreatePartyModal
  pages/
    LandingPage/
      LandingPage.jsx
    LoginPage/
      LoginPage.jsx
    RegisterPage/
      RegisterPage.jsx
    ForgotPasswordPage/
      ForgotPasswordPage.jsx
    ResetPasswordPage/
      ResetPasswordPage.jsx
    PartyPage/
      PartyPage.jsx
  hooks/
    useAuth.js
    useSwipeQueue.js
    useParty.js
  services/
    api.js                  Central Axios instance with interceptors
    authService.js
    watchPartyService.js
    swipeService.js
    matchService.js
  context/
    AuthContext.jsx
  helpers/                  Pure utility functions (formatting, validation, sorting)
  assets/                   Static files (images, icons, fonts)
  App.jsx                   Root component — sets up Router and top-level providers
  main.jsx                  App entry point — mounts <App />
```

### Structure rules

- **Components are grouped by domain** under `components/`: `ui/`, `layout/`, `cinema/`, `swipe/`, `party/`
- **Every page gets its own folder** under `src/pages/` (e.g., `LoginPage/LoginPage.jsx`)
- **No loose files in `src/`** — only `App.jsx`, `main.jsx`, and `index.css` live at the `src/` root
- **Helpers** belong in `src/helpers/` — pure functions only, no side effects
- **Keep the structure flat and clear** — create subfolders only when genuinely needed

---

## Components

- Functional components only — never class components
- One component per file; filename matches the component name (PascalCase)
- Props must be destructured in the function signature
- Keep components small and focused — **split if a component exceeds ~150 lines**
- No inline styles — use Tailwind classes; dynamic values are the only exception
- Build generic reusable components for common UI: `Button`, `Input`, `Modal`, `FormField`
- Avoid prop drilling beyond 2 levels — use Context or custom hooks instead

---

## State Management

Global and shared state is handled via **React Context**. Context files live in `src/context/` and are named in PascalCase with the `Context` suffix: `AuthContext.jsx`.

Each context file exports:
1. The context object (e.g., `AuthContext`)
2. A provider component (e.g., `AuthProvider`)
3. A custom hook for consuming the context (e.g., `useAuth`)

Example pattern:
```jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**Rules:**
- Local UI state (e.g., open/closed, hover) stays in the component with `useState`
- Shared state across multiple components or pages goes into a context file
- Never lift state all the way up to `App.jsx` just to pass it down — use context instead
- Do not use Redux or any external state library
- Use `useMemo` and `useCallback` to avoid unnecessary re-renders where needed
- Extract reusable logic into custom hooks (e.g., `useSwipeQueue`, `useParty`)

---

## API Integration

Base URL comes from `VITE_API_URL` in `.env`. All HTTP calls go through the central Axios instance in `src/services/api.js`.

### `src/services/api.js`

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Service files

One file per resource. Each function maps to one endpoint:

```js
// src/services/authService.js
import api from './api';

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (username, email, password) =>
  api.post('/auth/register', { username, email, password });
```

**Rules:**
- Never call `axios` directly from a component — always go through a service file
- Service functions return the Axios promise; let the caller handle `async/await`
- Always use `try/catch` in async functions that call the API
- Show user-friendly error messages — never expose raw server errors
- Store the JWT token in `localStorage` after login; remove it on logout

---

## Routing

React Router v7 handles all navigation. Route definitions live in `App.jsx`. Use a `ProtectedRoute` component to guard authenticated routes.

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/party/:id" element={<PartyPage />} />
</Route>
```

- Never pass sensitive data in URL parameters
- Use Layout components for shared elements like header and footer
- Unauthenticated users must be redirected to login by `ProtectedRoute`

---

## Forms

- Build reusable form components: `Input`, `Button`, `FormField`, `Modal`
- Validate input on both client and server
- Show clear, inline error messages on validation failure
- Disable the submit button while a form is submitting to prevent double submission
- Use controlled components for all form fields

---

## Error Handling

- Show user-friendly error messages when something goes wrong — never raw server errors
- Always handle loading and error states in components that fetch data
- Handle empty states clearly
- Use an Error Boundary to catch unexpected errors in the component tree
- Never log sensitive information to the console
- Remove all `console.log` statements before committing

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase | `MovieCard.jsx` |
| Component folders | PascalCase | `MovieCard/` |
| Context files | PascalCase + Context | `AuthContext.jsx` |
| Service files | camelCase + Service | `authService.js` |
| Custom hooks | camelCase, `use` prefix | `useAuth.js` |
| Helper functions | camelCase | `formatDate.js` |
| Constants | UPPER_SNAKE_CASE | `MAX_SWIPES` |
| Variables / functions | camelCase | `handleSubmit` |

---

## Code Conventions

- Use `const` by default; `let` only when reassignment is needed; never `var`
- No magic numbers or strings — use named constants
- No comments describing **what** the code does — write self-explanatory code; comment only the **why** when non-obvious
- No `console.log` or commented-out code in committed code
- Use arrow functions for callbacks and components
- Use destructuring for props and state
- Async functions always use `async/await` — never raw `.then()` chains

---

## Git Conventions

### Branches

- `feature/` — new features, e.g. `feature/swipe-view`
- `bugfix/` — bug fixes, e.g. `bugfix/login-error-message`
- `refactor/` — refactoring, e.g. `refactor/extract-form-components`
- `docs/` — documentation, e.g. `docs/update-readme`
- `style/` — styling only, e.g. `style/dashboard-layout`

Use kebab-case, descriptive names. No personal names or dates in branch names.

### Commits

Imperative form in English. Keep commits small and focused — one commit does one thing.

- ✅ `Add MovieCard component with swipe animations`
- ✅ `Fix login redirect after token expiry`
- ❌ `fixed stuff`, ❌ `wip`

### Pull Requests

- All development happens in feature branches — never directly on `main`
- `main` is branch-protected — no direct pushes
- Each feature/bugfix/task must be linked to a GitHub Issue
- At least one other team member must approve a PR before merge
- Reviewer checks: naming conventions, readability, no dead code or `console.log`, error/loading states handled, components reusable where appropriate, clean commit history
- The author fixes all review feedback before merge

---

## Environment Variables

- API URL and other config values go in `.env`
- Commit `.env.example` with dummy values — never commit `.env` with real values
- All Vite env vars must start with `VITE_`, e.g. `VITE_API_URL`

---

## Authentication

- JWT token stored in `localStorage` (HttpOnly cookies preferred long-term, not yet implemented)
- Logout clears the token and redirects to the login page
- Protect all authenticated pages with `ProtectedRoute` — redirect to login if not authenticated

---

## Join Code Format

6 characters, uppercase. Alphabet: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous chars — no O/0, I/1).

---

## Things to Avoid

- ❌ Class components
- ❌ Inline styles (except for truly dynamic values)
- ❌ Raw CSS transitions for curtain or swipe animations — use Framer Motion
- ❌ Calling Axios directly from a component
- ❌ Raw `.then()` chains — use `async/await`
- ❌ Redux or any external state library
- ❌ Prop drilling beyond 2 levels
- ❌ `console.log` or commented-out code in committed code
- ❌ Sensitive data beyond the JWT token in `localStorage`
- ❌ Committing `.env` files with real values
- ❌ Components exceeding ~150 lines without splitting

---

## Backend API Contract

The backend exposes the following endpoints. All error responses are JSON arrays of error objects. Authenticated endpoints require `Authorization: Bearer <token>`.

### Error response format

```json
[
  {
    "code": "User.EmailAlreadyExists",
    "description": "An account with this email already exists",
    "type": 4,
    "numericType": 4
  }
]
```

Unhandled server errors return:

```json
{
  "status": 500,
  "title": "An error occurred while processing your request",
  "traceId": "...",
  "detail": "..."
}
```

### HTTP status code mapping

| Status | When |
|--------|------|
| 200 | Success with response body |
| 204 | Success, no response body |
| 400 | Validation error or invalid business operation |
| 401 | Missing/invalid JWT or wrong credentials |
| 403 | Authenticated but not authorized for this action |
| 404 | Resource not found |
| 409 | Conflict (duplicate, already done, etc.) |
| 500 | Unexpected server error |

---

### Auth endpoints — `/api/auth` (public)

#### `POST /api/auth/register`

**Request:**
```json
{ "username": "string", "email": "string", "password": "string" }
```
Validation: username 3–20 chars, valid email, password 6–100 chars.

**200 OK:**
```json
{ "id": "uuid", "username": "string", "email": "string", "role": 0, "createdAt": "datetime" }
```
**Errors:** `400` validation | `409 User.EmailAlreadyExists` | `409 User.UsernameAlreadyExists`

---

#### `POST /api/auth/login`

**Request:**
```json
{ "email": "string", "password": "string" }
```
**200 OK:**
```json
{
  "token": "jwt-string",
  "user": { "id": "uuid", "username": "string", "email": "string", "role": 0, "createdAt": "datetime" }
}
```
**Errors:** `400` validation | `401 Auth.InvalidCredentials`

---

#### `POST /api/auth/forgot-password`

**Request:**
```json
{ "email": "string" }
```
**200 OK:** raw Base64 token string (dev mode — production sends by email).
**Errors:** `400` validation | `404 User.NotFound`

---

#### `POST /api/auth/reset-password`

**Request:**
```json
{ "token": "string", "newPassword": "string" }
```
Validation: newPassword 8–100 chars.
**204 No Content** on success.
**Errors:** `400` validation | `400 PasswordReset.InvalidOrExpiredToken`

---

### Users endpoints — `/api/users` (JWT required)

#### `GET /api/users/me`

**200 OK:**
```json
{ "id": "uuid", "username": "string", "email": "string", "role": 0, "createdAt": "datetime" }
```
**Errors:** `401` | `404 User.NotFound`

---

### WatchParties endpoints — `/api/watchparties` (JWT required)

#### `POST /api/watchparties`

No request body.
**200 OK:**
```json
{
  "id": "uuid", "joinCode": "ABC123", "hostUsername": "string",
  "genre": "popular", "isActive": true, "createdAt": "datetime", "memberCount": 1
}
```
**Errors:** `401 WatchParty.Unauthorized`

---

#### `POST /api/watchparties/join`

**Request:**
```json
{ "joinCode": "string" }
```
Validation: exactly 6 characters.
**200 OK:** same shape as `WatchPartyDto` above.
**Errors:** `400` validation | `401 WatchParty.Unauthorized` | `404 WatchParty.JoinCodeNotFound`

---

#### `POST /api/watchparties/{id}/leave`

No request body.
**200 OK:** empty object `{}`
**Errors:** `401 WatchParty.Unauthorized` | `403 WatchParty.UserNotMember` | `404 WatchParty.NotFound` | `409 WatchParty.HostCannotLeave`

---

#### `GET /api/watchparties/{id}`

**200 OK:**
```json
{
  "id": "uuid", "joinCode": "ABC123", "hostUsername": "string",
  "genre": "popular", "isActive": true, "createdAt": "datetime", "memberCount": 2,
  "members": [
    { "userId": "uuid", "username": "string", "joinedAt": "datetime", "isActive": true }
  ]
}
```
`members` includes all past members — check `isActive` to filter current ones.
**Errors:** `401 WatchParty.Unauthorized` | `403 WatchParty.UserNotMember` | `404 WatchParty.NotFound`

---

### Swipes endpoints — `/api/swipes` (JWT required)

#### `POST /api/swipes`

**Request:**
```json
{ "watchPartyId": "uuid", "movieId": "uuid", "isLiked": true }
```
**200 OK:**
```json
{
  "isMatch": false,
  "matchedMovie": null
}
```
If `isMatch` is `true`, `matchedMovie` is a `MovieDto`:
```json
{
  "id": "uuid", "tmdbId": 12345, "title": "string",
  "posterUrl": "string", "overview": "string", "releaseYear": 2024
}
```
**Errors:** `400` validation | `400 Swipe.MovieNotInParty` | `401 Swipe.Unauthorized` | `403 Swipe.NotMemberOfParty` | `409 Swipe.AlreadySwiped`

---

#### `GET /api/swipes/queue/{watchPartyId}?count=10`

Query param `count` defaults to 10.
**200 OK:** array of `MovieDto` objects (empty array when queue is exhausted).
**Errors:** `401 Swipe.Unauthorized` | `403 Swipe.NotMemberOfParty`

---

### Matches endpoints — `/api/matches` (JWT required)

#### `GET /api/matches/party/{watchPartyId}`

**200 OK:** array of `MatchDto` objects, newest first.
```json
[
  {
    "id": "uuid", "watchPartyId": "uuid", "movieId": "uuid",
    "matchedAt": "datetime", "isWatched": false,
    "watchedByUserId": null, "watchedAt": null
  }
]
```
**Errors:** `401 Match.Unauthorized` | `403 Match.NotMemberOfParty`

---

#### `POST /api/matches/{matchId}/watched`

No request body.
**200 OK:** `MatchDto` with `isWatched: true`, `watchedByUserId` and `watchedAt` filled in.
**Errors:** `401 Match.Unauthorized` | `403 Match.NotMemberOfParty` | `404 Match.NotFound` | `409 Match.AlreadyWatched`

---

### All error codes

| Code | HTTP | Description |
|------|------|-------------|
| `Auth.InvalidCredentials` | 401 | Invalid email or password |
| `User.EmailAlreadyExists` | 409 | An account with this email already exists |
| `User.UsernameAlreadyExists` | 409 | This username is already taken |
| `User.NotFound` | 404 | The requested user was not found |
| `PasswordReset.InvalidOrExpiredToken` | 400 | The password reset token is invalid, expired, or has already been used |
| `WatchParty.NotFound` | 404 | The requested WatchParty was not found |
| `WatchParty.JoinCodeNotFound` | 404 | The requested join code was not found |
| `WatchParty.UserNotMember` | 403 | The user is not a member of the requested WatchParty |
| `WatchParty.HostCannotLeave` | 409 | The host is not allowed to leave the party |
| `WatchParty.Unauthorized` | 401 | The user is unauthorized |
| `Swipe.Unauthorized` | 401 | The user is unauthorized |
| `Swipe.NotMemberOfParty` | 403 | The user is not an active member of this party |
| `Swipe.AlreadySwiped` | 409 | The user has already swiped on this movie in this party |
| `Swipe.MovieNotInParty` | 400 | The movie is not part of this party's queue |
| `Match.Unauthorized` | 401 | The user is unauthorized |
| `Match.NotMemberOfParty` | 403 | The user is not an active member of this party |
| `Match.NotFound` | 404 | The requested match was not found |
| `Match.AlreadyWatched` | 409 | This match has already been marked as watched |
