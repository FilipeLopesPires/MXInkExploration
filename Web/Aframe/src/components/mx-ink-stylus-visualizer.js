/* eslint-disable no-undef */
/* global AFRAME */
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

AFRAME.registerComponent('mx-ink-stylus-visualizer', {
  schema: {
    src: { type: 'string', default: '/logitech_mx_ink.fbx' },      // served from /static
    texture: { type: 'string', default: '/logitech_mx_ink_texture.png' },
    // scale is model-dependent; FBX is often in centimeters → tiny scale for meters scene
    scale: { type: 'vec3', default: { x: 0.001, y: 0.001, z: 0.001 } },
    // rotate model so “tip” points forward (−Z) and matches device axes
    align: { type: 'vec3', default: { x: -90, y: 0, z: 0 } }
  },

  init() {
    const THREE = AFRAME.THREE;
    this._pos = new THREE.Vector3();
    this._quat = new THREE.Quaternion();

    // Precompute alignment quaternion
    const e = new THREE.Euler(
      THREE.MathUtils.degToRad(this.data.align.x),
      THREE.MathUtils.degToRad(this.data.align.y),
      THREE.MathUtils.degToRad(this.data.align.z),
      'XYZ'
    );
    this._alignQuat = new THREE.Quaternion().setFromEuler(e);

    // Load texture
    const tex = new THREE.TextureLoader().load(this.data.texture);
    tex.flipY = false; // common for FBX/GLTF UV conventions

    // Load FBX
    const loader = new FBXLoader();
    loader.load(
      this.data.src,
      (obj) => {
        // Apply a basic PBR-ish material (FBX often comes without one)
        obj.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              map: tex,
              metalness: 0.2,
              roughness: 0.6
            });
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        // Scale + initial alignment (also applied at runtime)
        obj.scale.set(this.data.scale.x, this.data.scale.y, this.data.scale.z);
        console.log('Applied scale:', this.data.scale);

        // Wrap in a group so we can manage alignment cleanly
        const group = new THREE.Group();
        group.add(obj);
        this.el.setObject3D('mxink', group);
      },
      undefined,
      (err) => console.error('FBX load error:', err)
    );

    // Listen for your pose updates from mx-ink-integration.js
    this._onPose = (e) => {
      console.log('🎯 mx-ink-stylus-visualizer received mxink-pose event:', e.detail);
      const { position = [0, 0, 0], orientation = [0, 0, 0, 1] } = e.detail || {};
      this._pos.set(position[0], position[1], position[2]);
      this._quat.set(orientation[0], orientation[1], orientation[2], orientation[3]);
      console.log('Received pose update:', { position: this._pos, orientation: this._quat });
      this._applyTransform();
    };
    this.el.sceneEl.addEventListener('mxink-pose', this._onPose);
  },

  remove() {
    this.el.sceneEl.removeEventListener('mxink-pose', this._onPose);
    this.el.removeObject3D('mxink');
  },

  _applyTransform() {
    const obj = this.el.getObject3D('mxink');
    if (!obj) return;
    // position
    obj.position.copy(this._pos);
    // rotation (device quaternion * alignment)
    obj.quaternion.copy(this._quat).multiply(this._alignQuat);
    obj.updateMatrixWorld();
  }
});
