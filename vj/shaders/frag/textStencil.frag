            precision mediump float;

            varying vec2 vUv;

            uniform sampler2D tDiffuse;
            uniform sampler2D tText;

            void main() {
                vec4 texOne = texture2D(tDiffuse, vUv);
                vec4 texTwo = texture2D(tText, vUv);

                vec3 t2 = texTwo.rgb;
                vec3 color = mix(texOne.rgb, t2,step(0.1, t2.r));

                gl_FragColor = vec4(color, 1.0);
            }
