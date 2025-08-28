# MX Ink Unity OpenXR Demo

A Unity demo showcasing Logitech MX Ink stylus integration with OpenXR for Meta Quest passthrough applications.

## Overview

This demo demonstrates how to integrate the Logitech MX Ink stylus with Unity using OpenXR to create interactive 3D drawing experiences in mixed reality. The application supports real-time line drawing with pressure sensitivity and haptic feedback in passthrough mode.

## Project Structure

```
Assets/
├── Logitech/
│   ├── Scripts/
│   │   ├── MxInkHandler.cs         # Main MX Ink input handling
│   │   ├── StylusHandler.cs        # Base stylus functionality
│   │   ├── LineDrawing.cs          # 3D line rendering system
│   │   └── DeviceHandler.cs        # Device connection management
│   ├── Prefabs/                    # Reusable MX Ink components
│   ├── Models/                     # 3D models and assets
│   ├── Materials/                   # Visual materials and shaders
│   └── OpenXR_InteractionProfile/  # OpenXR interaction definitions
├── Scenes/
│   └── MXInkScene.unity            # Main demo scene
├── XR/                             # XR interaction toolkit setup
└── XRI/                            # XR interaction components
```

## Core Features

### OpenXR Integration
- Meta Quest passthrough mode support
- OpenXR interaction profile for MX Ink
- Device detection and connection management
- Haptic feedback integration

### 3D Drawing System
- Real-time line rendering with LineRenderer
- Pressure-sensitive line width variation
- Dynamic line creation and management
- View-aligned line alignment

### MX Ink Stylus Support
- Tip pressure detection and visualization
- Front, middle, and back button handling
- Real-time input processing
- Device connection state management

## Key Components

### MxInkHandler
Manages MX Ink input actions including tip pressure, button states, and haptic feedback. Handles device connection changes and visual feedback through material color changes.

### LineDrawing
Creates and manages 3D line objects using Unity's LineRenderer. Supports pressure-sensitive line width, haptic feedback, and efficient line point management.

### StylusHandler
Base class providing common stylus functionality and drawing capabilities. Manages the stylus pose and drawing state.

### DeviceHandler
Handles device connection and disconnection events for MX Ink controllers.

## Usage

### Development
1. Open the project in Unity 6000.0 LTS or later
2. Ensure OpenXR plugin is installed and configured
3. Open the MXInkScene scene
4. Build and deploy to Meta Quest device
5. Use MX Ink stylus to draw in passthrough mode

### Build Requirements
- Unity 6000.0 LTS or later
- OpenXR Plugin for Unity
- XR Interaction Toolkit
- Meta Quest development setup

## Dependencies

- Unity 6000.0 LTS+
- OpenXR Plugin for Unity
- XR Interaction Toolkit
- Input System package
- Logitech MX Ink OpenXR Interaction Profile

## Platform Support

Requires Meta Quest 3/3S with passthrough mode enabled. Should be compatible with OpenXR-compatible VR headsets.
