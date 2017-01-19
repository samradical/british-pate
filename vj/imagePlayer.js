import Emitter from 'emitter';

function ImageCanvas(options = {}) {

  var el = options.el || document.body;

  var _transitionValue = 0;
  var _transitionDirection = 1;
  var MS = 1000 / 60;
  var IMAGE_TIME = 100;
  var TRANSITION_TIME = 4000;

  var W = 659;
  var H = 480;
  var containerRatio = W / H;

  var _startTime;
  var _updateCounter = 1;
  var _millisecond = 0;
  var _second = 0;

  var _imageIndex = -1;
  var _activeEl = -1;

  var _imageSources;
  var _loading = [];
  var _transitioning = false;
  var _transitionDelay = 100;
  var _transitionTotal;

  var canvas = [_createCanvas('canvas1'), _createCanvas('canvas2')];
  var ctx1 = canvas[0].getContext("2d");
  var ctx2 = canvas[1].getContext("2d");

  var images = [_createImage(), _createImage()];

  images[0].onload = function() {
    _draw(images[0], ctx1);
    _loading[0] = false;
    _transitionDelay = 100;
  };

  images[1].onload = function() {
    _draw(images[1], ctx2);
    _loading[1] = false;
    _transitionDelay = 100;
  };

  function _draw(image, ctx) {

    image.loading = false;
    var w = image.width;
    var h = image.height;
    var s = _getNewSize(w, h);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    var diffH = 0;
    if (s.h > H) {
      diffH = s.h - H;
      diffH *= 0.5;
    }
    var diffW = 0;
    if (s.w > H) {
      diffW = s.w - W;
      diffW *= 0.5;
    }
    ctx.drawImage(image, 0, 0, w, h, -diffW, -diffH, s.w, s.h);
  }

  function _createCanvas(id) {
    var canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = W;
    canvas.height = H;
    return canvas;
  }

  function _createImage() {
    return new Image();
  }

  function _getNewSize(w, h) {
    var videoWidth = w;
    var videoHeight = h;

    var elRatio = videoWidth / videoHeight;
    var scale, x, y;

    // define scale
    if (containerRatio > elRatio) {
      scale = W / videoWidth;
    } else {
      scale = H / videoHeight;
    }
    // define position
    if (containerRatio === elRatio) {
      x = y = 0;
    } else {
      x = (W - videoWidth * scale) * 0.5 / scale;
      y = (H - videoHeight * scale) * 0.5 / scale;
    }

    var newVideoWidth = videoWidth * scale;
    var newVideoHeight = videoHeight * scale;
    return {
      w: newVideoWidth,
      h: newVideoHeight
    };
  }

  function nextImage(el) {
    _imageIndex++;
    el.loading = true;
    el.crossOrigin = "anonymous";
    if(!_imageSources){
      return;
    }
    el.src = _imageSources[_imageIndex];
  }

  function getActiveEl() {
    _activeEl++;
    _loading[_activeEl % 2] = true;
    return images[_activeEl % 2];
  }

  function _transition() {
    _transitionTotal -= MS;
    _transitionTotal = Math.max(_transitionTotal, 0);
    var tv = _transitionTotal / TRANSITION_TIME;
    if (_activeEl % 2 === 0) {
      //the second canvas is visible when the value is at 1
      _transitionValue = 1 - tv;
    } else {
      _transitionValue = tv;
    }
    if (_transitionTotal <= 0) {
      if(_transitionDirection === 0){
        _transitionDirection = 1;
      }else{
        _transitionDirection = 0;
      }
      nextImage(getActiveEl());
      _transitioning = false;
    }
  }

  //****************
  //****************
  function init() {
    nextImage(getActiveEl());
    nextImage(getActiveEl());
  }

  function update() {
    var i = 0;
    var l = _loading.length;
    var canUpdate = true;
    for (i; i < l; i++) {
      if(_loading[i]){
        canUpdate = false;
      }
    }
    if (!canUpdate) {
      return;
    }
    if (_transitioning) {
      _transition();
      return;
    }
    if (_millisecond > IMAGE_TIME) {
      _millisecond = 0;
      _transitionTotal = TRANSITION_TIME;
      _transitioning = true;
    }
    _millisecond += MS;
  }

  function setImages(json) {
    _imageSources = json;
  }

  function setTransitionTime(time){
    TRANSITION_TIME = time;
  }

  function setImageHold(time){
    IMAGE_TIME = time;
  }

  function getTransitionValue(){
    return _transitionValue;
  }

  return {
    init: init,
    update: update,
    setImages: setImages,
    getTransitionValue:getTransitionValue,
    setTransitionTime:setTransitionTime,
    setImageHold:setImageHold,
    canvas:canvas
  }
}


export default ImageCanvas;
