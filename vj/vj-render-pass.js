import THREE from 'three';
import $ from 'jquery';
import ShaderLib from './shaders/shader_lib';
import Shaders from './shaders/shaders';

export function createShaderPass(name, uniforms) {
  let pass = new THREE.ShaderPass(Shaders[name]);
  pass.uniforms = uniforms;
  return pass;
}