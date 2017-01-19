import _ from 'lodash';
import THREE from 'three';
import Shaders from './shaders/shaders';

class EffectComposer {

  constructor(scene, camera, renderer, mesh, fbo) {
    this.effects = {
    };
    var renderPass = new THREE.RenderPass(scene, camera);
    var effectCopy = new THREE.ShaderPass(Shaders.copy, camera);
    this.composer = new THREE.EffectComposer(renderer, fbo);
    this.composer.addPass(renderPass);
    this.composer.addPass(effectCopy);
  }

  render() {
    this.composer.render();
  }

  onResize(w, h){

  }

}
export default EffectComposer;
