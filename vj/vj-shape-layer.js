'use strict';
import $ from 'jquery';
import THREE from 'three';
import ShaderLib from './shaders/shader_lib';
import FxComposer from './vj-fx-composer';

class Shape {
  constructor(renderer, camera, options) {
    options = options || {};
    this.time = 0;
    let VIDEO_WIDTH = options.width || 640;
    let VIDEO_HEIGHT = options.height || 360;

    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0xffffff));

    let renderTargetParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: false
    };

    this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
    this.fbo.texture.minFilter = THREE.LinearFilter;
    this.fbo.texture.magFilter = THREE.LinearFilter;

    let ray = ShaderLib['raymarch']();
    let shader = ray['shader'];
    this.uniforms = ray['uniforms'];

    let parameters = {
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: this.uniforms
    };

    let videoMaterial = new THREE.ShaderMaterial(parameters);

    var planeGeometry = new THREE.PlaneBufferGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 4, 4);
    this._mesh = new THREE.Mesh(planeGeometry, videoMaterial);
    this.scene.add(this._mesh);

    this.fx = new FxComposer(this.scene, camera, renderer, this.fbo);
  }

  render(rtt) {
    this.uniforms['u_time'].value = this.time * 0.01;
    this.fx.render();
    this.time++;
  }


  resize(w, h, scale) {
    this._mesh.scale.x = this._mesh.scale.y = scale;
    this.fbo.setSize(w, h);
  }
};

export default Shape;
