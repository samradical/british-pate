import THREE from 'three';
import SHADERS from './shaders';

const shaderLib = {
    mix() {
        var shader = SHADERS["mix"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        return {
            shader: shader,
            uniforms: uniforms
        }
    },
    blend() {
        var shader = SHADERS["blend"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        return {
            shader: shader,
            uniforms: uniforms
        }
    },
     blendMoon() {
        var shader = SHADERS["blendMoon"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        return {
            shader: shader,
            uniforms: uniforms
        }
    },
    chroma() {
        var shader = SHADERS["chroma"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        return {
            shader: shader,
            uniforms: uniforms
        }
    },
    chromaSimple() {
        var shader = SHADERS["chromaSimple"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        return {
            shader: shader,
            uniforms: uniforms
        }
    },
    raymarch() {
        var shader = SHADERS["raymarch"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        return {
            shader: shader,
            uniforms: uniforms
        }
    }
};
export default  shaderLib;
