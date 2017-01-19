            precision mediump float;

            varying vec2 vUv;

            uniform int uModes;

            uniform float uTime;
            uniform float uSize;
            uniform float uIntensity;

            uniform sampler2D tOne;
            uniform sampler2D tTwo;

            #pragma glslify: wiggleWave = require(./wiggleWave)
            #pragma glslify: plasma = require(./plasma1)

            void main() {
                vec4 texel1 = texture2D(tOne, vUv);
                vec4 texel2 = texture2D(tTwo, vUv);
                vec2 st = vUv;
                float size = uSize;
                float intensity = uIntensity;
                float mixx;
                //float mixx = 
               // mixx = plasma(st, uTime).x;
                 if(uModes == 0){
                    mixx = wiggleWave(st, size, intensity, uTime);
                 }else
                 if( uModes == 1 ){
                    mixx = plasma(st, uTime).x;
                 }
                vec4 col = mix(texel1, texel2, mixx);

                gl_FragColor = col;
                //gl_FragColor = vec4(plasma(st, uTime),1.0);
                //gl_FragColor = vec4(vec3(wiggle),1.0);
            }