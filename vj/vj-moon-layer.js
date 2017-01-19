'use strict';
import THREE from 'three';
import Playlist from 'playlist';
import dat from 'dat-gui';
import FxComposer from './vj-fx-composer';
import Shaders from './shaders/shaders';
import ShaderLib from './shaders/shader_lib';
import ImagePlayer from './imagePlayer';
import ServerServise from 'serverService';

import ControlPerameters from './vj-control-perameters';
import EaseNumbers from 'ease-number';

const FPS = 30;

class MoonLayer {
	constructor(renderer, camera) {
		this.counter = 0;
		let VIDEO_WIDTH = 640;
		let VIDEO_HEIGHT = 360;

		this._noteIndex = 0;
		this._noteValue = 0;
		this.pitchEase = EaseNumbers.addNew(0, 0.3);

		// Setup scene
		this.scene = new THREE.Scene();
		this.scene.add(new THREE.AmbientLight(0xffffff));

		this.imagePlayer = new ImagePlayer({el:renderer.domElement.parentNode});

		let options = {
			transitionTime: 1000,
			imageHold: 1000
		};

		this.gui = new dat.GUI();
		this.gui.add(options, 'transitionTime', 10, 2000).onChange((val) => {
			this.imagePlayer.setTransitionTime(val);
		});
		this.gui.add(options, 'imageHold', 1, 2000).onChange((val) => {
			this.imagePlayer.setImageHold(val);
		});

		ServerServise.getManifest().then(data => {
			let urls = Playlist.getUrlsByType(data, 'minerals');
			this.imagePlayer.setImages(urls);
			this.imagePlayer.init();
		});

		let renderTargetParameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false
		};

		this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
		this.fbo.texture.minFilter = THREE.LinearFilter;
		this.fbo.texture.magFilter = THREE.LinearFilter;

		this.texture1 = new THREE.Texture(this.imagePlayer.canvas[0]);
		this.texture1.minFilter = THREE.LinearFilter;
		this.texture1.magFilter = THREE.LinearFilter;
		this.texture2 = new THREE.Texture(this.imagePlayer.canvas[1]);
		this.texture2.minFilter = THREE.LinearFilter;
		this.texture2.magFilter = THREE.LinearFilter;

		this.mixPass = new THREE.ShaderPass(Shaders.mix, this.camera);
		this.mixPass.uniforms["blendOpacity"].value = 0;
		this.mixPass.uniforms['background'].value = this.texture1;
		this.mixPass.uniforms['foreground'].value = this.texture2;

		this.colorPass = new THREE.ShaderPass(Shaders.color, this.camera);
		this.colorPass.uniforms["uContrast"].value = 0.5;
		this.colorPass.uniforms["uSaturation"].value = 0.5;
		this.colorPass.uniforms['tDiffuse'].value = this.fbo;

		let videoMaterial = new THREE.MeshBasicMaterial({
			map: this.fbo
		});

		var planeGeometry = new THREE.PlaneBufferGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 2, 2);
		this._mesh = new THREE.Mesh(planeGeometry, videoMaterial);
		this.scene.add(this._mesh);

		var renderPass = new THREE.RenderPass(this.scene, camera);
		var effectCopy = new THREE.ShaderPass(Shaders.copy, camera);
		this.composer = new THREE.EffectComposer(renderer, this.fbo);
		this.composer.addPass(renderPass);
		this.composer.addPass(this.mixPass);
		this.composer.addPass(this.colorPass);
		this.composer.addPass(effectCopy);
		//this.fx = new FxComposer(this.scene, camera, renderer, this._mesh, this.fbo);
	}

	render(rtt) {
		this.mixPass.uniforms["blendOpacity"].value = this.imagePlayer.getTransitionValue();
		let _d = ControlPerameters.analyzeVo.note / 11 || 0
		if(_d !==this._noteValue){
			this.pitchEase.target = _d * 0.75
			this._noteValue = _d
		}
		// this._noteValue = ControlPerameters.analyzeVo.note / 11
		// if(ControlPerameters.analyzeVo.note > this._noteIndex){
		// 	this._noteValue += 0.01
		// 	//this._noteValue = Math.min(this._noteValue, 1.0)
		// 	//this._noteValue = this._noteValue % 1
		// 	//this.pitchEase.target = this._noteValue
		// 	this.pitchEase.target = Math.sin(this._noteValue) * .5 + 0.5
		// }else if(ControlPerameters.analyzeVo.note < this._noteIndex){
		// 	this._noteValue -= 0.01
		// 	//this._noteValue = this._noteValue % 1
		// 	//this._noteValue = Math.max(this._noteValue, 0)
		// 	this.pitchEase.target = Math.sin(this._noteValue) * .5 + 0.5//this._noteValue
		// }
		//console.log(this.pitchEase.target);
		//this._noteIndex = ControlPerameters.analyzeVo.note
		//console.log(this.pitchEase.value);
		this.colorPass.uniforms["uSaturation"].value = this.pitchEase.value
		this.imagePlayer.update();
		this.texture1.needsUpdate = true;
		this.texture2.needsUpdate = true;
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
	}
};

export default MoonLayer;
