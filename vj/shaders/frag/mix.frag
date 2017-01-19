precision mediump float;

uniform sampler2D background;
uniform sampler2D foreground;

uniform float blendOpacity;

varying vec2 vUv;


void main() {
  vec3 bgColor = texture2D(background, vUv).rgb;
  vec3 fgColor = texture2D(foreground, vUv).rgb;

  gl_FragColor = vec4(mix(fgColor, bgColor, blendOpacity), 1.0);
}