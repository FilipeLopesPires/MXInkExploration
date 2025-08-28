# MX Ink Three.js Demo

A WebXR demo showcasing Logitech MX Ink stylus integration with Three.js for VR and MR drawing applications.

## Overview

This demo demonstrates how to integrate the Logitech MX Ink stylus with Three.js to create interactive 3D drawing experiences in mixed reality. The application uses TubePainter for creating 3D tube-like strokes and supports dual controller interaction.

## Project Structure

```
src/
├── script.js                      # Main application logic and WebXR setup
├── index.html                     # HTML entry point with WebGL canvas
└── style.css                      # Basic styling for the application
```

## Core Features

### WebXR Integration
- Meta Quest headset support
- Dual controller interaction
- XR button for entering MR mode
- Controller model visualization

### 3D Drawing System
- TubePainter for creating 3D tube strokes
- Real-time drawing with MX Ink stylus
- Responsive canvas sizing
- Grid helper for spatial reference

### MX Ink Stylus Support
- Stylus detection and integration
- Gamepad data processing
- Drawing state management
- Pressure-sensitive stroke creation

## Key Components

- **Three.js Scene**: 3D environment with lighting and grid
- **TubePainter**: Creates 3D tube geometry for drawing strokes
- **XR Controllers**: Handles controller input and visualization
- **Drawing State**: Manages drawing mode and stroke creation
- **Responsive Design**: Handles window resizing and viewport changes

## Usage

### Development
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open the provided localhost URL
4. Click the XR button to enter MR mode
5. Use the MX Ink stylus to draw in 3D space

### Production Build
1. Build for production: `npm run build`
2. Deploy the `dist/` folder to your web server

## Dependencies

- Three.js (3D graphics library)
- Vite (build tool and dev server)
- WebXR Device API (XR headset support)

## Browser Support

Requires a WebXR-compatible browser with XR support (e.g., Meta Quest Browser, Chrome with WebXR flags enabled).
