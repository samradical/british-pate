# ifdef GL_ES
precision mediump float;
# endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


varying vec2 vUv;

vec2 rotate(vec2 pos, float angle){
	float c = cos(angle);
	float s = sin(angle);
	return mat2(c, s, -s, c) * pos;
}

float sphere(vec3 pos, float radius) {
	return length(pos) - radius;
}

float box(vec3 pos, vec3 size) {
	return length(max(abs(pos) - size, 0.0));
}

float box(vec3 pos, vec3 size, float radius) {
	return length(max(abs(pos) - size, 0.0)) - radius;
}

float plane(vec3 pos) {
	return pos.y;
}

vec3 albedo(vec3 pos){
	float f =  smoothstep(0.2, 0.8, fract(pos.x - sin(pos.z) * 0.4));
	return vec3(f);
}

float map(vec3 pos) {
	float planeDist = plane(pos);

	pos.xy = rotate(pos.xy, pos.z * 0.01);

	//mirror
	pos.x = abs(pos.x);
	float offset = 6.0;
	pos = mod(pos + offset , (offset * 2.0)) - offset;

	pos.xy = rotate(pos.xy, u_time * 0.7);
	pos.xz = rotate(pos.xz, u_time * 0.7);

	return box(pos, vec3(2.0), 1.0);
}


vec3 computeNormal(vec3 pos){
	vec2 eps = vec2(0.01,0.0);

	return normalize(vec3(
		map(pos + eps.xyy) - map(pos - eps.xyy),
		map(pos + eps.yxy) - map(pos - eps.xyy),
		map(pos + eps.yyx) - map(pos - eps.yyx)
		));

}

vec3 lightDirection = normalize(vec3(1.0,0.0,1.0));

float diffuse(vec3 normal){

	//return max(dot(normal, lightDirection), 0.0);

	//wrapp lighting
	return dot(normal, lightDirection) * 0.5 + 0.5;
}

float specular(vec3 normal, vec3 dir){
	vec3 h = normalize(normal - dir);
	return pow(max(dot(h, normal),0.0),100.0);
}



void main() {
	float zDepth = -6.0;
	vec3 pos = vec3(sin(u_time * 0.2) * 4.0, 2.0 * sin(u_time * 0.4) + 8.0, zDepth);
	//vec2 st = gl_FragCoord.xy / u_resolution.xy;
	vec2 st = vUv;
	st = st - vec2(0.5);
	vec3 dir = normalize(vec3(st, 1.0));

	vec3 color = vec3(0.0);

	for (int i = 0; i < 24; i++) {
		float d = map(pos);
		if (d < 0.001) {
			vec3 normal = computeNormal(pos);
			float diff = diffuse(normal);
			float spec = specular(normal, dir);
			float lightDepth = abs(sin(u_time) * zDepth) * 4.0;
			float lightDistance = sphere(pos, lightDepth);
			vec3 c = fract(pos);
			//fake,, 20.0 / (lightDistance *lightDistance) * 
			color = 20.0 / (lightDistance *lightDistance) * c; //albedo(pos);
			break;
		}
		pos += d * dir;
	}

	float fogFactor = exp(-pos.z * 0.08);
	color  = mix(vec3(0.0,0.0, 0.0), color, fogFactor);
	//with diffuse
	//gl_FragColor = vec4(vec3(diffuse(computeNormal(pos))), 1.0);

	gl_FragColor = vec4(color, 1.0);
}