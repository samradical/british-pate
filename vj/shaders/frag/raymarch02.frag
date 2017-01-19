// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

# ifdef GL_ES
precision mediump float;
# endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

uniform sampler2D tDiffuse;
uniform sampler2D u_tex0;

uniform float u_anim;
uniform float u_color;

uniform float u_torusAmp;
uniform float u_torusSharpness;

uniform float u_sphereRadius;

const float minTSharp = 0.3;
const float maxTSharp = 3.0;
const float minTAmp = 0.2;
const float maxTAmp = 2.0;
const float minSRadius = 0.3;
const float maxSRadius = 3.0;

const float minTwist = 1.0;
const float maxTwist = 4.0;

varying vec2 vUv;

float anim = 0.3;
float sphereRadius = 2.0;
float torusSharpness = 3.0;
float torusAmp = 0.1;
float colorMod = 30.0;
float twistXMod = 0.3;
float twistYMod = 9.0;

/*
float intersectPlane(vec3 pos, vec3 dir){
	return pos.y / dir.y;
}

float intersectSphere(vec3 pos, vec3 dir){
	float a = dot(dir, dir);
	float b = 2.0 * dot(pos, dir);
	float c = dot(pos, pos) - 1.0;
	float discriminant = b * b - 4.0 * a * c;
	return (-b - sqrt(discriminant)) / (2.0 * a);
}*/
float length8( vec2 p )
{
	p = p*p; p = p*p; p = p*p;
	return pow( p.x + p.y, 1.0/8.0 );
}


float sdTorus( vec3 p, vec2 t )
{
  return length( vec2(length(p.xz)-t.x,p.y) )-t.y * 4.0;
}

float sdTorusDeformed( vec3 p, vec2 t)
{
  return length( vec2(length(p.xz)-t.x,p.y * torusSharpness) )-t.y * torusAmp;
}

vec2 rotate(vec2 pos, float angle){
	float c = cos(angle);
	float s = sin(angle);
	return mat2(c, s, -s, c) * pos;
}

float sphere(vec3 pos, float radius) {
	return length(pos) - radius;
}

vec3 albedo(vec3 pos){
	float f =  smoothstep(0.2, 0.8, fract(pos.x - sin(pos.z) * 0.4));
	return vec3(f);
}

vec3 opTwist( vec3 p )
{
    float  c = cos(twistXMod*p.y+twistYMod);
    float  s = sin(twistXMod*p.y+twistYMod);
    mat2   m = mat2(c,-s,s,c);
    return vec3(m*p.xz,p.y);
}

	
// polynomial smooth min (k = 0.1);
float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

vec2 opU( vec2 d1, vec2 d2 )
{
	return min(d1, d2);
	//return (d1.x<d2.x) ? d1 : d2;
}

float opBlend( float d1, float d2 )
{
    return smin( d1, d2 , 1.0);
}


vec2 map(vec3 pos) {
	//float planeDist = plane(pos);

	//pos.xy = rotate(pos.xy, pos.z * 0.01);

	//mirror
	//pos.x = abs(pos.x);
	//pos.y = abs(pos.y);

	//pos = mod(pos + 10.0 , 20.0) - 10.0;

	//pos.yx = rotate(pos.yx, u_time * 0.7);
	//pos.xy = rotate(pos.xy, u_time * 0.7);

	//around the Y
	pos.xz = rotate(pos.xz, u_time * anim);
	float ballDist = sphere(pos, sphereRadius);
	float torusDist = sdTorusDeformed(opTwist(pos), vec2(2.20,0.55));

	vec2 res = opU(vec2(ballDist, 1.0), vec2(torusDist, 1.5));

	vec2 ball = vec2(ballDist, 10.0);
	vec2 torus = vec2(torusDist, 20.0);
	float blend = opBlend(ballDist, torusDist);
	//return vec2(blend, (sin(u_time *0.05) + 1.0) * 360.0 - (360.0 * colorMod));
	return vec2(blend,  360.0 - (360.0 * colorMod));
	//return box(pos, vec3(2.0), 1.0);
}

float softshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax ) {
    float res = 1.0;
    float t = mint;
    for( int i=0; i<16; i++ ) {
        float h = map( ro + rd*t ).x;
        res = min( res, 8.0*h/t );
        t += clamp( h, 0.02, 0.10 );
        if( h<0.001 || t>tmax ) break;
    }
    return clamp( res, 0.0, 1.0 );
}


float ao( in vec3 pos, in vec3 nor ){
    float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<5; i++ )
    {
        float hr = 0.01 + 0.06*float(i)/4.0;
        vec3 aopos =  nor * hr + pos;
        float dd = map( aopos ).x;
        occ += -(dd-hr)*sca;
        sca *= 0.95;
    }
    return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );    
}

vec3 envLight(vec3 normal, vec3 dir, sampler2D tex) {
    vec3 eye    = -dir;
    vec3 r      = reflect( eye, normal );
    float m     = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
    vec2 vN     = r.xy / m + .5;
    vN.y        = 1.0 - vN.y;
    vec3 color  = texture2D( tex, vN ).rgb;
    float power = 10.0;
    color.r     = pow(color.r, power);
    color       = color.rrr;
    return color;
}


vec3 computeNormal(vec3 pos){
	vec2 eps = vec2(0.01,0.0);

	return normalize(vec3(
		map(pos + eps.xyy).x - map(pos - eps.xyy).x,
		map(pos + eps.yxy).x - map(pos - eps.xyy).x,
		map(pos + eps.yyx).x - map(pos - eps.yyx).x
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
	vec4 texOne = texture2D(tDiffuse, vUv);
	vec3 pos = vec3(0.0, 0.0, -10.0);
	//vec3 pos = vec3(sin(u_time * 0.2) * 4.0, 2.0 * sin(u_time * 0.4) + 8.0, -10.0);
	//vec2 st = gl_FragCoord.xy / u_resolution.xy;
	vec2 st = vUv;
	st = st - vec2(0.5);
	vec3 dir = normalize(vec3(st, 1.0));

	vec3 color = vec3(0.0);

	bool hit = false;
	vec2 mapped;
	for (int i = 0; i < 32; i++) {
		 mapped = map(pos);
		float d = mapped.x;
		//float c = mapped.y;
		if (d < 0.0001) {
			/*vec3 normal = computeNormal(pos);
			float diff = diffuse(normal);
			float spec = specular(normal, dir);
			float lightDistance = sphere(pos, 10.0);
			color = 0.3 + 0.3*sin( vec3(0.05,0.08,0.10)*(c-1.0));
			color += (diff + spec) * normal; //albedo(pos);*/
			hit = true;
		}
		pos += d * dir;
	}

	if(hit) {
		vec2 mapped = map(pos);
		float d = mapped.x;
		float c = mapped.y;
		vec3 normal = computeNormal(pos);
		float _ao = ao(pos, normal);
		float diff = diffuse(normal);
		float spec = specular(normal, dir);
		float lightDistance = sphere(pos, 10.0);
		color = 0.3 + 0.3*sin( vec3(0.05,0.08,0.10)*(c-1.0));
		color += (diff + spec) * normal ; //albedo(pos);
		color *= _ao;
		color += envLight(normal, pos, u_tex0);
	}

	float mixVal = smoothstep(0.0, 0.2, color.r);

    vec3 outputColor = mix(texOne.rgb, color, mixVal);
	//float fogFactor = exp(-pos.z * 0.01);
	//color  = mix(vec3(0.6,0.6,0.6), color, fogFactor);
	//with diffuse
	//gl_FragColor = vec4(vec3(diffuse(computeNormal(pos))), 1.0);

	gl_FragColor = vec4(outputColor, 1.0);
}