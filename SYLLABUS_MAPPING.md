# Hack-o-Week Syllabus → Code Mapping

Where each Semester III topic is demonstrated in CampusConnect. Paths are relative to the project root.

## 1. HTML5 & Accessibility

| Topic | Where | Notes |
| --- | --- | --- |
| Semantic elements | `client/src/components/layout/AppShell.jsx`, `Sidebar.jsx`, `Topbar.jsx`, `pages/Events/EventDetail.jsx` | `<main>`, `<aside>`, `<nav>`, `<header>`, `<article>`, `<section>`, `<figure>`, `<time>`, `<dl>` |
| Accessible forms & labels | `client/src/components/ui/Form.jsx` | Every control has a `<label>`; errors linked via `aria-describedby`; `aria-invalid`, `aria-required` |
| Fieldsets / radio groups | `pages/Feedback/FeedbackPage.jsx`, `pages/Study/StudyForms.jsx` | `<fieldset>` + `<legend>` for category, rating and colour pickers |
| ARIA | `components/ui/Progress.jsx`, `Filters.jsx`, `Modal.jsx`, `Toaster.jsx` | `role="progressbar"`, `role="radiogroup"`, `role="dialog"` + `aria-modal`, `aria-live` regions |
| Keyboard navigation | `components/ui/Modal.jsx`, `hooks/useDomEvents.js`, `components/layout/AppShell.jsx` | Focus trap + Escape in dialogs, `/` shortcut, skip-to-content link, visible `:focus-visible` rings |

## 2. CSS3

| Topic | Where |
| --- | --- |
| CSS custom properties (design tokens, themes) | `client/src/styles/global.css` (`:root` and `[data-theme='dark']`) |
| Flexbox | `components/ui/Button.module.css`, `Tasks.module.css` (task rows), `Sidebar.module.css` |
| Grid (incl. `grid-template-areas`, `auto-fill`) | `pages/Dashboard/Dashboard.module.css`, `Events.module.css`, `Study.module.css` |
| Responsive design / media queries | Every module; sidebar becomes a drawer below 960 px (`Sidebar.module.css`) |
| Transitions, keyframes, reduced motion | `Modal.module.css`, `States.module.css` (skeleton shimmer), `global.css` (`prefers-reduced-motion`) |
| Modern selectors | `:has()` in `Study.module.css` and `Feedback.module.css`, `color-mix()` in several modules |

## 3. Modern JavaScript (ES6+)

| Topic | Example location |
| --- | --- |
| ES modules (`import`/`export`) | All of `client/src/` |
| Arrow functions | `client/src/api/client.js` (`api.get = (path, options) => …`) |
| Template literals | `utils/format.js`, `pages/Events/EventDetail.jsx` (building the `.ics` file) |
| Destructuring | `pages/Dashboard/Dashboard.jsx` (`const { stats, dueSoon, … } = data`), `TaskForm.jsx` (`toPayload`) |
| Spread / rest | `TasksPage.jsx` (`{ id, createdAt, updatedAt, ...restorable }`), `api/client.js` |
| Array methods (`map`, `filter`, `reduce`, `find`, `sort`, `some`) | `TasksPage.jsx` (`visibleTasks`), `server/src/routes/resources.js` (`reduce` for counts) |
| Object methods (`Object.entries`, `fromEntries`) | `utils/subjects.js` (`indexById`), `utils/validation.js` |

## 4. DOM, Events & Asynchronous JavaScript

| Topic | Where |
| --- | --- |
| DOM manipulation | `pages/Events/EventDetail.jsx` (creates an `<a>` element to download a Blob), `context/ThemeContext.jsx` (sets `data-theme`, updates `<meta>`), `hooks/useDomEvents.js` (`document.title`) |
| Browser events | `hooks/useDomEvents.js`: `keydown`, `pointerdown` (click outside), `online`/`offline`; `matchMedia` change listener in `ThemeContext.jsx` |
| Fetch API | `client/src/api/client.js` |
| Promises / `Promise.all` | `pages/Tasks/TasksPage.jsx`, `pages/Study/StudyOverview.jsx`, `pages/Resources/ResourcesPage.jsx` |
| async/await + error handling | `api/client.js` (`ApiError`, network failure message), every mutation handler (try/catch with rollback) |
| Request cancellation | `hooks/useApi.js` (`AbortController`) |
| localStorage | `hooks/useLocalStorage.js`; used for theme, task filters, saved resources, feedback draft. Cleared from `pages/Settings/PreferenceSettings.jsx` |

## 5. React

