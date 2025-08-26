import 'aframe';
import 'aframe-extras'; // optional, but you have it installed
import './components/hide-in-ar.js';

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
    } else {
      // Fallback: enter immersive VR if AR isn't supported
      await scene.enterVR();
      console.warn('immersive-ar not supported; fell back to VR.');
    }
  } catch (err) {
    console.error('Failed to start XR session:', err);
    return;
  }

  // Hide overlay after we’ve attempted to start AR
  overlay.style.display = 'none';
};

// Attach user-gesture handler
startBtn.addEventListener('click', startAR);

// Optional: if you want to auto-enable the button on load
window.addEventListener('DOMContentLoaded', () => {
  // Nothing special here; we just wait for the user to tap.
});
