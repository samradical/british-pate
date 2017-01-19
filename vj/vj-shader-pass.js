import THREE from 'three';
import ShaderLib from './shaders/shader_lib';
import Shaders from './shaders/shaders';

export function createShaderPass(name, uniforms, camera, scene) {
  let pass = new THREE.ShaderPass(Shaders[name]);
  pass.uniforms = uniforms;
  //return pass;

  function onResize(w,h,scale){
    pass.quad.scale.x = pass.quad.scale.y = scale;
  }
  return {
    pass:pass,
    onResize:onResize
  }
}
