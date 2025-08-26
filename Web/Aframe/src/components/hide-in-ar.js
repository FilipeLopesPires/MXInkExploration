AFRAME.registerComponent('hide-in-ar', {
    init() {
      const scene = this.el.sceneEl;
      const hide = () => (this.el.object3D.visible = false);
      const show = () => (this.el.object3D.visible = true);
  
      // If we enter AR, hide; if we exit, show again.
      scene.addEventListener('enter-vr', () => {
        if (scene.is('ar-mode')) hide();
      });
      scene.addEventListener('exit-vr', show);
    }
  });
  