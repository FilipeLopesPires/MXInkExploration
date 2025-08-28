import 'aframe';
import './components/mx-ink-event-handler.js';

const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startAR');

const startAR = async () => {
  const scene = document.querySelector('a-scene');

  // Ensure the scene is loaded before entering XR.
  if (!scene.hasLoaded) {
    await new Promise(res => scene.addEventListener('loaded', res, { once: true }));
  }

  // Check AR support (Quest Browser supports 'immersive-ar')
  const xr = navigator.xr;
  const arSupported = xr && await xr.isSessionSupported?.('immersive-ar');

  // In A-Frame, enterVR() switches to AR if xr-mode-ui prefers AR & AR is supported.
  try {
    if (arSupported) {
      await scene.enterAR(); // enters AR due to xr-mode-ui="XRMode: ar"
      forceControllerVisibility();
    } else {
      // Fallback: enter immersive VR if AR isn't supported
      await scene.enterVR();
      forceControllerVisibility();
      console.warn('immersive-ar not supported; fell back to VR.');
    }
  } catch (err) {
    console.error('Failed to start XR session:', err);
    return;
  }

  // Hide overlay after we've attempted to start AR
  overlay.style.display = 'none';
  
  console.log('AR session started');
};

// Attach user-gesture handler
startBtn.addEventListener('click', startAR);

// Optional: if you want to auto-enable the button on load
window.addEventListener('DOMContentLoaded', () => {
  
  /*
  setTimeout(() => {
    forceControllerVisibility();
  }, 2000);
  */
});

function forceControllerVisibility() {
  const rightController = document.getElementById('mxink-controller-right');
  const leftController = document.getElementById('mxink-controller-left');
  
  if (rightController) {
    console.log('Right controller element found:', rightController);
    console.log('Right controller components:', rightController.components);
    forceModelVisibility(rightController);
  }
  
  if (leftController) {
    console.log('Left controller element found:', leftController);
    console.log('Left controller components:', leftController.components);
    forceModelVisibility(leftController);
  }
}

function forceModelVisibility(controller) {
  console.log('Forcing model visibility in AR mode...');
  
  // Use a flag to prevent multiple timeouts
  if (controller._visibilityCheckInProgress) {
    console.log('Visibility check already in progress, skipping...');
    return;
  }
  
  controller._visibilityCheckInProgress = true;
  
  // Wait a bit for the model to load
  setTimeout(() => {
    // Get the controller object3D
    const controllerObject3D = controller.getObject3D('mesh');
    if (controllerObject3D) {
      console.log('Found controller model, forcing visibility');
      controllerObject3D.visible = true;
      
      // Also check if there are other object3D objects that might be hidden
      const allObjects = controller.object3DMap;
      console.log('All object3D objects:', allObjects);
      
      // Make sure all mesh objects are visible
      Object.values(allObjects).forEach(obj => {
        if (obj && obj.visible !== undefined) {
          obj.visible = true;
          console.log('Made object visible:', obj);
        }
      });
      
      // Success! Mark as complete
      controller._visibilityCheckInProgress = false;
      console.log('Model visibility set successfully');
      
    } else {
      console.log('Controller model not loaded yet, will retry...');
      // Retry after a bit more time
      setTimeout(() => forceModelVisibility(controller), 2000);
    }
  }, 2000);
}