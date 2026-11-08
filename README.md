# coffee-user-mfe

User Micro Frontend for the CoffeeWorkshop application — handles user profile and settings management.

## Overview

This MFE is responsible for user profile and settings flows including:
- Profile Page (`/user/profile`): View and update user profile information
- Settings Page (`/user/settings`): Manage user preferences and account settings

It is part of the CoffeeWorkshop Micro Frontend architecture and runs independently on **port 4205**.

## Architecture

- **Type**: Remote (Module Federation)
- **Name**: `user`
- **Port**: `4205`
- **Remote Entry**: `http://localhost:4205/remoteEntry.js`
- **Exposes**: `./Routes` → `USER_ROUTES`

## Prerequisites

- Node.js 20+
- Angular CLI 21+
- `coffee-shared-lib` built and available at `../coffee-shared-lib` (see below)

## Installation

### 1. Build the Shared Library

```bash
cd ../coffee-shared-lib
npm install
npm run build
```

### 2. Install Dependencies

```bash
cd coffee-user-mfe
npm install --legacy-peer-deps
```

> **Note**: `--legacy-peer-deps` is required because this project uses `file:` protocol local dependencies (`coffee-shared-lib`), which can trigger a peer resolution bug in npm 10.x.

### 3. Start the MFE

```bash
npm start
```

The app will be available at `http://localhost:4205` with live-reload enabled.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `ng serve --port 4205` | Serve on port 4205 with live-reload (development) |
| `npm run build` | `ng build` | Production build |
| `npm run build:prod` | `ng build --configuration production` | Explicit production build |
| `npm run watch` | `ng build --watch --configuration development` | Watch mode build |
| `npm run test` | `vitest --run` | Run unit tests (single run) |
| `npm run test:watch` | `vitest` | Run unit tests in watch mode |
| `npm run test:coverage` | `vitest --coverage --run` | Run tests with coverage report |
| `npm run lint` | `ng lint` | Run linting |

> **Live-reload**: `ng serve` enables HMR (Hot Module Replacement) by default in Angular 21. No additional flag is needed.

## Module Federation

This MFE is configured as a **remote** in the Module Federation setup:

```js
// webpack.config.js
{
  name: 'user',
  filename: 'remoteEntry.js',
  exposes: {
    './Routes': './src/app/user.routes.ts',
  }
}
```

The Shell App loads this MFE dynamically via:

```typescript
loadRemoteModule({
  type: 'module',
  remoteEntry: 'http://localhost:4205/remoteEntry.js',
  exposedModule: './Routes',
}).then((m) => m.USER_ROUTES)
```

## Port Assignments

All MFEs in the CoffeeWorkshop architecture run on fixed ports:

| Application | Port | Remote Entry URL |
|-------------|------|-----------------|
| Shell App (CoffeeWorkshop) | 4200 | N/A (host) |
| Products MFE (coffee-products-mfe) | 4201 | `http://localhost:4201/remoteEntry.js` |
| Cart MFE (coffee-cart-mfe) | 4202 | `http://localhost:4202/remoteEntry.js` |
| Admin MFE (coffee-admin-mfe) | 4203 | `http://localhost:4203/remoteEntry.js` |
| Auth MFE (coffee-auth-mfe) | 4204 | `http://localhost:4204/remoteEntry.js` |
| **User MFE (coffee-user-mfe)** | **4205** | **`http://localhost:4205/remoteEntry.js`** |

## Shared Library Dependency

This MFE uses `coffee-shared-lib` for shared components, pipes, directives, and utilities.

The library is referenced as a local file dependency:

```json
"coffee-shared-lib": "file:../coffee-shared-lib"
```

Make sure to build the shared library before installing or running this MFE:

```bash
cd ../coffee-shared-lib
npm run build
```

The dependency is resolved in two ways:
- **Angular compiler**: via `tsconfig.app.json` `paths` mapping → `coffee-shared-lib/dist/coffee-shared/types/coffee-shared.d.ts`
- **Vitest**: via `vitest.config.ts` `resolve.alias` → `coffee-shared-lib/projects/coffee-shared/src/public-api.ts`

## Environment Configuration

The User MFE does not use standalone environment files. Environment-specific configuration is handled by the Shell App (`CoffeeWorkshop`).

| File | Usage |
|------|-------|
| `src/environments/` | Not used standalone; environment is inherited from Shell |

Key runtime configuration:

```typescript
// The MFE reads auth state and API configuration from the Shell's NgRx store.
// No direct environment.ts variables are required for standalone development.
```

