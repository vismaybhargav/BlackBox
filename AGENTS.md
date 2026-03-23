# AGENTS.md

## Project Overview
- This repository is a Bun-based React application with Tailwind CSS.
- The main runtime entrypoint is `src/index.ts`.
- The browser app is mounted from `src/frontend.tsx` and `src/App.tsx`.

## Working Agreements
- Use `bun` for dependency management and scripts unless the user explicitly asks otherwise.
- Keep changes focused and minimal; avoid unrelated refactors.
- Follow the existing TypeScript + React style in nearby files.
- Prefer extending existing utilities, hooks, and context providers before introducing new abstractions.

## Common Commands
- Install dependencies: `bun install`
- Start the development server: `bun dev`
- Build the project: `bun run build`
- Start the production server: `bun start`

## Code Organization
- `src/context`: React context providers and shared state.
- `src/hooks`: reusable React hooks.
- `src/lib`: framework-agnostic utilities and data helpers.
- `src/sidebar`: sidebar UI components.
- `src/components`: shared UI building blocks when new reusable components are introduced.

## UI Structure
- Use ShadCN-style component patterns for application UI.
- Prefer composing or extending existing ShadCN primitives before creating custom UI components.
- Place reusable UI primitives in `src/components/ui`.
- Place feature-level composed components near the feature they support unless they are broadly reusable.
- Use Tailwind utility classes in the same style as existing components; avoid ad hoc styling systems.
- Favor accessible, keyboard-friendly patterns and Radix-compatible composition for interactive elements.

## Implementation Notes
- Keep presentational components close to existing UI patterns.
- Preserve ESM module style and TypeScript typing.
- Enforce ShadCN-consistent structure, naming, and composition for new UI work.
- Update `README.md` when user-facing setup or workflow changes.

## Validation
- After code changes, ensure dependencies are installed if needed.
- Prefer targeted verification first, then broader project validation if available.
- Do not fix unrelated failing tests or tooling unless the user asks.
