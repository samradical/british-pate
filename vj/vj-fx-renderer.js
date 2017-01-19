import THREE from 'three';
import ShaderLib from './shaders/shader_lib';
import Shaders from './shaders/shaders';
import EaseNumbers from './utils/ease-numbers';
import Utils from './utils/utils';
import Proxxy from './utils/proxy';

//import FxComposer from './vj-fx-layer';
import ControlPerameters from './vj-control-perameters';
//import ServerServise from 'serverService';
import FxLayer from './vj-fx-layer';
//import BlendModes from './vj-fx-layer';
// import MoonLayer from './vj-moon-layer';
// import ShapeLayer from './vj-shape-layer';
// import TextCanvas from './vj-text-layer';


import {
    createShaderPass
}
from './vj-shader-pass';

let VIDEO_WIDTH = 853;
let VIDEO_HEIGHT = 480;

const RENDERER_EFFECT = {
        type: 'blend',
        textures: {
            'background': 0,
            'foreground': 1
        },
        uniforms: {
            blendMode: 15
        }
    }
    /*
    OPTIONS
    record
    */
class Renderer {
    constructor(parentEl, options = {}) {
        this.options = options

        VIDEO_WIDTH = options.videoWidth || VIDEO_WIDTH
        VIDEO_HEIGHT = options.videoHeight || VIDEO_HEIGHT

        this.time = 0;
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            preserveDrawingBuffer: options.record || false
        });

        parentEl.appendChild(this.renderer.domElement);

        this._init();
    }

    _init() {
        this.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerHeight / 2, window.innerHeight * 0.5, window.innerHeight * -0.5, 0, 1000);
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0xffffff));
    }

    /*
    Only accepts 1 or 2
    */
    init(textures, rendererEffects = [RENDERER_EFFECT], effectLayerControllers = []) {

        this._rendererEffectProxies = {}

        rendererEffects.forEach(pass => {
            this._rendererEffectProxies[pass.type] = new Proxxy(pass, (prop, val, proxy) => {
                let _pass = this.passes[proxy.type]
                if (_pass[prop]) {
                    _pass[prop] = val
                } else {
                    let _o = Utils.ObjectbyString(_pass, prop)
                    _o.value = val
                }
            }).proxy
        })

        this._layers = []


        textures.forEach((texture, i) => {
            let _l = new FxLayer(
                texture[0],
                this.renderer,
                this.camera,
                effectLayerControllers[i], {
                    index: i,
                    width: VIDEO_WIDTH,
                    texture: texture[1],
                    height: VIDEO_HEIGHT
                });
            this._layers.push(_l)
        })

        this._layersLength = this._layers.length

        this._createFbo()

        let videoMaterial = new THREE.MeshBasicMaterial({
            map: this.fbo
        });

        let quadgeometry = new THREE.PlaneBufferGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 2, 2);
        this.mesh = new THREE.Mesh(quadgeometry, videoMaterial);
        this.scene.add(this.mesh);

        this.controls = ControlPerameters.renderer
        this.controlKeys = Object.keys(ControlPerameters.renderer)
        this.controlKeysLength = this.controlKeys.length

        this.onWindowResize();
    }

    _createFbo() {
        if (this._layersLength === 1) {
            this.fbo = this._layers[0].fbo
        } else {
            let renderTargetParameters = {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBFormat,
                stencilBuffer: false
            };

            this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
            this.fbo.texture.minFilter = THREE.LinearFilter;
            this.fbo.texture.magFilter = THREE.LinearFilter;

            var renderPass = new THREE.RenderPass(this.scene, this.camera);
            var effectCopy = new THREE.ShaderPass(Shaders.copy, this.camera);
            this.composer = new THREE.EffectComposer(this.renderer, this.fbo);

            this.composer.addPass(renderPass);
            this.passes = {}
            _.forIn(this._rendererEffectProxies, (proxy) => {
                let _shader = Shaders[proxy.type]
                if (!_shader) {
                    throw new Error(`No Render effect shader by type ${proxy.type}`)
                }
                let _pass = new THREE.ShaderPass(_shader, this.camera);
                _pass.enabled = proxy.enabled
                _.forIn(proxy.uniforms, (val, key) => {
                    _pass.uniforms[key].value = val
                })

                _.forIn(proxy.textures, (val, key) => {
                    _pass.uniforms[key].value = this._layers[val].fbo
                })

                this.composer.addPass(_pass);

                this.passes[proxy.type] = _pass
            })

            this.composer.addPass(effectCopy);
        }
    }

    /*    _onRendererEffectChanged(prop, val) {
            let _o = Utils.ObjectbyString(this.rendererEffectPass, prop)
            _o.value = val
        }
    */
    get effectControllers() {
        return this._rendererEffectProxies
    }

    get layers() {
        return this._layers
    }

    update() {
        this._threeRender();
        this.time++;
    }

    onWindowResize(w, h) {
        var w = w || window.innerWidth;
        var h = h || window.innerHeight;
        var a = h / w;
        var cameraWidth, cameraHeight;
        var scale;
        if (a < VIDEO_HEIGHT / VIDEO_WIDTH) {
            scale = w / VIDEO_WIDTH;
        } else {
            scale = h / VIDEO_HEIGHT;
        }
        cameraHeight = VIDEO_HEIGHT * scale;
        cameraWidth = VIDEO_WIDTH * scale;
        this.camera.left = cameraWidth / -2;
        this.camera.right = cameraWidth / 2;
        this.camera.top = cameraHeight / 2;
        this.camera.bottom = cameraHeight / -2;
        this.camera.updateProjectionMatrix();
        for (var i = 0; i < this._layersLength; i++) {
            this._layers[i].resize(w, h, VIDEO_WIDTH, VIDEO_HEIGHT, scale)
        }
        this.mesh.scale.x = this.mesh.scale.y = scale;

        this.renderer.setSize(cameraWidth, cameraHeight);
        if (this.options.record) {
            this.renderer.setSize(VIDEO_WIDTH, VIDEO_HEIGHT);
        }
    }

    _threeRender() {
        for (var i = 0; i < this._layersLength; i++) {
            this._layers[i].render()
        }
        if (this.composer) {
            this.composer.render()
        }
        this.renderer.render(this.scene, this.camera, null, true);
    }

    get canvas() {
        return this.renderer.domElement
    }

}

export default Renderer