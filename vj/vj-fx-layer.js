import THREE from 'three';
import _ from 'lodash';
import FxComposer from './vj-fx-composer';
import Shaders from './shaders/shaders';
import Emitter from './utils/emitter';
import Proxxy from './utils/proxy';
import Utils from './utils/utils';

const FPS = 30;

const DEFAULT = {
    time: 0.5,
    passes: [{
        type: 'shapeMix',
        textures: {
            'tOne': 0,
            'tTwo': 1
        },
    }, {
        type: 'color',
        uniforms: {
            uSaturation: 0.5,
            uBrightness: 0,
            uContrast: 0.,
            uHue: 1
        }
    }]
}

class FxLayer {
    constructor(source, renderer, camera, effectsControl = DEFAULT, options = {}) {
        options = options || {};
        this.options = options;
        this.counter = 0;
        let VIDEO_WIDTH = options.width || 640;
        let VIDEO_HEIGHT = options.height || 360;
            // Setup scene
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0xffffff));

        let renderTargetParameters = {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        };


        this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
        this.fbo.texture.minFilter = renderTargetParameters.minFilter
        this.fbo.texture.magFilter = renderTargetParameters.magFilter

        this.texture = new THREE.Texture(source);
        this.texture.minFilter = THREE.NearestFilter;
        this.texture.magFilter = THREE.NearestFilter;

        this.bonusTexture = new THREE.Texture(options.texture);
        this.bonusTexture.minFilter = THREE.NearestFilter;
        this.bonusTexture.magFilter = THREE.NearestFilter;

        let videoMaterial = new THREE.MeshBasicMaterial({
            map: this.texture
        });

        this._textures = [this.texture, this.bonusTexture]

        var planeGeometry = new THREE.PlaneBufferGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 2, 2);
        this._mesh = new THREE.Mesh(planeGeometry, videoMaterial);
        this.scene.add(this._mesh);

        var renderPass = new THREE.RenderPass(this.scene, camera);
        var effectCopy = new THREE.ShaderPass(Shaders.copy, camera);

        this._passes = []
        this._effectControls = {}
        //this._effectChangedBound = this._onEffectChanged.bind(this)

        _.each(effectsControl.passes, (passControl) => {
            let _shader = Shaders[passControl.type]
            if (!_shader) {
                throw new Error(`No Render effect shader by type ${pass.type}`)
            }
            let _pass = new THREE.ShaderPass(_shader);
            if (passControl.uniforms) {
                _.forIn(passControl.uniforms, (val, key) => {
                    _pass.uniforms[key].value = val
                })
            }
            if (passControl.textures) {
                _.forIn(passControl.textures, (val, key) => {
                    _pass.uniforms[key].value = this._textures[val]
                })
            }

            let _effectControlProxy = new Proxxy(passControl, this._onEffectChanged.bind(_pass)).proxy
            this._effectControls[passControl.type] = _effectControlProxy

            this._passes.push(_pass)
        })



       /* this.shapeMix = new THREE.ShaderPass(Shaders.shapeMix);
        this.shapeMix.uniforms['tOne'].value = this.texture;
        this.shapeMix.uniforms['tTwo'].value = this.bonusTexture;

        this.color = new THREE.ShaderPass(Shaders.color);
        //this.color.uniforms['tDiffuse'].value = this.fbo;
        this.color.uniforms['uSaturation'].value = this.effectsControl.color.uSaturation
        this.color.uniforms['uBrightness'].value = this.effectsControl.color.uBrightness
        this.color.uniforms['uContrast'].value = this.effectsControl.color.uContrast
        this.color.uniforms['uHue'].value = this.effectsControl.color.uHue

        this.shapeMixKeys = Object.keys(this.effectsControl.shapeMix);
        this.colorKeys = Object.keys(this.effectsControl.color);
        this.uniformsLength = this.colorKeys.length*/

        this.composer = new THREE.EffectComposer(renderer, this.fbo);
        this.composer.addPass(renderPass);
        this._passes.forEach(pass=>{
            this.composer.addPass(pass)
        })
        /*this.composer.addPass(this.shapeMix);
        this.composer.addPass(this.color);*/
        this.composer.addPass(effectCopy);

        /* setInterval(()=>{
             let _val =  this.shapeMix.uniforms['uModes'].value + 1
             if(_val > 1){
                 _val = 0
             }
         },30000 * (options.index+1))

         this.shapeMix.uniforms['uModes'].value = 0*/
        //this.fx = new FxComposer(this.scene, camera, renderer, this._mesh, this.fbo);
    }

    get effectControls(){
        return this._effectControls
    }

    /*Bounds to a PASS*/
    _onEffectChanged(prop, val) {
        let _o = Utils.ObjectbyString(this, prop)
        _o.value = val
    }

    render(rtt) {
        //this.shapeMix.uniforms['uTime'].value = (this.counter * (0.1 * this.effectsControl.time) + 0.001 + 109 * this.options.index)
        if (this.counter % 2 === 0) {
            let i = 0;
            /*for (i; i < this.uniformsLength; i++) {
                let _key = this.colorKeys[i];
                let _value = this.color.uniforms[_key].value
                let _newValue = this.effectsControl.color[_key].value
                if (_value !== _newValue && _newValue !== undefined) {
                    this.color.uniforms[_key].value = _newValue
                }
            }
            i = 0
            for (i; i < this.shapeMixKeys.length; i++) {
                let _key = this.shapeMixKeys[i];
                if(this.shapeMix.uniforms[_key]){
                    let _value = this.shapeMix.uniforms[_key].value
                    let _newValue = this.effectsControl.shapeMix[_key].value
                    if (_value !== _newValue && _newValue !== undefined) {
                        this.shapeMix.uniforms[_key].value = _newValue
                    }
                }
            }*/
            this.texture.needsUpdate = true;
        } else {
            this.texture.needsUpdate = false;
        }
        //this.fx.render();
        this.composer.render();
        this.counter++;
    }


    resize(w, h, vW, vH, scale) {
        let x = (w - vW * scale) * 0.5 / scale;
        let y = (h - vH * scale) * 0.5 / scale;
        this._mesh.scale.x = this._mesh.scale.y = scale;
        this._mesh.position.x = x;
        this._mesh.position.y = y * -1.;
        this.fbo.setSize(w, h);
    }
};

export default FxLayer;