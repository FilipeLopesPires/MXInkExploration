/* eslint-disable no-undef */
/* global AFRAME, THREE */

// Function to register the component
function registerComponent() {
  console.log('Attempting to register mx-ink-event-handler component...');
  
  try {
    AFRAME.registerComponent('mx-ink-event-handler', {
      schema: {
        hand: { type: 'string', default: 'right' }
      },

      init() {
        console.log('MX Ink Event Logger init() called!');
        this.log('MX Ink Event Logger initialized');
        this.log(`Hand: ${this.data.hand}`);
        
        // Wait for the logitech-mx-ink-controls component to be ready
        this.el.addEventListener('componentinitialized', (event) => {
          console.log('componentinitialized event received:', event);
          this.log(event);
          if (event.detail.name === 'logitech-mx-ink-controls') {
            this.log('logitech-mx-ink-controls component ready');
            this.setupEventListeners();
            this.forceModelVisibility();
          }
        });
        
        // Also try a different approach - check if component is already there
        setTimeout(() => {
          if (this.el.components['logitech-mx-ink-controls']) {
            console.log('logitech-mx-ink-controls component found via timeout');
            this.setupEventListeners();
            this.forceModelVisibility();
          } else {
            console.log('logitech-mx-ink-controls component not found yet, will wait for events');
          }
        }, 1000);
      },

      forceModelVisibility() {
        console.log('Forcing model visibility in AR mode...');
        
        // Wait a bit for the model to load
        setTimeout(() => {
          // Get the controller object3D
          const controllerObject3D = this.el.getObject3D('mesh');
          if (controllerObject3D) {
            console.log('Found controller model, forcing visibility');
            controllerObject3D.visible = true;
            
            // Also check if there are other object3D objects that might be hidden
            const allObjects = this.el.object3DMap;
            console.log('ll object3D objects:', allObjects);
            
            // Make sure all mesh objects are visible
            Object.values(allObjects).forEach(obj => {
              if (obj && obj.visible !== undefined) {
                obj.visible = true;
                console.log('Made object visible:', obj);
              }
            });
          } else {
            console.log('Controller model not loaded yet, will retry...');
            // Retry after a bit more time
            setTimeout(() => this.forceModelVisibility(), 2000);
          }
        }, 2000);
      },

      setupEventListeners() {
        this.log('Setting up event listeners for all MX Ink events...');
        
        // Tip events
        this.el.addEventListener('tiptouchstart', this.onTipTouchStart.bind(this));
        this.el.addEventListener('tiptouchend', this.onTipTouchEnd.bind(this));
        this.el.addEventListener('tipchanged', this.onTipChanged.bind(this));
        
        // Front button events
        this.el.addEventListener('frontdown', this.onFrontDown.bind(this));
        this.el.addEventListener('frontup', this.onFrontUp.bind(this));
        this.el.addEventListener('frontchanged', this.onFrontChanged.bind(this));
        
        // Rear button events
        this.el.addEventListener('reardown', this.onRearDown.bind(this));
        this.el.addEventListener('rearup', this.onRearUp.bind(this));
        this.el.addEventListener('rearchanged', this.onRearChanged.bind(this));
        
        // Tracked controls events (from the underlying tracked-controls component)
        this.el.addEventListener('controllerconnected', this.onControllerConnected.bind(this));
        this.el.addEventListener('controllerdisconnected', this.onControllerDisconnected.bind(this));
        
        // Listen for when the controller model is ready
        this.el.addEventListener('controllermodelready', (event) => {
          console.log('Controller model ready event:', event);
          this.log('Controller model ready');
          // Force visibility after model is loaded
          setTimeout(() => this.forceModelVisibility(), 500);
        });
        
        this.log('All event listeners set up');
      },

      // Tip event handlers
      onTipTouchStart(event) {
        console.log('Tip Touch Start:', event);
        this.log('Tip touched');
      },

      onTipTouchEnd(event) {
        console.log('Tip Touch End:', event);
        this.log('Tip no longer touched');
      },

      onTipChanged(event) {
        console.log('Tip Changed:', event);
        this.log('Tip changed');
      },

      // Front button event handlers
      onFrontDown(event) {
        console.log('Front Button Down:', event);
        this.log('Front button pressed');
      },

      onFrontUp(event) {
        console.log('Front Button Up:', event);
        this.log('Front button released');
      },

      onFrontChanged(event) {
        console.log('Front Button Changed:', event);
        this.log('Front button changed');
      },

      // Rear button event handlers
      onRearDown(event) {
        console.log('Rear Button Down:', event);
        this.log('Rear button pressed');
      },

      onRearUp(event) {
        console.log('Rear Button Up:', event);
        this.log('Rear button released');
      },

      onRearChanged(event) {
        console.log('Rear Button Changed:', event);
        this.log('Rear button changed');
      },

      // Controller connection events
      onControllerConnected(event) {
        console.log('Controller Connected:', event);
        this.log('MX Ink controller connected');
      },

      onControllerDisconnected(event) {
        console.log('Controller Disconnected:', event);
        this.log('MX Ink controller disconnected');
      },

      log(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
      },

      remove() {
        // Event listeners will be automatically cleaned up by A-Frame
        this.log('MX Ink Event Logger removed');
      }
    });
    
    console.log('mx-ink-event-handler component registered successfully');
  } catch (error) {
    console.error('Failed to register mx-ink-event-handler component:', error);
  }
}

// Try to register immediately if AFRAME is available
if (typeof AFRAME !== 'undefined') {
  console.log('AFRAME is available immediately');
  registerComponent();
} else {
  console.log('AFRAME not available yet, waiting...');
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    if (typeof AFRAME !== 'undefined') {
      console.log('AFRAME is now available after DOMContentLoaded');
      registerComponent();
    } else {
      console.log('AFRAME still not available after DOMContentLoaded, waiting for window load...');
      
      // Wait for window load
      window.addEventListener('load', () => {
        console.log('Window loaded');
        
        if (typeof AFRAME !== 'undefined') {
          console.log('AFRAME is now available after window load');
          registerComponent();
        } else {
          console.error('AFRAME still not available after window load');
        }
      });
    }
  });
}
