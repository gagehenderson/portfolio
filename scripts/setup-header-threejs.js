//
// Setup the threejs scene, import the model, setup the post-processing, etc,
// We store all of this state in a class and export it to be used in home-header.js
//
// This class expects to be initialized after the dom has loaded.
//
// Public functions should check themselves whether or not webgl is available.
//

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import WebGL from "three/addons/capabilities/WebGL.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import crtShader from "./crt-shader.js";

// Fun constants you can tweak :)
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

export default class HeaderThreeJS {
    constructor() {
        if ( WebGL.isWebGL2Available() === false ) {
            this.webglAvailable = false; 
            return;
        }

        this.animTimer = 0;

        // Split some of this code into private functions just for cleanliness.
        this._setupBasics();
        this._importModel();
        this._setupPostProcessing();
    }

    onResize() {
        if ( this.webglAvailable===false ) { return; }
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    // Called from home-header.js, we render our scene / do some fun animations
    // here.
    update(dt) {
        if ( this.webglAvailable===false ) { return; }

        this.animTimer += dt;

        // Animate CRT shader
        this.crtPass.uniforms['time'].value += CRT_ANIM_SPEED * dt;

        // Rotate spheres.
        if (this.outerSphere != null) {
            this.outerSphere.rotation.y += MODEL_ANIM.OUTER_ROT_SPEED * dt;
            this.innerSphere.rotation.y += MODEL_ANIM.INNER_ROT_SPEED * dt;
        }


        // Animate bloom
        this.bloomPass.strength = BLOOM.BASE_STRENGTH + Math.sin(this.animTimer * BLOOM.ANIM_SPEED) * BLOOM.ANIM_AMOUNT;

        this.composer.render();
    }

    // Setup the basic threejs stuff.
    _setupBasics() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( FOV, ASPECT_RATIO, CAM_NEAR, CAM_FAR );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.querySelector('.header').prepend(this.renderer.domElement);
    }

    _importModel() {
        const loader = new GLTFLoader();
        loader.load( '../assets/models/holo-planet.glb', function(gltf) {
            this.outerSphere = gltf.scene.children[0].children[0].children[0].children[0].children[1];
            this.innerSphere = gltf.scene.children[0].children[0].children[0].children[0].children[2];

            // The model comes with a little stand, but we don't really want that.
            const stand = gltf.scene.children[0].children[0].children[0].children[0].children[0];
            stand.visible = false;

            gltf.scene.position.set(MODEL_X,MODEL_Y,MODEL_Z)
            this.scene.add(gltf.scene);
        }.bind(this), undefined, function(error) {
            console.error(error);
        })
    }

    _setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            BLOOM.BASE_STRENGTH,
            BLOOM.RADIUS,
            BLOOM.THRESHOLD
        );
        this.composer.addPass(this.bloomPass);
        this.crtPass = new ShaderPass(crtShader);
        this.composer.addPass(this.crtPass);
    }


}
