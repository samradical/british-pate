            varying vec2 vUv;

            uniform float uMixRatio;
            uniform float uThreshold;

            uniform sampler2D tDiffuse;
            uniform sampler2D tTwo;

            float chromaVal(vec3 color, vec3 keyColor, float tolerance, float slope) {
                 float d = abs(length(abs(keyColor - color)));
                 float edge0 = tolerance * (1.0 - slope);
                 float alpha = smoothstep(edge0, tolerance, d);
                 return 1. - alpha;
            }

            void main() {
                vec4 texel1 = texture2D(tDiffuse, vUv);
                vec4 texel2 = texture2D(tTwo, vUv);

                float cVal = chromaVal(texel1.rgb, vec3(0.0), uMixRatio, uThreshold);
                vec4 col = mix(texel1, texel2, cVal);

                gl_FragColor = col;
            }