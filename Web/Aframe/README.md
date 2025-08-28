# MX Ink A-Frame Demo

A WebXR demo showcasing Logitech MX Ink stylus integration with A-Frame for AR/VR applications.

## Overview

This demo demonstrates how to integrate the Logitech MX Ink stylus with A-Frame to create interactive 3D drawing experiences in augmented reality. The application supports both left and right-handed controllers with real-time stroke rendering.

## Project Structure

```
src/
├── components/
│   ├── mx-ink-brush.js          # Drawing component for MX Ink stylus
│   └── mx-ink-event-handler.js  # Event handling for MX Ink controls
├── systems/
│   └── mx-ink-brush.js          # Stroke management and rendering system
├── stroke-geometry.js            # 3D geometry generation for brush strokes
├── main.js                      # Application entry point and AR setup
└── index.html                   # Main HTML with A-Frame scene
```

## Core Components

### mx-ink-brush
Handles drawing functionality when the MX Ink stylus tip touches surfaces or buttons are pressed in 3D space. Creates strokes through the brush system and tracks controller position during painting. Supports brush stroke size variation based on button / tip pressure applied.

### mx-ink-brush System
Manages stroke creation, storage, and rendering. Handles the drawing entity and provides the `addNewStroke` method for components.

### StrokeGeometry
Generates 3D mesh geometry for brush strokes using triangle strips. Manages buffer management and vertex calculations for smooth line rendering.

## Key Features

- AR passthrough mode support
- Real-time 3D stroke rendering
- Pressure-based brush stroke size variation

## Usage

### Development
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open the provided localhost URL in a WebXR-compatible browser
4. Click "Tap to start AR" to enter AR mode
5. Use the MX Ink stylus to draw in 3D space
6. Touch the stylus tip or press front/rear buttons to create strokes

### Production Build
1. Build for production: `npm run build`
2. Preview production build: `npm run preview`
3. Deploy the `dist/` folder to your web server

### Direct File Access
For testing without Vite, open `index.html` directly in a WebXR-compatible browser (note: some features may not work due to CORS restrictions).

## Dependencies

- A-Frame (WebXR framework)
- Three.js (3D graphics library)
- Vite (build tool)

## Browser Support

Requires a WebXR-compatible browser with AR support (e.g., Quest Browser, Chrome with WebXR flags enabled).
