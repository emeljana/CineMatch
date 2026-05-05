# Kodregler och projektstandard - Cinematch Frontend

Detta dokument beskriver de kodregler, konventioner och standarder som gäller för frontend-delen av Cinematch (React-applikationen). Alla i gruppen förväntas följa dessa regler för att hålla en hög och konsekvent kodkvalitet.

## Allmänna regler

### Versionshantering och Git

- All utveckling sker i feature branches, aldrig direkt på `main`.
- `main` är skyddad med branch protection rules. Ingen kan pusha direkt till main.
- Varje feature, bugfix eller task ska kopplas till en GitHub Issue.
- Pull requests krävs för all kod som mergas till `main`.
- Minst en annan gruppmedlem ska godkänna en PR innan merge.

### Branch-namngivning

Använd följande prefix för branch-namn:

- `feature/` för nya funktioner, t.ex. `feature/swipe-view`
- `bugfix/` för buggfixar, t.ex. `bugfix/login-error-message`
- `refactor/` för refaktorering, t.ex. `refactor/extract-form-components`
- `docs/` för dokumentation, t.ex. `docs/update-readme`
- `style/` för styling-ändringar, t.ex. `style/dashboard-layout`

Använd kebab-case och beskrivande namn. Inga personnamn eller datum i branch-namn.

### Commit-meddelanden

Skriv meningsfulla commit-meddelanden i imperativ form på engelska:

- Bra: `Add login form with validation`
- Bra: `Fix infinite loop in useFetchMovies hook`
- Dåligt: `fixed stuff`
- Dåligt: `wip`

Håll commits små och fokuserade. En commit ska göra en sak.

### GitHub Project Board

- Alla tasks ska finnas som issues på Project Boarden.
- Issues ska ha tydliga beskrivningar och acceptanskriterier.
- Använd labels för att kategorisera (frontend, bug, feature, docs, style).
- Flytta issues mellan kolumner (Todo, In Progress, Review, Done) under arbetets gång.
- Tilldela issues till den som arbetar med dem.

## Filstruktur

```
src/
  components/      Återanvändbara komponenter
    ui/            Generiska UI-komponenter (Button, Input, Modal)
    layout/        Layout-komponenter (Header, Footer, Sidebar)
  pages/           Sidor som motsvarar routes
  hooks/           Custom hooks
  services/        API-anrop med Axios
  helpers/         Hjälpfunktioner
  context/         React Context providers
  styles/          Globala stilar
  App.jsx
  main.jsx
```

Håll strukturen platt och tydlig. Skapa undermappar först när det behövs.

## Namnkonventioner

- Komponenter: `PascalCase`, t.ex. `MovieCard.jsx`
- Hooks: `camelCase` med `use`-prefix, t.ex. `useAuth.js`
- Hjälpfunktioner: `camelCase`, t.ex. `formatDate.js`
- Services: `camelCase` med `Service`-suffix, t.ex. `watchPartyService.js`
- Konstanter: `UPPER_SNAKE_CASE`
- En komponent per fil. Filnamnet matchar komponentnamnet.

## Allmänna kodregler

- Använd `const` som default. Använd `let` bara när variabeln behöver omtilldelas. Aldrig `var`.
- Inga magic numbers eller magic strings. Använd konstanter.
- Undvik kommentarer som beskriver vad koden gör. Skriv koden så att den är självförklarande. Kommentarer ska användas för att förklara varför, inte vad.
- Inga `console.log` eller kommenterad kod i committad kod.
- Använd arrow functions för callbacks och komponenter.
- Använd destrukturering för props och state där det är läsbart.

## Komponenter

- Använd funktionskomponenter och hooks. Inga klasskomponenter.
- Bryt ut återanvändbara delar i egna komponenter.
- En komponent ska göra en sak. Om en komponent blir för stor (mer än ca 150 rader), dela upp den.
- Props ska vara tydligt namngivna. Använd destrukturering: `function MovieCard({ title, posterUrl })`.
- Undvik prop drilling i flera nivåer. Använd Context eller custom hooks istället.
- Skapa generiska komponenter för formulär, tabeller, modaler, knappar och inputs (VG-krav).

## State och hooks

