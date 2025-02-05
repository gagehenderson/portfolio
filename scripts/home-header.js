import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import WebGL from "three/addons/capabilities/WebGL.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

window.addEventListener("load", () => {

    if ( !WebGL.isWebGL2Available() ) {
        return;
    }

    // Tweakable constants, have some fun :)
    const FOV            = 70;
    const ASPECT_RATIO   = window.innerWidth / window.innerHeight;
    const CAM_NEAR       = 0.1;
    const CAM_FAR        = 1000;
    const MODEL_X        = -3.5;
    const MODEL_Y        = -5;
    const MODEL_Z        = -12;
    const CRT_ANIM_SPEED = 3;
    const BLOOM          = {
        BASE_STRENGTH:  0.4,
        RADIUS       :  1.8,
        THRESHOLD    :  0.5,
        ANIM_SPEED   :  2,
        ANIM_AMOUNT  :  0.05
    }
    const MODEL_ANIM = {
        INNER_ROT_SPEED: 2,
        OUTER_ROT_SPEED: 0.5,
    }

    // Threejs setup
    const loader = new GLTFLoader();
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( FOV, ASPECT_RATIO, CAM_NEAR, CAM_FAR );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.querySelector(".header").prepend( renderer.domElement );

    // Load our model
    let model;
    let innerSphere;
    let outerSphere;
    loader.load( '../assets/models/holo-planet.glb', function(gltf) {
        outerSphere = gltf.scene.children[0].children[0].children[0].children[0].children[1];
        innerSphere = gltf.scene.children[0].children[0].children[0].children[0].children[2];

        // The model comes with a little stand, but we don't really want that.
        const stand = gltf.scene.children[0].children[0].children[0].children[0].children[0];
        stand.visible = false;

        gltf.scene.position.set(MODEL_X,MODEL_Y,MODEL_Z)
        scene.add( gltf.scene );
    }, undefined, function(error) {
        console.error( error );
    })

    // CRT Shader
    const crtShader = {
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
        }
    `
};

    // Post-processing setup
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        BLOOM.BASE_STRENGTH,
        BLOOM.RADIUS,
        BLOOM.THRESHOLD
    );
    composer.addPass(bloomPass);
    const crtPass = new ShaderPass(crtShader);
    composer.addPass(crtPass);

    // Handle resizing.
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    });

    // Movement, animation, etc,
    let dt = 0;
    let lastTime = Date.now();
    let animTimer = 0;
    function animate(time) {
        const dt = (Date.now() - lastTime) / 1000;
        lastTime = Date.now();

        animTimer += dt;

        // Animate CRT
        crtPass.uniforms['time'].value += CRT_ANIM_SPEED * dt;

        // Rotate spheres.
        if (outerSphere) {
            outerSphere.rotation.y += MODEL_ANIM.OUTER_ROT_SPEED * dt;
            innerSphere.rotation.y += MODEL_ANIM.INNER_ROT_SPEED * dt;
        }

        // Animate bloom
        bloomPass.strength = BLOOM.BASE_STRENGTH + Math.sin(animTimer * BLOOM.ANIM_SPEED) * BLOOM.ANIM_AMOUNT;

        composer.render();
    }

    renderer.setAnimationLoop( animate );
});
