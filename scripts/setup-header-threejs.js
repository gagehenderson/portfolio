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
const MODEL_Z        = -8;
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
const MOUSE_NUDGE = {
    INFLUENCE: 1.5,
    SPEED: 2
}

export default class HeaderThreeJS {
    constructor() {
        if ( WebGL.isWebGL2Available() === false ) {
            this.webglAvailable = false; 
            return;
        } else {
            this.webglAvailable = true;
        }

        this.animTimer = 0;
        this.mouseNudge = {
            currentX: 0, currentY: 0,
            targetX: 0, targetY: 0
        }

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
    // here
    update(mouseX, mouseY, dt) {
        if ( this.webglAvailable===false ) { return; }

        this.animTimer += dt;

        // basic animations.
        this.crtPass.uniforms['time'].value += CRT_ANIM_SPEED * dt;
        if (this.outerSphere != null) {
            this.outerSphere.rotation.y += MODEL_ANIM.OUTER_ROT_SPEED * dt;
            this.innerSphere.rotation.y += MODEL_ANIM.INNER_ROT_SPEED * dt;
        }
        this.bloomPass.strength = BLOOM.BASE_STRENGTH + Math.sin(this.animTimer * BLOOM.ANIM_SPEED) * BLOOM.ANIM_AMOUNT;

        // Mouse responsiveness/nudging
        if (this.model != null) {
            const canvas = this.renderer.domElement;
            const modelScreenNormal = new THREE.Vector3(
                MODEL_X, MODEL_Y, MODEL_Z
            )
            modelScreenNormal.project(this.camera);

            modelScreenNormal.x = Math.round((0.5 + modelScreenNormal.x / 2) * (canvas.width / window.devicePixelRatio));
            modelScreenNormal.y = Math.round((0.5 - modelScreenNormal.y / 2) * (canvas.height / window.devicePixelRatio));

            const angleToMouse = Math.atan2(
               modelScreenNormal.y - mouseY, modelScreenNormal.x - mouseX
            )+Math.PI/2;
            
            this.mouseNudge.targetX = Math.cos(angleToMouse) * MOUSE_NUDGE.INFLUENCE;
            this.mouseNudge.targetY = Math.sin(angleToMouse) * MOUSE_NUDGE.INFLUENCE;

            const diffX = (this.mouseNudge.targetX - this.mouseNudge.currentX)
            const diffY = (this.mouseNudge.targetY - this.mouseNudge.currentY)
            this.mouseNudge.currentX += diffX * MOUSE_NUDGE.SPEED * dt;
            this.mouseNudge.currentY += diffY * MOUSE_NUDGE.SPEED * dt;

            this.model.position.set(MODEL_X + this.mouseNudge.currentX, MODEL_Y + this.mouseNudge.currentY, MODEL_Z);
        }

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
            this.model = gltf.scene;
            this.outerSphere = gltf.scene.children[0].children[0].children[0].children[0].children[1];
            this.innerSphere = gltf.scene.children[0].children[0].children[0].children[0].children[2];

            // The model comes with a little stand, but we don't really want that.
            const stand = gltf.scene.children[0].children[0].children[0].children[0].children[0];
            stand.visible = false;

            this.model.position.set(MODEL_X, MODEL_Y, MODEL_Z);
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