When running with the Shell App for integration testing, ensure the Shell's `webpack.config.js` points to `http://localhost:4205/remoteEntry.js` for the `user` remote.

## Communication

### NgRx Store

- Reads from and dispatches to the Shell App's global NgRx store
- Reads auth state: `selectIsAuthenticated`, `selectCurrentUser`
- Dispatches user slice actions: `UserActions`

### Custom Events

- Emits `user:profile-updated` event with updated profile data via `EventBusService`

Events are dispatched on `window`, allowing the Shell App and other MFEs to listen:

```typescript
window.addEventListener('user:profile-updated', (event: CustomEvent) => {
  const { profile } = event.detail;
});
```

## Development Workflow

### Standalone Development (no Shell required)

```bash
npm start
# Visit http://localhost:4205
```

### Integration Development (with Shell App)

Start all MFEs, then start the Shell:

```bash
# Terminal 1 — User MFE
cd coffee-user-mfe && npm start

# Terminal 2 — Auth MFE (required for login)
cd coffee-auth-mfe && npm start

# Terminal 3 — Shell App
cd CoffeeWorkshop && npm start
# Visit http://localhost:4200
```

Or use the Shell App's `start:all` script to launch all MFEs simultaneously:

```bash
cd CoffeeWorkshop
npm run start:all
```

For the full CoffeeWorkshop setup, refer to the [Shell App README](../CoffeeWorkshop/README.md).

## Testing

Tests use [Vitest](https://vitest.dev/) with jsdom for DOM simulation.

```bash
# Single run
npm test

# Watch mode (for development)
npm run test:watch

# With coverage report (outputs to coverage/)
npm run test:coverage
```

## Project Structure

```
coffee-user-mfe/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── profile-page/       # ProfilePageComponent
│   │   │   └── settings-page/      # SettingsPageComponent
│   │   ├── store/                  # UserState, UserActions, UserSelectors, UserEffects
│   │   ├── services/               # EventBusService, UserFacade
│   │   ├── user.routes.ts          # USER_ROUTES (Module Federation exposed module)
│   │   ├── app.ts                  # Root App component
│   │   ├── app.config.ts           # Angular application config (providers)
│   │   └── app.routes.ts           # Standalone app routes (empty — loaded by Shell)
│   ├── bootstrap.ts                # Module Federation bootstrap entry
│   ├── main.ts                     # Loads bootstrap.ts asynchronously
│   ├── test.ts                     # Vitest/Angular test setup
│   └── styles.scss                 # Global styles
├── webpack.config.js               # Module Federation remote config (name: 'user')
├── angular.json                    # Angular CLI config with MF builder, port 4205
├── vitest.config.ts                # Vitest config with coffee-shared-lib alias
├── tsconfig.json                   # Base TypeScript config
├── tsconfig.app.json               # App TypeScript config with coffee-shared-lib paths
├── tsconfig.spec.json              # Spec TypeScript config
└── package.json                    # Scripts, dependencies
```

## Troubleshooting

**MFE not loading in Shell App**
Ensure this MFE is running on port 4205 and `remoteEntry.js` is accessible:
```bash
curl http://localhost:4205/remoteEntry.js
```

**Shared library import errors**
Rebuild the shared library:
```bash
cd ../coffee-shared-lib && npm run build
```

**`npm install` fails with `Cannot read properties of null (reading 'edgesOut')`**
Use `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

**Angular version mismatch**
Ensure all MFEs use Angular 21.x. Check with:
```bash
npx ng version
```

**Port 4205 already in use**
Find and kill the conflicting process:
```powershell
Get-NetTCPConnection -LocalPort 4205 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

**Tests fail with `Failed to resolve entry for package "coffee-shared-lib"`**
Ensure `vitest.config.ts` has the `resolve.alias` for `coffee-shared-lib` pointing to the source `public-api.ts`:
```typescript
resolve: {
  alias: {
    'coffee-shared-lib': resolve(__dirname, '../coffee-shared-lib/projects/coffee-shared/src/public-api.ts'),
  },
}
```

**`error TS2307: Cannot find module 'coffee-shared-lib'`**
Verify `tsconfig.app.json` paths point to the correct files:
```json
"coffee-shared-lib": [
  "../coffee-shared-lib/dist/coffee-shared/types/coffee-shared.d.ts",
  "../coffee-shared-lib/projects/coffee-shared/src/public-api.ts"
]
```
