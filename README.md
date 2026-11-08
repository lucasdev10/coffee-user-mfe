# coffee-user-mfe

User Micro Frontend for CoffeeWorkshop — responsible for user profile and settings management.

## Overview

This MFE handles:
- **Profile Page** (`/user/profile`): View and update user profile information
- **Settings Page** (`/user/settings`): Manage user preferences and account settings

It is part of the CoffeeWorkshop MFE architecture and is served on **port 4205**.

## Port Assignments

| MFE           | Port | remoteEntry URL                                  |
| ------------- | ---- | ------------------------------------------------ |
| Shell App     | 4200 | N/A (host)                                       |
| Products MFE  | 4201 | http://localhost:4201/remoteEntry.js             |
| Cart MFE      | 4202 | http://localhost:4202/remoteEntry.js             |
| Admin MFE     | 4203 | http://localhost:4203/remoteEntry.js             |
| Auth MFE      | 4204 | http://localhost:4204/remoteEntry.js             |
| **User MFE**  | **4205** | **http://localhost:4205/remoteEntry.js**      |

## Prerequisites

- Node.js 20+
- Angular CLI 21+
- `coffee-shared-lib` built locally (see below)

## Installation

```bash
# From the coffee-user-mfe directory
npm install --legacy-peer-deps
```

> **Note**: `--legacy-peer-deps` is required because this project references
> `coffee-shared-lib` via a local `file:` path, which triggers a peer resolution
> bug in npm v10 when combined with vitest's peer dependencies.

## Development

### Start this MFE standalone

```bash
npm start
# Serves at http://localhost:4205
```

### Build for production

```bash
npm run build:prod
```

### Run tests

```bash
npm test               # run all tests once
npm run test:watch     # run tests in watch mode
npm run test:coverage  # run tests with coverage report
```

## Environment Configuration

| File                   | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `src/environments/`    | Not used standalone; env handled by Shell  |

## Project Structure

```
coffee-user-mfe/
├── src/
│   ├── app/
│   │   ├── app.ts              # Root App component
│   │   ├── app.config.ts       # Angular application config (providers)
│   │   ├── app.routes.ts       # Standalone app routes (empty — loaded by Shell)
│   │   ├── user.routes.ts      # USER_ROUTES — exposed via Module Federation
│   │   ├── pages/              # ProfilePage, SettingsPage
│   │   ├── store/              # UserState, UserActions, UserSelectors, UserEffects
│   │   └── services/           # EventBusService, UserFacade
│   ├── bootstrap.ts            # Module Federation bootstrap entry
│   ├── main.ts                 # Loads bootstrap.ts asynchronously
│   ├── test.ts                 # Vitest/Angular test setup
│   └── styles.scss             # Global styles
├── webpack.config.js           # Module Federation remote config (name: 'user')
├── angular.json                # Angular CLI config with MF builder
├── vitest.config.ts            # Vitest config with coffee-shared-lib alias
├── tsconfig.json               # Base TypeScript config
├── tsconfig.app.json           # App TypeScript config with coffee-shared-lib paths
└── tsconfig.spec.json          # Spec TypeScript config
```

## Module Federation

This MFE is configured as a **remote** named `user`, exposing:

| Exposed Module | Path                        |
| -------------- | --------------------------- |
| `./Routes`     | `./src/app/user.routes.ts`  |

The Shell App loads this MFE at `/user/*` routes.

## Shared Library Dependency

This MFE depends on `coffee-shared-lib` for shared components, pipes, directives, and utilities.

The dependency is resolved in two ways:
- **Angular compiler**: via `tsconfig.app.json` `paths` mapping
- **Vitest**: via `vitest.config.ts` `resolve.alias` mapping

If you see `Failed to resolve entry for package "coffee-shared-lib"` in tests, ensure
`vitest.config.ts` has the alias pointing to:
```
../coffee-shared-lib/projects/coffee-shared/src/public-api.ts
```

## Communication

This MFE communicates with the Shell App via:

1. **NgRx Shared Store** — reads auth state (`selectIsAuthenticated`) and dispatches user slice actions (`UserActions`)
2. **Custom Events** — emits `user:profile-updated` when profile is updated via `EventBusService`

## Troubleshooting

### `npm install` fails with `Cannot read properties of null (reading 'edgesOut')`

Use `npm install --legacy-peer-deps` (see Installation section above).

### `Cannot find module 'coffee-shared-lib'`

Verify `tsconfig.app.json` paths point to correct files in `coffee-shared-lib`:
```json
"coffee-shared-lib": [
  "../coffee-shared-lib/dist/coffee-shared/types/coffee-shared.d.ts",
  "../coffee-shared-lib/projects/coffee-shared/src/public-api.ts"
]
```

### Port 4205 already in use

```powershell
Get-NetTCPConnection -LocalPort 4205 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

### Version check

```bash
ng version  # should show Angular 21.x
```
