# CLAUDE.md — CineMatch Frontend

This document provides Claude (and other AI assistants) with context about the CineMatch frontend project. Read this before suggesting code, making changes, or creating new files.

## Project Overview

CineMatch is a web application where multiple users join a "WatchParty" and swipe on movies together (Tinder-style). When all members of the party have liked the same movie, a match is created and shown to everyone. This repository contains only the frontend. The backend (ASP.NET Core / .NET 10) lives in a separate repository.

## Tech Stack

- **React 19** (functional components only — no class components)
- **Vite** — build tool and dev server
- **JavaScript / JSX** — no TypeScript
- **React Router v7** — client-side routing
- **Axios** — HTTP client for API calls
- **Vanilla CSS** — scoped per component, no CSS frameworks (no Tailwind, no shadcn/ui)
- **ESLint** — flat config with React hooks and React refresh plugins

---

## Project Structure

**All source code lives under `src/`.** No exceptions.

```
CineMatch/
  src/
    components/         # Reusable UI components
      Button/
        Button.jsx
        Button.css
      MovieCard/
        MovieCard.jsx
        MovieCard.css
    pages/              # Page-level components (one folder per page/route)
      Login/
        Login.jsx
        Login.css
      Register/
        Register.jsx
        Register.css
      WatchParty/
        WatchParty.jsx
        WatchParty.css
    context/            # React Context files for global/shared state
      userContext.jsx
      watchPartyContext.jsx
    services/           # Axios API calls, one file per resource
      api.js            # Central Axios instance with interceptors
      authService.js
      watchPartyService.js
      swipeService.js
      matchService.js
    hooks/              # Custom hooks
      useAuth.js
      useWatchParty.js
    assets/             # Static files (images, icons, fonts)
  index.css             # Global CSS variables and resets only
  main.jsx              # App entry point — mounts <App />
  App.jsx               # Root component — sets up Router and top-level context providers
  public/
  index.html
```

### Rules — Structure

- **Every component gets its own folder.** A component named `MovieCard` lives in `src/components/MovieCard/` and contains at minimum `MovieCard.jsx` and `MovieCard.css`.
- **Every page gets its own folder** under `src/pages/`, following the same folder + CSS rule.
- **No component, page, or style file lives loose in `src/`** — only `App.jsx`, `main.jsx`, and `index.css` are allowed at the `src/` root level.
- **CSS is co-located:** `MovieCard.css` lives next to `MovieCard.jsx`, not in a separate `styles/` folder.
- **`index.css`** is for global resets and CSS custom properties (variables) only — no component styles.

---

## Components

- Functional components only — never class components
- One component per file, filename matches the component name (PascalCase)
- Import the component's CSS file at the top of the JSX file:
  ```jsx
  import './MovieCard.css';
  ```
- Props should be destructured in the function signature
- Keep components small and focused — extract sub-components if a component grows beyond ~100 lines
- No inline styles — all styling goes in the CSS file

---

## State Management

Global and shared state is handled via **React Context**. Context files live in `src/context/` and are named in camelCase with the `Context` suffix: `userContext.jsx`, `watchPartyContext.jsx`.

Each context file exports:
1. The context object (e.g., `UserContext`)
2. A provider component (e.g., `UserProvider`)
3. A custom hook for consuming the context (e.g., `useUser`)

Example pattern:
```jsx
// src/context/userContext.jsx
import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
```

**Rules:**
- Local UI state (e.g., open/closed, hover) stays in the component with `useState`
- State that is shared across multiple components or pages goes into a context file
- Never lift state all the way up to `App.jsx` just to pass it down — use context instead
- Do not use Redux or any external state library

---

## API Integration

The backend base URL is `http://localhost:5000/api` (dev). All HTTP calls go through the central Axios instance in `src/services/api.js`.

### `src/services/api.js` — Central Axios instance
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Attach JWT token on every request
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
One service file per resource. Each function maps to one endpoint:
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
- Service functions return the Axios promise; let the caller handle `.then`/`catch` or `async/await`
- Store the JWT token in `localStorage` after login; remove it on logout

---

## Routing

React Router v7 handles all navigation. Route definitions live in `App.jsx`. Use a `ProtectedRoute` component to guard authenticated routes.

