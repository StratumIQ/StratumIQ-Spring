# New Developer Onboarding

What is it?
- A step-by-step checklist and friendly guide for a new engineer to go from zero to running the app and making a small change.

Why do we need it?
- Onboarding reduces ramp time and makes sure new joiners can contribute and test changes quickly.

How does it work?
- The checklist covers environment setup, running frontend and backend, finding key files, and a small first task (fix a typo or change a label).

Checklist (practical)
1. Clone the repo and open in VS Code.
2. Install frontend deps: `cd frontend && npm install`.
3. Start frontend dev server: `npm run dev` (check frontend/README for exact command).
4. Install backend deps: use the provided `mvnw` wrapper: `cd backend && ./mvnw spring-boot:run` (on Windows use `mvnw.cmd`).
5. Open the dashboard in your browser and use devtools to explore network calls.

First small task (example)
- Change the heading text on the Fleet page: edit `frontend/src/app/dashboard/fleet/page.tsx`, update the JSX, and reload the page.

Files to know right away
- Frontend entry: `frontend/src/app/page.tsx`
- Main backend controller folder: `backend/src/main/java`
- DB migrations: `backend/src/main/resources/db/migration`

Technical explanation
- Use the provided `mvnw` to avoid installing a specific Maven globally. The frontend uses Next.js; `npm install` and `npm run dev` are sufficient for most local work. Environment variables are supplied via `.env.local` if present.

Helpful tips
- Use the browser network tab to match frontend requests with backend controllers.
- Run unit tests locally where available.

If you get stuck: open an issue in the internal tracker with steps to reproduce and logs.
