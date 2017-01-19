 // define our varying texture coordinates
            precision mediump float;
            
            varying vec2 vUv;

            uniform sampler2D tDiffuse;

             //color
            uniform float uSaturation;
           
            vec3 changeSaturation(vec3 color, float saturation) {
                float luma = dot(vec3(0.2125, 0.7154, 0.0721) * color, vec3(1.));
                return mix(vec3(luma), color, saturation);
            }

            void main(void) {

                vec3 texel = texture2D(tDiffuse, vUv).rgb;
                texel = changeSaturation(texel, uSaturation);
                gl_FragColor = vec4(texel, 1.);

            }