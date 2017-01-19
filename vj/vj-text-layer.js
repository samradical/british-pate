import THREE from 'three';
import _ from 'lodash';

const W = 640;
const H = 360;

const AREAS = 4;
class TextCanvas {

  constructor(el) {
  	this.videoElement = el;
  	this.windowW = window.innerWidth;
  	this.windowH = window.innerHeight;
  	this.containerRatio = W / H;

    this._init();


  }

  _createCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    document.body.appendChild(c)
    return c;
  }

  _init(){
    this.frameBuffer = this._createCanvas(W, H);
    this.bufferCtx = this.frameBuffer.getContext("2d");
    this.bufferCtx.font = "120px serif";
    this.bufferCtx.fillStyle = "#ff00ff";
    this.bufferCtx.fillText("Hello world", 0, 200);

    this.currentTexts = ['topic 1', 'topic 2', 'topic 3', 'topic 4'];
    this.areas = [];
    this.areaCanvases = [];
    this.areaContexts = [];
    for (var i = 0; i < AREAS; i++) {
      let x = (i % 2 === 0) ? 0 : W / 2;
      let y = (i < 2) ? 0 : H / 2;
      let c = this._createCanvas(W/2,H/2);
      let ctx = c.getContext('2d');
      this.areaCanvases.push(c);
      this.areaContexts.push(ctx);
      this.areas.push({x,y});
    }

    this.texture = new THREE.Texture(this.frameBuffer);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.needsUpdate = true;

    this.setText(this.currentTexts);
    this.renderTexts();
  }

  getCanvas(){
  	return this.frameBuffer;
  }

  getTexture(){
    return this.texture;
  }

  setText(textList){
    this.currentTexts = textList;
    _.each(this.currentTexts,(t,i)=>{
      this.areaContexts[i].clearRect(0, 0, W/2, H/2);
      this.areaContexts[i].font = "20px serif";
      this.areaContexts[i].fillStyle = "#ff00ff";
      this.areaContexts[i].fillText(t,W*0.25,H*0.25);
    });
  }

  renderTexts(){
    this.bufferCtx.clearRect(0, 0, W, H);
    console.log(this.areas);
    _.each(this.currentTexts,(t,i)=>{
        this.bufferCtx.drawImage(this.areaCanvases[i], this.areas[i].x, this.areas[i].y);
    });
  }

  onResize(w, h){
    this.windowW = w;
    this.windowH = h;
  }


};
export default TextCanvas;
