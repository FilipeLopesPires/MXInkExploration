import 'aframe';
import './components/simple-mx-ink-detector.js';

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

  // Hide overlay after we've attempted to start AR
  overlay.style.display = 'none';
  
  // Add some basic debugging
  logToScene('🎮 AR session started');
};

// Attach user-gesture handler
startBtn.addEventListener('click', startAR);

// Helper function to log to the scene
function logToScene(message) {
  const logText = document.getElementById('log-text');
  if (logText) {
    const currentValue = logText.getAttribute('value') || '';
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // Add new message and keep only last 10
    const lines = currentValue.split('\n').filter(line => line.trim());
    lines.push(logEntry);
    
    if (lines.length > 10) {
      lines.shift();
    }
    
    logText.setAttribute('value', lines.join('\n'));
  }
  
  // Also log to console
  console.log(message);
}

// Optional: if you want to auto-enable the button on load
window.addEventListener('DOMContentLoaded', () => {
  // Nothing special here; we just wait for the user to tap.
});
