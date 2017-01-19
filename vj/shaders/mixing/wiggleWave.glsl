float wiggleWave(vec2 st, float size, float intensity, float u_time) {
	size *= 2.0 - 1.0;
	intensity -= 0.5;
	return smoothstep(size, 0.7, 1.0 - abs(2.5*(st.x+sin(st.y*2.0+u_time)*-intensity - 0.5)));
}

#pragma glslify: export(wiggleWave)