```jsx
// Pattern for protected routes
<Route element={<ProtectedRoute />}>
  <Route path="/watchparty/:id" element={<WatchParty />} />
</Route>
```

---

## Naming Conventions

| Thing                  | Convention          | Example                    |
|------------------------|---------------------|----------------------------|
| Component files        | PascalCase          | `MovieCard.jsx`            |
| Component folders      | PascalCase          | `MovieCard/`               |
| CSS files              | PascalCase (match)  | `MovieCard.css`            |
| Context files          | camelCase + Context | `userContext.jsx`          |
| Service files          | camelCase + Service | `authService.js`           |
| Custom hooks           | camelCase, `use` prefix | `useAuth.js`           |
| CSS class names        | kebab-case          | `.movie-card-title`        |
| Constants              | UPPER_SNAKE_CASE    | `MAX_SWIPES`               |
| Variables / functions  | camelCase           | `handleSubmit`             |

---

## Code Conventions

- No comments that describe **what** the code does — use self-explanatory names
- Add a comment only when the **why** is non-obvious
- No magic numbers or strings — use named constants
- Async functions always use `async/await`, never raw `.then()` chains
- Always handle loading and error states in components that fetch data
- Never commit `.env` files — use `.env.example` as a template

---

## Things to Avoid

- ❌ Class components
- ❌ Inline styles (`style={{ color: 'red' }}`)
- ❌ Loose files in `src/` (components/pages must be in their own folder)
- ❌ CSS in `index.css` beyond global variables and resets
- ❌ Calling Axios directly from components
- ❌ Storing sensitive data beyond the JWT token in `localStorage`
- ❌ Using Redux or any external state library
- ❌ Committing secrets or `.env` files

---

## Git Conventions

### Branches
- `feature/` — new features
- `bugfix/` — bug fixes
- `refactor/` — refactoring
- `docs/` — documentation
- `style/` — styling only

Use kebab-case, descriptive names.

### Commits
Imperative form in English:
- ✅ `Add MovieCard component with swipe animations`
- ✅ `Fix login redirect after token expiry`
- ❌ `fixed stuff`, ❌ `wip`

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
| Status | When                                             |
|--------|--------------------------------------------------|
| 200    | Success with response body                       |
| 204    | Success, no response body                        |
| 400    | Validation error or invalid business operation   |
| 401    | Missing/invalid JWT or wrong credentials         |
| 403    | Authenticated but not authorized for this action |
| 404    | Resource not found                               |
| 409    | Conflict (duplicate, already done, etc.)         |
| 500    | Unexpected server error                          |

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

| Code                                  | HTTP | Description                                                            |
|---------------------------------------|------|------------------------------------------------------------------------|
| `Auth.InvalidCredentials`             | 401  | Invalid email or password                                              |
| `User.EmailAlreadyExists`             | 409  | An account with this email already exists                              |
| `User.UsernameAlreadyExists`          | 409  | This username is already taken                                         |
| `User.NotFound`                       | 404  | The requested user was not found                                       |
| `PasswordReset.InvalidOrExpiredToken` | 400  | The password reset token is invalid, expired, or has already been used |
| `WatchParty.NotFound`                 | 404  | The requested WatchParty was not found.                                |
| `WatchParty.JoinCodeNotFound`         | 404  | The requested join code was not found.                                 |
| `WatchParty.UserNotMember`            | 403  | The user is not a member of the requested WatchParty.                  |
| `WatchParty.HostCannotLeave`          | 409  | The host is not allowed to leave the party.                            |
| `WatchParty.Unauthorized`             | 401  | The user is unauthorized.                                              |
| `Swipe.Unauthorized`                  | 401  | The user is unauthorized.                                              |
| `Swipe.NotMemberOfParty`             | 403  | The user is not an active member of this party.                        |
| `Swipe.AlreadySwiped`                 | 409  | The user has already swiped on this movie in this party.               |
| `Swipe.MovieNotInParty`              | 400  | The movie is not part of this party's queue.                           |
| `Match.Unauthorized`                  | 401  | The user is unauthorized.                                              |
| `Match.NotMemberOfParty`             | 403  | The user is not an active member of this party.                        |
| `Match.NotFound`                      | 404  | The requested match was not found.                                     |
| `Match.AlreadyWatched`               | 409  | This match has already been marked as watched.                         |
