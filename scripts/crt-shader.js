//
// CRT Shader - This was written with *a lot* of ai assistance, I'm still not
// super familiar with shaders!
//
// Used in setup-header-threejs.js
//
export default {
    uniforms: {
        "tDiffuse": { value: null },
        "time": { value: 0.0 },
        "curvature": { value: 1.13 },
        "scanlineIntensity": { value: 0.35 },
        "grilleIntensity": { value: 0.15 },
        "scanlineSpeed": { value: 0.3 },
        "distortionWave": { value: 0.1 }
    },
    vertexShader: `
varying vec2 vUv;
void main() {
vUv = uv;
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
    fragmentShader: `
uniform sampler2D tDiffuse;
uniform float time;
uniform float curvature;
uniform float scanlineIntensity;
uniform float grilleIntensity;
uniform float scanlineSpeed;
uniform float distortionWave;
varying vec2 vUv;

// Barrel distortion
vec2 distort(vec2 p) {
vec2 uv = p - 0.5;
float theta = atan(uv.y, uv.x);
float radius = length(uv);
radius = pow(radius, curvature);
uv.x = radius * cos(theta);
uv.y = radius * sin(theta);
return 0.5 + uv * 0.95;
}

// Vignette
float vignette(vec2 uv) {
uv *= 1.0 - uv.yx;
float vig = uv.x * uv.y * 15.0;
return pow(vig, 0.25);
}

void main() {
// Add time-based distortion
vec2 timedUV = vUv + vec2(
sin(time * 2.0 + vUv.y * 10.0) * 0.001 * distortionWave,
sin(time * 1.5 + vUv.x * 8.0) * 0.002 * distortionWave
);

// Distort UVs
vec2 distortedUV = distort(timedUV);

// Base color
vec3 color = texture2D(tDiffuse, distortedUV).rgb;

// Moving aperture grille
float grille = sin(distortedUV.x * 1000.0 + time * 10.0) * 0.5 + 0.5;
grille *= sin(distortedUV.y * 500.0 + time * 5.0) * 0.3 + 0.7;
color *= mix(1.0, grille, grilleIntensity);

// Animated scanlines
float scanline = sin((distortedUV.y + time * scanlineSpeed) * 1500.0) * 0.5 + 0.5;
color *= mix(1.0, scanline, scanlineIntensity);

// Subtle screen wobble
float wobble = sin(time * 3.0) * 0.0001 * distortionWave;
color *= texture2D(tDiffuse, distortedUV + vec2(wobble)).r * 0.5 + 0.8;

// Vignette
color *= vignette(distortedUV);

gl_FragColor = vec4(color, 1.0);
}`
};

