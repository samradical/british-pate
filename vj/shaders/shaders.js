const glslify = require('glslify')
import THREE from 'three';
import CopyShader from '../post/CopyShader';
import EffectComposer from '../post/EffectComposer';
import MaskPass from '../post/MaskPass';
import TextPass from '../post/TextPass';
import TexturePass from '../post/TexturePass';
import RenderPass from '../post/RenderPass';
import ShaderPass from '../post/ShaderPass';

const basicVert = glslify("./vert/basic.vert")
const simpleFrag = glslify("./frag/simple.frag")
const mixFrag = glslify('./frag/mix.frag')
const blendFrag = glslify("./frag/blend.frag")
const colorFrag = glslify("./frag/color.frag")
const saturationFrag = glslify("./frag/saturation.frag")
const chromaFrag = glslify("./frag/chroma.frag")
const chromaSimpleFrag = glslify("./frag/chroma_simple.frag")
const chromaThreeFrag = glslify("./frag/chroma_three.frag")
const shapeMix = glslify("./mixing/shape_mix.frag")
const raymarchFrag = glslify("./frag/raymarch02.frag")
const textStencilFrag = glslify("./frag/textStencil.frag")
const shape1Frag = glslify("./frag/shape1.frag")

const Shaders = {
    'mix': {
        uniforms: THREE.UniformsUtils.merge([{
            "background": {
                type: "t",
                value: null
            },
            "foreground": {
                type: "t",
                value: null
            },
            "blendOpacity": {
                type: "f",
                value: 0.5
            }
        }]),
        fragmentShader: mixFrag,
        vertexShader: basicVert
    },
    'simpleFrag': {
        uniforms: THREE.UniformsUtils.merge([{
            "tDiffuse": {
                type: "t",
                value: null
            }
        }]),
        fragmentShader: simpleFrag,
        vertexShader: basicVert
    },
    'blend': {
        uniforms: THREE.UniformsUtils.merge([{
            "background": {
                type: "t",
                value: null
            },
            "foreground": {
                type: "t",
                value: null
            },
            "blendMode": {
                type: "i",
                value: 15
            },
            "blendOpacity": {
                type: "f",
                value: 0.5
            }
        }]),
        fragmentShader: blendFrag,
        vertexShader: basicVert
    },
    'shapeMix': {
        uniforms: THREE.UniformsUtils.merge([{
            "tOne": {
                type: "t",
                value: null
            },
            "tTwo": {
                type: "t",
                value: null
            },
            "uTime": {
                type: "f",
                value: 4.
            },
            "uModes": {
                type: "i",
                value: 0
            },
            "uSize": {
                type: "f",
                value: 0.5
            },
            "uIntensity": {
                type: "f",
                value: 0.5
            }
        }]),
        fragmentShader: shapeMix,
        vertexShader: basicVert
    },
    'color': {
        uniforms: THREE.UniformsUtils.merge([{
            "tDiffuse": {
                type: "t",
                value: null
            },
            "uMaxSaturation": {
                type: "f",
                value: 8.0
            },
            "uSaturation": {
                type: "f",
                value: 0.1
            },
            "uR": {
                type: "f",
                value: 1.0
            },
            "uG": {
                type: "f",
                value: 1.0
            },
            "uB": {
                type: "f",
                value: 1.0
            },
            "uMaxContrast": {
                type: "f",
                value: 4.0
            },
            "uContrast": {
                type: "f",
                value: 0.0
            },
            "uDesaturate": {
                type: "f",
                value: 0.0
            },
            "uBrightness": {
                type: "f",
                value: 0.0
            },
            "uHue": {
                type: "f",
                value: 0.0
            }
        }]),
        fragmentShader: colorFrag,
        vertexShader: basicVert
    },
    'saturation': {
        uniforms: THREE.UniformsUtils.merge([{
            "tDiffuse": {
                type: "t",
                value: null
            },
            "uSaturation": {
                type: "f",
                value: 1.0
            }
        }]),
        fragmentShader: saturationFrag,
        vertexShader: basicVert
    },
    'chroma': {
        uniforms: THREE.UniformsUtils.merge([{
            "uMixRatio": {
                type: "f",
                value: 0.5
            },
            "uThreshold": {
                type: "f",
                value: 0.5
            },
            "tDiffuse": {
                type: "t",
                value: null
            },
            "tTwo": {
                type: "t",
                value: null
            },
            "tMix": {
                type: "t",
                value: null
            }

        }]),
        fragmentShader: chromaFrag,
        vertexShader: basicVert
    },
    'chromaSimple': {
        uniforms: THREE.UniformsUtils.merge([{
            "uMixRatio": {
                type: "f",
                value: 0.5
            },
            "uThreshold": {
                type: "f",
                value: 0.5
            },
            "uKeyColor": {
                type: "f",
                value: 0.0
            },
            "tOne": {
                type: "t",
                value: null
            },
            "tTwo": {
                type: "t",
                value: null
            }
        }]),
        fragmentShader: chromaSimpleFrag,
        vertexShader: basicVert
    },
    'chromaThree': {
        uniforms: THREE.UniformsUtils.merge([{
            "uMixRatio": {
                type: "f",
                value: 0.5
            },
            "uThreshold": {
                type: "f",
                value: 0.5
            },
            "tDiffuse": {
                type: "t",
                value: null
            },
            "tTwo": {
                type: "t",
                value: null
            },
            "tMix": {
                type: "t",
                value: null
            }
        }]),
        fragmentShader: chromaThreeFrag,
        vertexShader: basicVert
    },
    'raymarch': {
        uniforms: {
            "tDiffuse": {
                type: "t",
                value: null
            },
            "u_time": {
                type: "f",
                value: 0.5
            }
        },
        fragmentShader: raymarchFrag,
        vertexShader: basicVert
    },
    'textStencil': {
        uniforms: {
            "tDiffuse": {
                type: "t",
                value: null
            },
            "tText": {
                type: "t",
                value: null
            }
        },
        fragmentShader: textStencilFrag,
        vertexShader: basicVert
    },
    'shape1': {
        uniforms: {
            "tDiffuse": {
                type: "t",
                value: null
            },
            "tTwo": {
                type: "t",
                value: null
            },
            "amp": {
                type: "f",
                value: 0.5
            }
        },
        fragmentShader: shape1Frag,
        vertexShader: basicVert
    },
    bit: require('./BitShader'),
    copy: CopyShader
};

export default Shaders
