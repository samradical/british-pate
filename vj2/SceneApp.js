// SceneGen.js

import alfrid, { Scene } from '../lib/alfrid'

const GL = alfrid.GL;
import ViewSun from './TextureView'
class SceneGen extends alfrid.Scene {
    constructor() {
        super({  });
        let canvas = document.createElement("canvas");
        canvas.className = 'Main-Canvas';
        document.body.appendChild(canvas);
        GL.init(canvas);
        console.log(this);
    }

    _initViews() {
        
    }

    _initTextures() {}

    _initLights() {

    }

    setCanvas(canvas){
        this._sun = new ViewSun()
        this._sun.canvas = canvas
    }

    render() {
        GL.setMatrices(this.cameraOrtho)
        this._sun.render()
    }

    resize() {
        var w = w || window.innerWidth;
        var h = h || window.innerHeight;
        var a = h / w;
        var cameraWidth, cameraHeight;
        var scale;
        if (a < 407 / 640) {
            scale = w / 640;
        } else {
            scale = h / 407;
        }
        cameraHeight = 407 * scale;
        cameraWidth = 640 * scale;
        console.log(a);
        this.cameraOrtho.setBoundary(1, -1, a, -a)
        GL.setSize(w, h);
        this.camera.setAspectRatio(GL.aspectRatio);
    }
}


export default SceneGen;