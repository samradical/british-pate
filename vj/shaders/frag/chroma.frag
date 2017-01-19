            varying vec2 vUv;

            uniform float uMixRatio;
            uniform float uThreshold;

            uniform sampler2D tDiffuse;
            uniform sampler2D tTwo;
            uniform sampler2D tMix;

            #pragma glslify: ease = require(glsl-easings/sine-out)

            void main() {
                vec4 texOne = texture2D(tDiffuse, vUv);
                vec4 texTwo = texture2D(tTwo, vUv);
                vec4 texMix = texture2D(tMix, vUv);

                vec3 textTwoCol = texTwo.rgb;

              //  float uMixRatioEase = ease(uMixRatio);

                vec4 transitionTexel = texture2D(tMix, vUv);
                float r = uMixRatio * (1.0 + uThreshold * 2.0) - uThreshold;
                float mixf = clamp((transitionTexel.g - r) * (1.0 / uThreshold), 0.0, 1.0);
                vec4 col = mix(texOne, vec4(textTwoCol, 1.0), mixf);
                col *= 0.01 + 2.5 * pow(vUv.x * vUv.y * (1.0 - vUv.x) * (1.0 - vUv.y), 0.3);
                gl_FragColor = col;
            }