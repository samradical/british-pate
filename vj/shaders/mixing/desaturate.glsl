 vec3 Desaturate(vec3 color, float Desaturation) {
 	vec3 grayXfer = vec3(0.3, 0.59, 0.11);
 	vec3 gray = vec3(dot(grayXfer, color));
 	return vec3(mix(color, gray, Desaturation));
 }

#pragma glslify: export(Desaturate)