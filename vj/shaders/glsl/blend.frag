precision mediump float;

uniform sampler2D background;
uniform sampler2D foreground;

uniform int blendMode;
uniform float blendOpacity;
uniform float rockOpacity;

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
  vec3 mixxed = mix(bgColor.rgb, fgColor.rgb, 0.0);
  //float mappedOpacity = map(ba, 0.0, 1.0, 0.0, PI*2.0);
  //vec3 color = blend(blendMode, oo.rgb, outputColor.rgb, sin(mappedOpacity));
  //vec3 color = blend(blendMode, oo.rgb, outputColor.rgb, sin(mappedOpacity));
  vec3 color = blend(blendMode, mixxed, bgColor.rgb, 1.0);
  gl_FragColor = vec4(bgColor.rgb,1.0);
}
