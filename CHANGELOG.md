# Changelog

All notable changes to this project will be documented in this file.

## [5.0.0] - 2024

### 🎉 Major Release - Complete Rewrite

This is a **major version** with breaking changes. The library has been completely rewritten in TypeScript with React 18 and modern functional components.

### ✨ Added

- **TypeScript Support**: Full TypeScript rewrite with comprehensive type definitions
- **React 18**: Upgraded to React 18 with modern hooks
- **Functional Components**: All components converted from class to functional components
- **Modern Build System**: Migrated from Rollup/Babel to tsup for faster builds
- **Vite Dev Server**: Example app now uses Vite for better DX
- **Improved Types**: Better type inference and IntelliSense support
- **forwardRef Support**: Main component now uses forwardRef for better ref handling
- **useImperativeHandle**: Public API methods exposed via imperative handle

### 🔄 Changed

- **BREAKING**: Minimum React version is now 18.0.0
- **BREAKING**: Removed PropTypes (use TypeScript types instead)
- **BREAKING**: Component is now a functional component (no more class methods)
- **BREAKING**: Ref API changed to use `useImperativeHandle`
- Converted all class components to functional components with hooks
- Replaced Flow types with TypeScript
- Updated all dependencies to latest versions
- Modernized build output (ESM + CJS + TypeScript declarations)

### 🗑️ Removed

- **BREAKING**: Removed Flow type annotations
- **BREAKING**: Removed PropTypes validation
- Removed test dependencies (to be added back later)
- Removed old Webpack/Babel configuration
- Removed legacy build artifacts

### 🐛 Fixed

- Improved memory management with proper cleanup in useEffect
- Better event handling with React 18
- Fixed potential memory leaks in listeners
- Improved positioning calculations

### 📦 Dependencies

- Upgraded `react` to ^18.2.0
- Upgraded `react-dom` to ^18.2.0
- Added `typescript` ^5.3.3
- Added `tsup` for building
- Added `vite` for dev server
- Removed Babel, Webpack, and related dependencies

### 🔧 Development

- New build command: `npm run build` (uses tsup)
- New dev command: `npm run dev` (uses Vite)
- Added type-checking: `npm run type-check`
- Simplified configuration files

### 📝 Documentation

- Updated README with TypeScript examples
- Added comprehensive API documentation
- Updated examples to use TypeScript
- Added migration guide (coming soon)

### ⚠️ Migration Guide

If you're upgrading from v4.x:

1. **Update React**: Ensure you're using React 18+
2. **Install Types**: TypeScript types are now included
3. **Update Refs**: If using refs, update to new API:
   ```tsx
   // Old (v4)
   this.rta.getCaretPosition()
   
   // New (v5)
   const ref = useRef<ReactTextareaAutocompleteHandle>(null);
   ref.current?.getCaretPosition()
   ```
4. **Remove PropTypes**: If you were importing PropTypes, remove them
5. **Check Custom Components**: Ensure your custom components work with new types

---

## [4.9.2] - Previous Release

See previous changelog for v4.x releases.

