const BitShader =  {

    uniforms: {

        "tDiffuse": {type: "t", value: null},
        "bitSize": {type: "f", value: 12.0}

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform float bitSize;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 texel = texture2D( tDiffuse, vUv );",
        "float n = pow(bitSize,2.0);",
        "float newR = floor(texel.r*n)/n;",
        "float newG = floor(texel.g*n)/n;",
        "float newB = floor(texel.b*n)/n;",

        "gl_FragColor = vec4( vec3(newR,newG,newB), 1.0);",

        "}"

    ].join("\n")

};

export default BitShader;
