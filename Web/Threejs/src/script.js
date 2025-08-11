/**
 * MX Ink Exploration WebXR Application
 * 
 * This script creates a 3D drawing application that works with the Logitech MX Ink stylus
 * in virtual reality. Users can draw 3D lines and shapes using the stylus as a virtual pen.
 * 
 * Key Features:
 * - WebXR support for Meta Quest
 * - Real-time 3D drawing with TubePainter
 * - MX Ink stylus integration and detection
 * - Dual controller support for VR interaction
 * - Responsive design with window resize handling
 */

// Core Three.js library for 3D graphics
import * as THREE from "three";

// TubePainter for creating 3D tube-like strokes when drawing
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";

// WebXR components for VR headset integration
import { XRButton } from "three/examples/jsm/webxr/XRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

// 3D model loaders (currently unused but available for future features)
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ============================================================================
// GLOBAL VARIABLES AND STATE
// ============================================================================

// Core Three.js objects
let camera, scene, renderer;

// VR controller references
let controller1, controller2;        // Main controllers for interaction
let controllerGrip1, controllerGrip2; // Controller grip models for visual representation

// MX Ink stylus reference
let stylus;

// Drawing system components
let painter1;                        // TubePainter instance for creating 3D strokes
let gamepad1;                        // Gamepad data from the stylus

// Drawing state flags
let isDrawing = false;               // Current drawing state
let prevIsDrawing = false;           // Previous drawing state for state change detection

// Material for the 3D drawing strokes
const material = new THREE.MeshNormalMaterial({
  flatShading: true,                 // Flat shading for better visual clarity
  side: THREE.DoubleSide,            // Render both sides of faces
});

// 3D cursor position for drawing calculations
const cursor = new THREE.Vector3();

// Viewport dimensions for responsive design
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Start the application
init();

/**
 * Main initialization function
 * Sets up the 3D scene, camera, renderer, lighting, and VR components
 */
function init() {
  // Get the canvas element for WebGL rendering
  const canvas = document.querySelector("canvas.webgl");
  
  // Create the main 3D scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222); // Dark gray background
  
  // Set up the camera with perspective projection
  camera = new THREE.PerspectiveCamera(
    50,                                    // Field of view (degrees)
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.01,                                  // Near clipping plane
    50                                     // Far clipping plane
  );
  camera.position.set(0, 1.6, 3);         // Position camera at eye level (1.6m) and 3m back
  
  // Initialize 3D model loaders (for future use)
  const gltfLoader = new GLTFLoader();
  
  // Add a grid helper for spatial reference
  const grid = new THREE.GridHelper(4, 1, 0x111111, 0x111111); // 4x4 grid with dark lines
  scene.add(grid);
  
  // Add ambient lighting for overall scene illumination
  scene.add(new THREE.HemisphereLight(0x888877, 0x777788, 3));
  
  // Add directional lighting for shadows and depth
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(0, 4, 0);            // Light from above
  scene.add(light);
  
  // Initialize the TubePainter for 3D drawing
  painter1 = new TubePainter();
  painter1.mesh.material = material;       // Apply the drawing material
  painter1.setSize(0.1);                  // Set stroke thickness
  scene.add(painter1.mesh);               // Add to scene
  
  // Set up the WebGL renderer
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,                       // Enable anti-aliasing for smooth edges
    canvas 
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for device pixel ratio
  renderer.setSize(sizes.width, sizes.height);
  renderer.setAnimationLoop(animate);      // Start the render loop
  
  // Enable WebXR for VR support
  renderer.xr.enabled = true;
  
  // Create and add the VR entry button
  document.body.appendChild(XRButton.createButton(renderer, { 
    optionalFeatures: ["unbounded"]        // Support for unbounded VR spaces
  }));
  
  // Set up VR controller models and interaction
  const controllerModelFactory = new XRControllerModelFactory();
  
  // Initialize first controller (left hand)
  controller1 = renderer.xr.getController(0);
  controller1.addEventListener("connected", onControllerConnected);
  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);
  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
  scene.add(controllerGrip1);
  scene.add(controller1);
  
  // Initialize second controller (right hand)
  controller2 = renderer.xr.getController(1);
  controller2.addEventListener("connected", onControllerConnected);
  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);
  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
  scene.add(controllerGrip2);
  scene.add(controller2);
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle window resize events
 * Updates camera aspect ratio and renderer size for responsive design
 */
