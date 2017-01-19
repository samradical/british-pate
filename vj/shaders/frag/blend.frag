precision mediump float;

uniform sampler2D background;
uniform sampler2D foreground;

uniform int blendMode;
uniform float blendOpacity;
uniform float rockOpacity;

varying vec2 vUv;

#define BG_REPEAT 1.0;
#pragma glslify: blend = require(../glsl/all);

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
  vec3 mixxed = mix(fgColor.rgb, bgColor.rgb, rockOpacity);
  vec3 color = blend(blendMode, bgColor.rgb, mixxed, blendOpacity);
  gl_FragColor = vec4(color,1.0);
}
