// TerrainView.js

import alfrid from '../lib/alfrid';
import lodash from 'lodash';
let GL = alfrid.GL;

import vs from "./basic_vert"
import fs from "./basic_frag"

const AMP = 30
const W = 2
const H = 2
const SEG = 2
const A = 1.597051597

class TerrainView extends alfrid.View {

    constructor(params = {}) {
        super(vs, fs);
        this._texures = []
        this._texuresLength = 0
        this.rotation = Math.PI / 2
        this.scale = params.scale || 1
        this._segments = params.segments || SEG
        this._w = params.width || W
        this._h = params.height || H
        this._amp = params.amp || AMP
        this.x = 0
        this.y = 0
        this.z = 0
        this._initMesh()

        this._c = 0
    }

    _initMesh() {
        this.mesh = alfrid.Geom.plane(this._w, this._h, this._segments, false);
    }

    set canvas(c) {
        this._canvas = c[0]
        //this._canvas = document.getElementById('tt')
        this._tex = new alfrid.GLTexture(this._canvas);
    }




    render() {
        this.shader.bind();
        if (this._c % 2 === 0) {
            this._tex.updateTexture(this._canvas)
        }
        if (this._tex) {
            this.shader.uniform("texture", "uniform1i", 0);
            this._tex.bind(0);
        }
        //this.shader.uniform("aspect", "float", A);
        /*this.shader.uniform("position", "vec3", [this.x , this.y , this.z ]);
        this.shader.uniform("scale", "vec3", [this.scale, this.scale, this.scale]);
        this.shader.uniform("rotation", "float", this.rotation);
        this.shader.uniform("heightMap", "float", this._amp);*/
        this._c++
            GL.draw(this.mesh);
    }


}

export default TerrainView;