            precision mediump float;

            varying vec2 vUv;

            uniform sampler2D tDiffuse;
            uniform sampler2D tTwo;

            uniform float amp;


            void main() {
                vec4 texOne = texture2D(tDiffuse, vUv);
                vec4 texTwo = texture2D(tTwo, vUv);

                vec3 color = vec3(0.);

                vec2 pos = vec2(0.5)-vUv;

                float r = length(pos)*2.0;
                float a = atan(pos.y,pos.x);
                float f = cos(a*3.);

                float mixVal = 1.-smoothstep(f,f+0.1,r);

                color = mix(texOne.rgb, texTwo.rgb, mixVal);

                gl_FragColor = vec4(color, 1.0);
            }