- Använd `useState` för lokal state.
- Använd `useEffect` för side effects (API-anrop, prenumerationer).
- Bryt ut återanvändbar logik i custom hooks, t.ex. `useFetchMovies`, `useAuth`.
- Använd `useContext` för global state som auth eller tema.
- Använd `useMemo` och `useCallback` för att undvika onödiga re-renders när det behövs.
- Lyft state uppåt bara när flera komponenter behöver den. Annars håll state lokal.

## API-kommunikation

- All kommunikation med backend sker via Axios.
- Skapa en central Axios-instans med base URL och interceptors i `services/api.js`.
- Skapa separata service-filer per resurs, t.ex. `services/watchPartyService.js`, `services/movieService.js`.
- Använd alltid try/catch i async-funktioner som anropar API:et.
- Hantera fel användarvänligt och visa tydliga felmeddelanden, aldrig råa fel från servern.
- Lägg JWT-token i en interceptor så den automatiskt skickas med varje request.

## Styling

- Använd den valda design libraryn (Tailwind CSS, shadcn/ui, eller liknande) konsekvent.
- Undvik inline-stilar utom för dynamiska värden.
- Inga blinkande element eller starka färgkombinationer som stör.
- Sträva efter en modern och ren design.
- Var konsekvent med spacing, färger och typografi.
- Bygg responsivt så appen fungerar på både desktop och mobil.

## Formulär

- Skapa återanvändbara form-komponenter (`Input`, `Button`, `Form`, `FormField`).
- Validera input både på klient och server.
- Visa tydliga felmeddelanden vid valideringsfel.
- Disabla submit-knappen när formuläret skickas för att undvika dubbelinlämning.
- Använd controlled components för formulärfält.

## Routing och navigation

- Använd React Router för all routing.
- Skydda routes som kräver inloggning med en `ProtectedRoute`-komponent.
- Skicka aldrig känslig data i URL-parametrar.
- Använd Layout-komponenter för delade element som header och footer.

## Felhantering

- Visa användarvänliga felmeddelanden när något går fel.
- Hantera laddningstillstånd (loading) och tomma tillstånd (empty state) tydligt.
- Använd en Error Boundary för att fånga oväntade fel i komponentträdet.
- Logga inte känslig information till console.

## Hjälpfunktioner

- Bryt ut logik som inte hör hemma i komponenter till `helpers/`-mappen.
- Exempel: datumformatering, validering, sortering, filtrering.
- Hjälpfunktioner ska vara rena (samma input ger alltid samma output, inga side effects).

## Miljövariabler

- Lägg API-URL och andra känsliga värden i `.env`-filer.
- Skapa en `.env.example` med dummy-värden som checkas in i repot.
- Aldrig commita `.env` med riktiga värden. Lägg den i `.gitignore`.
- Variabler i Vite ska börja med `VITE_`, t.ex. `VITE_API_URL`.

## Authentication

- Spara JWT-token i en säker plats (helst HttpOnly cookies, alternativt localStorage).
- Implementera logout som rensar token och redirectar till login-sidan.
- Implementera Login, Register och Reset Password kopplat till backend (VG-krav).
- Skydda sidor som kräver inloggning så användare omdirigeras till login om de inte är inloggade.

## Dokumentation

### README

Repot ska ha en README som innehåller:

- Projektets namn och kort beskrivning
- Tekniker och bibliotek som används (React, Vite, Axios, Tailwind, etc.)
- Förutsättningar (t.ex. Node 20+)
- Steg-för-steg-instruktioner för att starta projektet lokalt
- Hur man konfigurerar `.env`
- Länk till backend-repot

## Code Review

Vid pull requests ska reviewern kontrollera:

- Följs namnkonventioner och kodstil?
- Är komponenter läsbara och välorganiserade?
- Finns onödig kod, console-utskrifter eller kommenterad kod?
- Hanteras fel och laddningstillstånd korrekt?
- Är komponenter återanvändbara där de borde vara?
- Bryter någon komponent mot single-responsibility (gör för många saker)?
- Är commit-historiken ren och meningsfull?

Reviewer ska ge konstruktiv feedback. Den som gjort PR:en åtgärdar feedback innan merge.

## Sammanfattning

Vi prioriterar läsbarhet, struktur och teamwork framför att skriva mycket kod snabbt. Bättre att stanna upp och diskutera ett designval än att merga något ingen förstår. Om du är osäker på något, fråga gruppen istället för att gissa.
