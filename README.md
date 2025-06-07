# Voice Changer - Modern GUI Client

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Setting up the development environment](#setting-up-the-development-environment)
  - [Available scripts](#available-scripts)
  - [Building for production](#building-for-production)
- [Project structure](#project-structure)
- [Technologies used](#technologies-used)
- [Known issues](#known-issues)
- [Contribution](#contribution)

## Overview

This is a modern, redesigned web client for the Voice Changer application that replaces the original client interface with a contemporary, user-friendly design. The modern GUI provides the same functionality as the original client while offering improved user experience, better accessibility, and enhanced visual design.

> [!IMPORTANT]
> This is a client-side patch that only replaces the frontend interface. The backend server and middleware remain completely unchanged and compatible with the existing Voice Changer ecosystem.

## Features

- **Modern Design**: Clean, intuitive interface built with modern web technologies
- **Responsive Layout**: Optimized for different screen sizes and devices
- **Real-time Controls**: Live audio controls with visual feedback
- **Model Management**: Easy model slot management with drag-and-drop support
- **Performance Monitoring**: Real-time performance statistics and audio visualizations
- **Dark/Light Theme**: Switchable theme support for user preference
- **Modal System**: Organized modal dialogs for settings and advanced features
- **Accessibility**: Improved keyboard navigation and screen reader support

## Installation

To use the modern GUI client as a replacement for the original interface:

1. **Build the modern GUI client:**
   ```bash
   cd client/modern-gui
   npm install
   npm run build
   ```

2. **Replace the original client files:**
   
   Navigate to your Voice Changer installation directory and backup the original client:
   ```bash
   # Backup original client (optional)
   mv client/demo/dist client/demo/dist_backup
   
   # Copy modern GUI build to replace original client
   cp -r client/modern-gui/dist client/demo/dist
   ```

3. **Start the Voice Changer server as usual:**
   
   The modern GUI will now be served instead of the original client when you access the Voice Changer web interface.

> [!IMPORTANT]
> The modern GUI client is designed to work with the existing Voice Changer backend. No server-side changes are required.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.0.0 or later)
- [npm](https://www.npmjs.com/) (v8.0.0 or later)
- A code editor (VS Code recommended)
- **Modern Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

> [!NOTE]
> For development, you also need the Voice Changer backend server running on `http://localhost:18888`.

### Setting up the development environment

1. Navigate to the modern-gui directory:
   ```bash
   cd client/modern-gui
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start
   ```

4. Open your browser and navigate to `http://localhost:3000`

The development server will start with hot module replacement enabled, allowing you to see changes in real-time.

> [!IMPORTANT]
> Make sure the Voice Changer backend server is running on `http://localhost:18888` before starting the development client.

### Available scripts

- `npm run start` - Starts the Webpack development server with hot reloading
- `npm run build` - Creates an optimized production build using Webpack
- `npm run build:dev` - Creates a development build for testing
- `npm test` - Runs the test suite with Jest
- `npm run build:mod` - Builds and copies client library modifications

### Building for production

To create a production build:

```bash
npm run build
```

This will create a `dist` folder with optimized static files ready for deployment.

## Project structure

```
src/
├── components/          # Reusable UI components
│   ├── AudioSettings/   # Audio device and configuration components
│   ├── Helpers/         # Utility components (sliders, tooltips, etc.)
│   ├── LeftSideBar/     # Sidebar navigation and model slots
│   ├── modals/          # Modal dialogs and overlays
│   └── ...
├── context/             # React context providers
│   ├── AppContext.tsx   # Main application state
│   ├── ThemeContext.tsx # Theme management
│   └── UIContext.tsx    # UI state and device management
├── scripts/             # Custom hooks and utilities
├── styles/              # Global styles and theme constants
└── App.tsx              # Main application component
```

## Technologies used

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Webpack 5** - Module bundler with optimized builds
- **FontAwesome** - Icon library for consistent iconography
- **Voice Changer Client JS** - Integration with the backend API

## Known issues

- **Browser Compatibility**: Some features may not work in older browsers (IE11 not supported)
- **Mobile Support**: Touch interfaces are functional but not fully optimized
- **Screen Readers**: Some complex UI elements may need improved accessibility labels

> [!TIP]
> For backend-related issues or Voice Changer functionality problems, refer to the main project documentation.

## Contribution

This modern GUI client is part of the larger Voice Changer project. For contribution guidelines and development practices, please refer to the main project documentation.

When reporting issues specific to the modern GUI:

1. Specify which browser and version you're using
2. Include steps to reproduce the issue
3. Mention if the issue occurs with the original client as well
4. Provide console error messages if available

---

> [!NOTE]
> This modern GUI client is designed to be a drop-in replacement for the original interface. All Voice Changer functionality, including model loading, voice conversion, and audio processing, remains handled by the backend server.