| Topic | Where |
| --- | --- |
| Reusable functional components | `client/src/components/ui/*` (Button, Card, Modal, Form, Badge, Progress, States…) |
| `useState` / `useEffect` | Throughout; e.g. `TasksPage.jsx`, `ThemeContext.jsx` |
| `useRef` | `Modal.jsx` (focus trap, restore focus, latest callback), `TasksPage.jsx` (focus search), `FeedbackPage.jsx` (focus first invalid field), `useApi.js` (AbortController) |
| `useMemo` | `TasksPage.jsx` (filtered/sorted tasks, counts), `StudyOverview.jsx` (deadlines), `WeeklyChart.jsx` |
| `useCallback` | `TasksPage.jsx` (stable handlers for `memo(TaskItem)`), `useSessionActions.js`, `ProfileContext.jsx` |
| `useContext` / Context API | `context/ThemeContext.jsx`, `ProfileContext.jsx`, `ToastContext.jsx` |
| Custom Hooks | `hooks/useApi.js` (main one: data, loading, error, reload, optimistic `setData`), `useLocalStorage.js`, `useDebounce.js`, `useDomEvents.js`, `pages/Study/useSessionActions.js`, `pages/Events/useRegistration.js` |
| `memo` | `pages/Tasks/TaskItem.jsx` |
| Prop drilling vs shared context | `pages/Tasks/TaskList.jsx` (commented example: callbacks drilled to `TaskItem`) vs `Sidebar.jsx` / `Topbar.jsx` reading `useProfile()` |
| React Router: routes & navigation | `client/src/App.jsx`, `NavLink` in `Sidebar.jsx`, `useNavigate` in `SubjectDetail.jsx`, `NotFound.jsx` |
| Nested routes + `<Outlet>` | `/study/*` (`StudyLayout.jsx` shares data with `useOutletContext`), `/settings/*` (`SettingsLayout.jsx`), `AppShell.jsx` |
| Route parameters | `/study/subjects/:subjectId`, `/events/:eventId`, `/resources/:category` (`useParams`) |
| Query parameters | `/events?category=…&registered=1`, `/tasks?new=1` (`useSearchParams`) |
| Code splitting | `React.lazy` + `Suspense` in `App.jsx` / `AppShell.jsx` |
| Portals | `components/ui/Modal.jsx` (`createPortal`) |

## 6. Styling Approaches

| Topic | Where / how |
| --- | --- |
| CSS Modules (primary) | Every `*.module.css` file; class names are locally scoped and imported as `styles.x` |
| Tailwind CSS concepts | Not installed (as requested). The token scale in `global.css` (`--sp-1…--sp-10`, `--fs-xs…--fs-2xl`, `--radius-*`, `--shadow-*`) mirrors a Tailwind theme config, so utilities like `p-4` / `text-sm` map 1:1 to tokens |
| styled-components concepts | Not installed. Variant-driven components (`Button` `variant`/`size` props, `Badge` `tone`) and theme tokens via CSS variables are the same pattern as a `ThemeProvider` + prop-based styles |

## 7. Node.js

| Topic | Where |
| --- | --- |
| Node runtime, CommonJS (`require` / `module.exports`) | All of `server/` (`"type": "commonjs"` in `server/package.json`) |
| `fs` module (async) | `server/src/db/store.js` (`fs/promises`: read, write, rename, mkdir, access) |
| `fs` module (sync, startup only) | `server/src/utils/env.js` (.env loader) |
| `path` module | `server/src/config.js`, `server/src/app.js` (serving `client/dist`), `scripts/reset-db.js` |
| `process` | `config.js` (`process.env`), `server.js` (`SIGINT`/`SIGTERM`, `unhandledRejection`, `process.exit`), `app.js` (`process.uptime`, `process.version`), `requestLogger.js` (`process.hrtime`), `scripts/reset-db.js` (`process.argv`) |
| Basic `http` server | `server/examples/basic-http-server.js` — manual routing, JSON parsing and status codes, kept separate from Express (`npm run demo:http`) |
| npm configuration | Root, `server/` and `client/` `package.json` files with scripts, `engines`, dependencies vs devDependencies |
| Built-in test runner | `server/tests/api.test.js` (`node:test`, `node:assert`) |

## 8. Express.js & REST API

| Topic | Where |
| --- | --- |
| App setup, middleware order | `server/src/app.js` |
| Routers & route modules | `server/src/routes/*.js` mounted under `/api` |
| HTTP methods & status codes | GET 200, POST 201 (+ `Location` header), PUT/PATCH 200, DELETE 204, 400, 404, 409, 413, 500 |
| Request handling (`params`, `query`, `body`) | `routes/tasks.js` (filters from `req.query`), `middleware/findById.js` (`req.params`) |
| Reusable middleware | `validate.js` (schema validation), `findById.js` (load or 404), `requestLogger.js`, `asyncHandler.js` |
| Input validation | `server/src/validators/schemas.js` + `middleware/validate.js` (types, lengths, enums, real calendar dates, emails, arrays) |
| Centralised error handling | `middleware/errorHandlers.js` (unknown routes → 404 JSON; malformed JSON → 400; hides internals in production) |
| Async operations | All writes go through the async store (`await store.update(...)`) |
| Persistence & seed data | `db/store.js`, `db/seed.js`, `scripts/reset-db.js` |

## 9. Code Management

| Topic | Where |
| --- | --- |
| Repository organisation | Separate `client/` and `server/` packages, root scripts (see README §4) |
| `.gitignore` | Root `.gitignore` (node_modules, build output, runtime DB, env files) |
| Git/GitHub commands: branches, commits, merging, pull requests | README §7 |
