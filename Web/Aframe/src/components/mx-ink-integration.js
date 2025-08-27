AFRAME.registerComponent('mx-ink-integration', {
  init() {
    this.mxInkDetected = false;
    this.statusText = null;
    this.logText = null;
    this.logMessages = [];
    this.mxInkInputSource = null;
    this.mxInkSession = null;
    this.trackingInterval = null;
    
    // Logging flags to prevent spam
    this.loggedNoInputSource = false;
    this.loggedNoFrame = false;
    this.loggedNoReferenceSpace = false;
    this.loggedGripError = false;
    this.loggedTargetError = false;
    this.loggedGeneralError = false;
    this.lastPositionLogTime = 0;
    
    // Position tracking control
    this.positionTrackingEnabled = false;
    
    // Wait for scene to be ready
    this.el.sceneEl.addEventListener('loaded', () => {
      this.setupDetection();
    });
  },

  setupDetection() {
    const scene = this.el.sceneEl;
    
    this.log('🔍 Setting up simple MX Ink detection...');
    
    // Find the status text element
    this.statusText = document.getElementById('status-text');
    
    // Create log display
    this.createLogDisplay();
    
    // Set up basic event listeners
    scene.addEventListener('enter-vr', this.onSessionStart.bind(this));
    scene.addEventListener('enter-ar', this.onSessionStart.bind(this));
    
    // Start checking for controllers
    this.startControllerChecking();
  },

  startControllerChecking() {
    this.log('🔄 Starting controller detection loop...');
    
    // Check every second for controllers
    this.checkInterval = setInterval(() => {
      if (!this.mxInkDetected) {
        this.checkForControllers();
      }
    }, 1000);
  },

  checkForControllers() {
    const scene = this.el.sceneEl;
    
    if (scene.renderer && scene.renderer.xr) {
      const session = scene.renderer.xr.getSession();
      
      if (session && session.inputSources) {
        this.log(`🔍 Found ${session.inputSources.length} input sources`);
        
        session.inputSources.forEach((inputSource, index) => {
          this.log(`Input source ${index}: ${inputSource.id || 'Unknown'}`);
          this.log(`  Profiles: ${inputSource.profiles?.join(', ') || 'None'}`);
          this.log(`  Handedness: ${inputSource.handedness || 'Unknown'}`);
          
          // Check if this is MX Ink
          if (inputSource.profiles && inputSource.profiles.includes('logitech-mx-ink')) {
            this.log('🎉 MX Ink stylus detected!');
            this.onMXInkDetected(inputSource, session);
          }
        });
      } else {
        this.log('🔍 No input sources found in session');
      }
    } else {
      this.log('⚠️ WebXR renderer not available');
    }
  },

  onSessionStart() {
    this.log('🎮 XR session started, checking for controllers...');
    
    // Wait a bit for the session to stabilize
    setTimeout(() => {
      this.checkForControllers();
    }, 1000);
  },

  onMXInkDetected(inputSource, session) {
    if (this.mxInkDetected) return; // Already detected
    
    this.mxInkDetected = true;
    this.mxInkInputSource = inputSource;
    this.mxInkSession = session;
    
    this.log('🎉 MX Ink stylus is now active!');
    this.log(`📏 Stylus ID: ${inputSource.id}`);
    this.log(`🤚 Handedness: ${inputSource.handedness || 'Unknown'}`);
    console.log(inputSource);
    
    // Update the status text
    if (this.statusText) {
      this.statusText.setAttribute('value', 'MX Ink stylus detected! 🎉');
      this.statusText.setAttribute('color', '#00FF00');
    }
    
    // Stop the detection loop since we found it
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.log('✅ Detection loop stopped - MX Ink found!');
    }
    
    // Start tracking position and orientation
    this.startPositionTracking();
    
    // Set up monitoring for disconnection
    this.monitorForDisconnection();
  },

  startPositionTracking() {
    this.log('📍 Starting position and orientation tracking...');
    
    // Set flag to enable tick updates - A-Frame will call tick() automatically
    this.positionTrackingEnabled = true;
    
    this.log('✅ Position tracking enabled - tick() will be called automatically');
  },

  // A-Frame automatically calls this method every frame when the component is active
  tick() {
    // Only run position tracking if enabled and we have the required data
    if (!this.positionTrackingEnabled || !this.mxInkInputSource || !this.mxInkSession) {
      return;
    }
    
    // Increment tick counter to show it's working
    if (!this.tickCount) this.tickCount = 0;
    this.tickCount++;
    
    // Only log tick count occasionally to avoid spam
    if (this.tickCount % 60 === 0) { // Every 60 frames (about once per second)
      this.log(`🎯 Tick count: ${this.tickCount} (tick() is working!)`);
    }
    
    // Call our position tracking function
    this.updatePositionAndOrientation();
  },

  updatePositionAndOrientation() {
    
    if (!this.mxInkInputSource || !this.mxInkSession) {
      // Only log this once to avoid spam
      if (!this.loggedNoInputSource) {
        this.log('⚠️ No input source or session for tracking');
        this.loggedNoInputSource = true;
      }
      return;
    }
    
    // Reset the flag if we have the required data
    this.loggedNoInputSource = false;
    
    try {
      const scene = this.el.sceneEl;
      if (!scene.renderer || !scene.renderer.xr) {
        this.log('⚠️ No WebXR renderer available for tracking');
        return;
      }
      
      const frame = scene.renderer.xr.getFrame();
      if (!frame) {
        // This should not happen during tick, but log it once
        if (!this.loggedNoFrame) {
          this.log('⚠️ No WebXR frame available for tracking');
          this.loggedNoFrame = true;
        }
        return;
      }
      
      // Reset the flag if we got a frame
      this.loggedNoFrame = false;
      
      // Only log position updates occasionally to avoid spam
      if (!this.lastPositionLogTime || Date.now() - this.lastPositionLogTime > 1000) {
        this.log('🔍 Getting pose data...');
        this.lastPositionLogTime = Date.now();
      }
      
      // Get position from grip space (where the stylus is held)
      if (this.mxInkInputSource.gripSpace) {
        try {
          // Try different ways to get the reference space
          let referenceSpace = this.mxInkSession.renderState.referenceSpace;
          if (!referenceSpace) {
            referenceSpace = this.mxInkSession.renderState.baseReferenceSpace;
          }
          if (!referenceSpace) {
            // Try to get it from the scene
            if (scene.renderer && scene.renderer.xr) {
              referenceSpace = scene.renderer.xr.getReferenceSpace();
            }
          }
          
          if (!referenceSpace) {
            if (!this.loggedNoReferenceSpace) {
              this.log('⚠️ No reference space available');
              this.loggedNoReferenceSpace = true;
            }
            return;
          }
          
          // Reset the flag if we got a reference space
          this.loggedNoReferenceSpace = false;
          
          const pose = frame.getPose(this.mxInkInputSource.gripSpace, referenceSpace);
          if (pose) {
            const position = pose.transform.position;
            const orientation = pose.transform.orientation;
            
            // Emit the pose data to the scene
            scene.emit('mxink-pose', {
              position: [position.x, position.y, position.z],
              orientation: [orientation.x, orientation.y, orientation.z, orientation.w]
            });
            console.log('Emit pose update:', { position: position, orientation: orientation });
            
            // Update position log (this will be called every frame but only updates when needed)
            this.updatePositionLog(position, orientation);
          }
        } catch (gripError) {
          if (!this.loggedGripError) {
            this.log(`❌ Grip pose error: ${gripError.message}`);
            this.loggedGripError = true;
          }
        }
      }
      
      // Also try target ray space (where the stylus is pointing)
      if (this.mxInkInputSource.targetRaySpace) {
        try {
          // Try different ways to get the reference space
          let referenceSpace = this.mxInkSession.renderState.referenceSpace;
          if (!referenceSpace) {
            referenceSpace = this.mxInkSession.renderState.baseReferenceSpace;
          }
          if (!referenceSpace) {
            // Try to get it from the scene
            if (scene.renderer && scene.renderer.xr) {
              referenceSpace = scene.renderer.xr.getReferenceSpace();
            }
          }
          
          if (!referenceSpace) {
            return; // Already logged above
          }
          
          const pose = frame.getPose(this.mxInkInputSource.targetRaySpace, referenceSpace);
          if (pose) {
            const position = pose.transform.position;
            const orientation = pose.transform.orientation;
            
            // Update target ray log
            this.updateTargetRayLog(position, orientation);
          }
        } catch (targetError) {
          if (!this.loggedTargetError) {
            this.log(`❌ Target ray pose error: ${targetError.message}`);
            this.loggedTargetError = true;
          }
        }
      }
      
    } catch (error) {
      if (!this.loggedGeneralError) {
        this.log(`❌ Position tracking error: ${error.message}`);
        this.loggedGeneralError = true;
      }
    }
  },

  monitorForDisconnection() {
    // Check every 2 seconds if the stylus is still connected
    this.disconnectionCheckInterval = setInterval(() => {
      if (this.mxInkSession && this.mxInkInputSource) {
        const currentSession = this.el.sceneEl.renderer.xr.getSession();
        
        // Check if session is still active and stylus is still in input sources
        if (!currentSession || !currentSession.inputSources) {
          this.onMXInkDisconnected('Session ended');
          return;
        }
        
        // Check if stylus is still connected by iterating through input sources
        let stylusStillConnected = false;
        for (let i = 0; i < currentSession.inputSources.length; i++) {
          if (currentSession.inputSources[i].id === this.mxInkInputSource.id) {
            stylusStillConnected = true;
            break;
          }
        }
        
        if (!stylusStillConnected) {
          this.onMXInkDisconnected('Stylus disconnected');
        }
      }
    }, 2000);
  },

  onMXInkDisconnected(reason) {
    this.log(`❌ MX Ink stylus disconnected: ${reason}`);
    
    // Reset state
    this.mxInkDetected = false;
    this.mxInkInputSource = null;
    this.mxInkSession = null;
    
    // Update status text
    if (this.statusText) {
      this.statusText.setAttribute('value', 'MX Ink stylus disconnected. Searching...');
      this.statusText.setAttribute('color', '#FF6B6B');
    }
    
    // Stop tracking
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    
    // Stop disconnection monitoring
    if (this.disconnectionCheckInterval) {
      clearInterval(this.disconnectionCheckInterval);
      this.disconnectionCheckInterval = null;
    }
    
    // Restart detection
    this.startControllerChecking();
  },

  formatOrientation(orientation) {
    // Convert quaternion to Euler angles for readability
    const euler = new THREE.Euler().setFromQuaternion(orientation);
    return `X:${(euler.x * 180 / Math.PI).toFixed(1)}° Y:${(euler.y * 180 / Math.PI).toFixed(1)}° Z:${(euler.z * 180 / Math.PI).toFixed(1)}°`;
  },

  remove() {
    // Clear all intervals
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    if (this.disconnectionCheckInterval) {
      clearInterval(this.disconnectionCheckInterval);
    }
    
    // Disable position tracking
    this.positionTrackingEnabled = false;
    
    // Remove log display
    if (this.logText) {
      this.logText.remove();
    }
  },
  
  createLogDisplay() {
    // Create a text entity for logs
    this.logText = document.createElement('a-text');
    this.logText.setAttribute('id', 'log-text');
    this.logText.setAttribute('value', 'Starting MX Ink detection...');
    this.logText.setAttribute('position', '0 1.5 -1');
    this.logText.setAttribute('color', '#FFFFFF');
    this.logText.setAttribute('align', 'left');
    this.logText.setAttribute('width', '4');
    this.logText.setAttribute('wrapCount', '40');
    this.logText.setAttribute('font', 'monoid');
    this.logText.setAttribute('scale', '0.1 0.1 0.1'); // Reduce font size
    this.logText.setAttribute('fontSize', '10px');
    
    // Add to the scene
    const scene = document.querySelector('a-scene');
    scene.appendChild(this.logText);
    
    this.log('📝 Log display created');
  },

  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // Add to our log array
    this.logMessages.push(logEntry);
    
    // Keep only last 10 messages to avoid clutter
    if (this.logMessages.length > 10) {
      this.logMessages.shift();
    }
    
    // Update the log display
    if (this.logText) {
      this.logText.setAttribute('value', this.logMessages.join('\n'));
    }
    
    // Also log to console for debugging
    //console.log(message);
  },

  updatePositionLog(position, orientation) {
    if (this.logMessages.length > 0) {
      const lastMessage = this.logMessages[this.logMessages.length - 1];
      
      // Check if this is already a position update message
      if (lastMessage.includes('📍 Position:')) {
        // Update the existing position message
        const newMessage = `📍 Position: X:${position.x.toFixed(3)} Y:${position.y.toFixed(3)} Z:${position.z.toFixed(3)}`;
        this.logMessages[this.logMessages.length - 1] = newMessage;
      } else {
        // Add new position message with orientation
        this.log(`📍 Position: X:${position.x.toFixed(3)} Y:${position.y.toFixed(3)} Z:${position.z.toFixed(3)} | Rot: ${this.formatOrientation(orientation)}`);
      }
      
      // Update the display
      if (this.logText) {
        this.logText.setAttribute('value', this.logMessages.join('\n'));
      }
    }
  },

  updateTargetRayLog(position, orientation) {
    if (this.logMessages.length > 0) {
      const lastMessage = this.logMessages[this.logMessages.length - 1];
      
      // Check if this is already a target ray update message
      if (lastMessage.includes('🎯 Target:')) {
        // Update the existing target ray message
        const newMessage = `🎯 Target: X:${position.x.toFixed(3)} Y:${position.y.toFixed(3)} Z:${position.z.toFixed(3)}`;
        this.logMessages[this.logMessages.length - 1] = newMessage;
      } else {
        // Add new target ray message
        this.log(`🎯 Target: X:${position.x.toFixed(3)} Y:${position.y.toFixed(3)} Z:${position.z.toFixed(3)}`);
      }
      
      // Update the display
      if (this.logText) {
        this.logText.setAttribute('value', this.logMessages.join('\n'));
      }
    }
  }

});
