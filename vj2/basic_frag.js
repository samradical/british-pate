const F = `

// basic.frag

#define SHADER_NAME BASIC_FRAGMENT

precision highp float;
varying vec2 vTextureCoord;
uniform float time;
uniform sampler2D texture;

void main(void) {
	float _x = 1. - vTextureCoord.x;
	float _y = 1. - vTextureCoord.y;
	vec4 color = texture2D(texture,vec2(_x,_y));
    gl_FragColor = vec4(color.rgb,1.0);
    //gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), 1.0);
}

`

export default F