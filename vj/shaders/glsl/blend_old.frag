precision mediump float;

uniform sampler2D background;
uniform sampler2D foreground;

uniform int blendMode;
uniform float blendOpacity;
uniform int blendDirection;
uniform float bgOpacity;
uniform float fgOpacity;

varying vec2 vUv;

#define BG_REPEAT 1.0;
#pragma glslify: blend = require(./glsl/all);

float PI = 3.14159265359;

float map(float v, float a, float b, float x, float y) {
  if(v == a){
    return x;
  }else{
    return (v - a) * (y - x) / (b - a) + x;
  }
}


void main() {
  vec4 bgColor = texture2D(background, vUv);
  vec4 fgColor = texture2D(foreground, vUv);
  vec4 outputColor = mix(fgColor, bgColor, blendOpacity);

  vec4 activeColor;
  vec4 inactiveColor;
  float ba = blendOpacity;
  if(blendOpacity == 1.){
    ba = 1. - blendOpacity;
    activeColor = fgColor;
    inactiveColor = bgColor;
  }else{
    activeColor = bgColor;
    inactiveColor = fgColor;
  }
  //vec4 oo = mix(vec4(vec3(0.0),1.0),activeColor, ba); //bad

  //float mappedOpacity = map(ba, 0.0, 1.0, 0.0, PI*2.0);
  //vec3 color = blend(blendMode, oo.rgb, outputColor.rgb, sin(mappedOpacity));
  //vec3 color = blend(blendMode, oo.rgb, outputColor.rgb, 0.5);
  gl_FragColor = vec4(outputColor.rgb,1.0);



  /*
  if (blendMode != 0) {
    if (blendOpacity >= 1.0) {
      color = fgColor.rgb;
      //color = blend(blendMode, bgColor.rgb, fgColor.rgb);
    } else {
      float mappedOpacity = map(blendOpacity, 0.0, 1.0, 0.0, PI);
      color = blend(blendMode, bgColor.rgb, fgColor.rgb, sin(mappedOpacity));
    }
  }
  vec4 _fg = fgColor;
  bgColor *= vec4(vec3(blendOpacity),1.0);
  if (blendOpacity > 0.0) {
    if (blendOpacity < 1.0) {
      _fg = fgColor * vec4(vec3(1. - blendOpacity),1.0);
    }
  }
  fgColor = _fg;
  //fgColor.w = 1. - blendOpacity;

  vec4 activeColor;
  vec4 inactiveColor;
  if(blendDirection != 0){
    activeColor = fgColor;
    inactiveColor = bgColor;
  }else{
    activeColor = bgColor;
    inactiveColor = fgColor;
  }
  vec4 outputColor = mix(activeColor, inactiveColor, 0.5);
  float mappedOpacity = map(blendOpacity, 0.0, 1.0, 0.0, PI);
  vec3 color = blend(blendMode, outputColor.rgb, inactiveColor.rgb, 1.0);
  gl_FragColor =outputColor;// vec4(color.rgb,1.0);
  */
}
