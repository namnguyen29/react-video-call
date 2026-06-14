# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the application code. Use `src/routes/` for TanStack Router file-based routes, `src/pages/` for page-level UI, `src/components/` for reusable components, `src/hooks/` for React hooks, and `src/lib/` for Firebase and WebRTC helpers. Shared constants live in `src/constants/`. Static assets belong in `public/`. Build output is generated in `dist/` and should not be edited manually. Treat `src/routeTree.gen.ts` as generated code; update routes through files in `src/routes/` and run route generation instead.

## Build, Test, and Development Commands
Use `npm run dev` to start the Vite dev server on port `3500`. Run `npm run build` for a production bundle and `npm run preview` to serve that build locally. Use `npm run generate-routes` after adding, renaming, or removing route files. `npm run lint` runs ESLint, `npm run check` verifies Prettier formatting, and `npm run format` applies Prettier and ESLint fixes. `npm run test` runs the Vitest suite.

## Coding Style & Naming Conventions
This repo uses TypeScript, React 19, and strict compiler settings. Prettier enforces 2-space indentation, single quotes, no semicolons, trailing commas, and a `120` character print width. Prefer PascalCase for React components (`VideoCallPage.tsx`), `kebab-case` for hooks and route files (`use-webrtc.ts`, `video-call.tsx`), and descriptive exported function names. Use the existing path aliases `@/` and `#/` for imports from `src/`.

## Testing Guidelines
Vitest and Testing Library are installed, but there are currently no committed test files. Add tests alongside the feature they cover using names like `component.test.tsx` or `module.test.ts`. Focus first on hook behavior, route flows, and Firebase/WebRTC edge cases. Run `npm run test` before opening a pull request.

## Commit & Pull Request Guidelines
The Git history currently starts with a single `first commit`, so there is no strong house style yet. Use short, imperative commit subjects such as `Add room status panel` or `Fix join-room validation`. Pull requests should include a clear summary, testing notes, linked issues when relevant, and screenshots or short recordings for UI changes.

## Configuration & Generated Files
Firebase expects `VITE_FIREBASE_PROJECT_ID` in `.env`. Do not commit secrets. Keep generated or local-only directories such as `dist/`, `.firebase/`, and `node_modules/` out of review unless the change explicitly targets build or deployment behavior.
