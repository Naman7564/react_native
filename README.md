# React Native Expo App 👋

A universal mobile and web application built with [Expo](https://expo.dev) (SDK 57), React Native (0.86), and React 19.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm start
```

You can run the app across platforms using the following commands:

- **Android**: `npm run android` (Android emulator or connected device)
- **iOS**: `npm run ios` (iOS simulator - macOS only)
- **Web**: `npm run web` (Opens in your default browser)
- **Expo Go**: `npm run start:go` (Run directly in the Expo Go client app)
- **Tunnel Mode**: `npm run start:tunnel` (Access dev server across different networks via `@expo/ngrok`)

---

## 🛠️ Modifications & Recent Improvements

Recent updates and architectural improvements made to the project include:

1. **Linting & Code Quality Configuration**
   - Configured modern ESLint flat configuration (`eslint.config.js`) using `eslint-config-expo/flat`.
   - Added `npm run lint` script to catch syntax and formatting issues early.
   - Verified strict TypeScript type-checking across the codebase.

2. **Custom Metro Bundler Setup**
   - Added customized `metro.config.js` via `expo/metro-config` to ensure optimized asset resolution and bundle building.

3. **Remote & Tunneling Support**
   - Integrated `@expo/ngrok` dependency and added `start:tunnel` script for remote device testing outside local networks.
   - Added dedicated `start:go` script for seamless Expo Go testing.

4. **Web Support & Hydration Fixes**
   - Enhanced platform-specific behavior with `use-color-scheme.web.ts` and responsive components (`animated-icon.web.tsx`, `app-tabs.web.tsx`, `web-badge.tsx`).
   - Resolved hydration state handling for smooth server-side and browser rendering.

5. **Clean Directory & Module Structure**
   - Organized source code inside `src/` with path aliasing (`@/*`):
     - `src/app/`: Expo Router file-based screens and layouts.
     - `src/components/`: Reusable UI elements, themed primitives, and animated icons.
     - `src/constants/`: Centralized theme tokens, colors, and layout metrics.
     - `src/hooks/`: Custom hooks for color schemes, themes, and platform logic.

---

## 📁 Project Structure

```text
├── assets/                 # App icons, splash screens, and static images
├── scripts/                # Helper scripts (e.g., project reset)
├── src/
│   ├── app/                # Expo Router file-based routing
│   │   ├── _layout.tsx     # Root and tab navigation layout
│   │   ├── index.tsx       # Home screen
│   │   └── explore.tsx     # Explore screen
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Primitives (e.g., collapsible views)
│   │   └── ...             # Themed text, views, animated icons
│   ├── constants/          # Theme constants and design tokens
│   ├── hooks/              # Custom hooks (theme, color scheme)
│   └── global.css          # Global style declarations
├── app.json                # Expo application configuration
├── eslint.config.js        # ESLint flat config
├── metro.config.js         # Metro bundler config
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 🧪 Code Quality & Verification

To verify code quality and type safety:

```bash
# Run ESLint checks
npm run lint

# Run TypeScript typecheck
npx tsc --noEmit
```

---

## 🔮 Planned Improvements

- [ ] Implement persistent state management (e.g., Zustand or React Context).
- [ ] Add automated unit and component testing with Jest and React Native Testing Library.
- [ ] Configure EAS Build and EAS Update pipelines for automated builds and over-the-air releases.
- [ ] Expand screen flows and interactive features.

---

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
