#pragma glslify: Desaturate = require(./desaturate);

vec3 plasmaOne(vec2 st, float u_time) {
	float x = st.x;
	float y= st.y;
	float mov0 = x+y+cos(sin(u_time))*100.+sin(x/100.)*1000.;
	float mov1 = y / 0.9 +  u_time;
	float mov2 = x / 0.2;
	float c1 = abs(sin(mov1+u_time)/2.+mov2/2.-mov1-mov2+u_time);
	float c2 = abs(sin(c1+sin(mov0/1000.+u_time)+sin(y/40.+u_time)+sin((x+y)/100.)*3.));
	float c3 = abs(sin(c2+cos(mov1+mov2+c2)+cos(mov2)+sin(x/1000.)));
	vec3 cc = vec3(c1,c2,c3) * 0.7;
    return Desaturate(cc,1.0);
}

#pragma glslify: export(plasmaOne)