window.addEventListener("resize", () => {
  // Update viewport dimensions
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  
  // Update camera aspect ratio
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  
  // Update renderer size and pixel ratio
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ============================================================================
// ANIMATION LOOP
// ============================================================================

/**
 * Main animation loop
 * Runs every frame to update drawing state and render the scene
 */
function animate() {
  // Handle stylus drawing input if available
  if (gamepad1) {
    prevIsDrawing = isDrawing;
    // Check if button 5 (index 5) is pressed for drawing
    isDrawing = gamepad1.buttons[5].value > 0;
    
    // Start drawing when button is first pressed
    if (isDrawing && !prevIsDrawing) {
      const painter = stylus.userData.painter;
      painter.moveTo(stylus.position);     // Move to current stylus position
    }
  }
  
  // Update drawing based on stylus movement
  handleDrawing(stylus);
  
  // Render the current frame
  renderer.render(scene, camera);
}

// ============================================================================
// DRAWING SYSTEM
// ============================================================================

/**
 * Handle the drawing logic for a controller/stylus
 * @param {THREE.Object3D} controller - The controller or stylus to handle drawing for
 */
function handleDrawing(controller) {
  if (!controller) return;
  
  const userData = controller.userData;
  const painter = userData.painter;
  
  if (gamepad1) {
    // Update cursor position to stylus position
    cursor.set(stylus.position.x, stylus.position.y, stylus.position.z);
    
    // Continue drawing if selecting or drawing
    if (userData.isSelecting || isDrawing) {
      painter.lineTo(cursor);              // Draw line to current cursor position
      painter.update();                    // Update the visual mesh
    }
  }
}

// ============================================================================
// CONTROLLER EVENT HANDLERS
// ============================================================================

/**
 * Handle controller connection events
 * Detects when the MX Ink stylus is connected and sets it up
 * @param {Event} e - Controller connection event
 */
function onControllerConnected(e) {
  // Check if this is the MX Ink stylus by looking for its profile
  if (e.data.profiles.includes("logitech-mx-ink")) {
    stylus = e.target;                    // Store reference to stylus
    stylus.userData.painter = painter1;   // Assign painter to stylus
    gamepad1 = e.data.gamepad;            // Store gamepad data for input
  }
}

/**
 * Handle controller select start events
 * Begins drawing when the stylus trigger is pressed
 * @param {Event} e - Select start event
 */
function onSelectStart(e) {
  if (e.target !== stylus) return;        // Only handle stylus events
  
  const painter = stylus.userData.painter;
  painter.moveTo(stylus.position);        // Start drawing at current position
  this.userData.isSelecting = true;       // Mark as selecting
}

/**
 * Handle controller select end events
 * Stops drawing when the stylus trigger is released
 */
function onSelectEnd() {
  this.userData.isSelecting = false;      // Mark as not selecting
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Debug function to log gamepad button states
 * Useful for understanding controller input mapping
 * @param {Gamepad} gamepad - The gamepad to debug
 */
function debugGamepad(gamepad) {
  gamepad.buttons.forEach((btn, index) => {
    if (btn.pressed) {
      console.log(`BTN ${index} - Pressed: ${btn.pressed} - Touched: ${btn.touched} - Value: ${btn.value}`);
    }
    
    if (btn.touched) {
      console.log(`BTN ${index} - Pressed: ${btn.pressed} - Touched: ${btn.touched} - Value: ${btn.value}`);
    }
  });
}
