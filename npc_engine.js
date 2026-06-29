import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class NPCEngine {
    constructor() {
        this.init();
    }

    init() {
        // Setup Scene
        this.scene = new THREE.Scene();

        // Setup Camera (Orthographic for perfect DOM mapping)
        this.updateCameraDimensions();
        this.camera = new THREE.OrthographicCamera(
            this.frustumWidth / -2,
            this.frustumWidth / 2,
            this.frustumHeight / 2,
            this.frustumHeight / -2,
            -1000,
            1000
        );
        this.camera.position.z = 100;

        // Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Canvas Styling
        this.canvas = this.renderer.domElement;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none'; // Let clicks pass through if not on character
        this.canvas.style.zIndex = '999999';
        document.body.appendChild(this.canvas);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(50, 200, 100);
        this.scene.add(directionalLight);

        // State Variables
        this.character = null;
        this.mixer = null;
        this.animations = {};
        this.currentAction = null;
        
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        
        this.isLongPressing = false;
        this.isDragging = false;
        this.longPressTimer = null;
        this.dragOffset = new THREE.Vector3();
        
        this.previousPointer = { x: 0, y: 0 };
        this.isPointerDown = false;
        
        this.targetPosition = new THREE.Vector3();
        this.isMoving = false;
        this.gravity = 0;
        this.isFalling = false;
        
        this.lastScrollY = window.scrollY;
        
        // Size of the model (scale it up to be visible like a widget)
        this.modelScale = 150; // Will be adjusted upon load

        this.clock = new THREE.Clock();

        this.bindEvents();
        this.loadModel();
        
        // Start Render Loop
        this.renderer.setAnimationLoop(() => this.render());
    }

    updateCameraDimensions() {
        this.frustumHeight = window.innerHeight;
        this.frustumWidth = window.innerWidth;
    }

    domToThree(x, y) {
        return {
            x: x - window.innerWidth / 2,
            y: -(y - window.innerHeight / 2)
        };
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('character.glb', (gltf) => {
            this.character = gltf.scene;
            
            // Normalize size and scale
            const box = new THREE.Box3().setFromObject(this.character);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = this.modelScale / maxDim;
            this.character.scale.setScalar(scale);

            // Position at bottom right initially
            const startPos = this.domToThree(window.innerWidth - 60, window.innerHeight - 80);
            this.character.position.set(startPos.x, startPos.y, 0);
            this.targetPosition.copy(this.character.position);

            this.scene.add(this.character);

            // Animations setup
            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.character);
                gltf.animations.forEach((clip) => {
                    const name = clip.name.toLowerCase();
                    this.animations[name] = this.mixer.clipAction(clip);
                });

                // Intelligent fallback for animations
                this.animIdle = this.animations['idle'] || this.animations[Object.keys(this.animations)[0]];
                this.animWalk = this.animations['walk'] || this.animations['run'] || this.animIdle;
                this.animClimb = this.animations['climb'] || this.animWalk;
                this.animFall = this.animations['fall'] || this.animations['jump'] || this.animIdle;

                if (this.animIdle) {
                    this.playAnimation(this.animIdle);
                }
            }

            console.log("NPC Model Loaded!", this.animations);
        }, undefined, (error) => {
            console.error("Error loading NPC model:", error);
        });
    }

    playAnimation(action) {
        if (!action || this.currentAction === action) return;
        if (this.currentAction) {
            this.currentAction.crossFadeTo(action, 0.3, true);
        }
        action.reset();
        action.play();
        this.currentAction = action;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Global pointer events to intercept when over character
        document.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: false });
        document.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
        document.addEventListener('pointerup', (e) => this.onPointerUp(e));
        
        document.addEventListener('scroll', () => this.onScroll());
        
        // Periodic check for pathfinding if not busy
        setInterval(() => this.pathfindTick(), 2000);
    }

    onWindowResize() {
        this.updateCameraDimensions();
        this.camera.left = this.frustumWidth / -2;
        this.camera.right = this.frustumWidth / 2;
        this.camera.top = this.frustumHeight / 2;
        this.camera.bottom = this.frustumHeight / -2;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updatePointer(e) {
        this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    checkHit() {
        if (!this.character) return false;
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObject(this.character, true);
        return intersects.length > 0;
    }

    onPointerDown(e) {
        this.updatePointer(e);
        this.previousPointer = { x: e.clientX, y: e.clientY };
        this.isPointerDown = true;

        if (this.checkHit()) {
            // Character touched! Start timer for long press
            this.longPressTimer = setTimeout(() => {
                this.isLongPressing = true;
                this.isDragging = true;
                
                // Calculate drag offset
                const threePos = this.domToThree(e.clientX, e.clientY);
                this.dragOffset.set(this.character.position.x - threePos.x, this.character.position.y - threePos.y, 0);
                
                // Haptic feedback if available
                if (navigator.vibrate) navigator.vibrate(50);
            }, 500);

            // e.preventDefault(); // Don't prevent default yet, wait to see if it's a drag
        }
    }

    onPointerMove(e) {
        if (!this.isPointerDown) return;
        this.updatePointer(e);

        const deltaX = e.clientX - this.previousPointer.x;
        const deltaY = e.clientY - this.previousPointer.y;

        if (this.isDragging) {
            // Drag the character around
            e.preventDefault(); // Stop scrolling while dragging
            const threePos = this.domToThree(e.clientX, e.clientY);
            this.character.position.x = threePos.x + this.dragOffset.x;
            this.character.position.y = threePos.y + this.dragOffset.y;
            this.targetPosition.copy(this.character.position);
            this.playAnimation(this.animClimb || this.animWalk);
        } else if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            // If we moved too much before long press triggers, cancel long press
            clearTimeout(this.longPressTimer);
            this.isLongPressing = false;

            // Rotate character based on horizontal swipe if it was a hit or just global?
            // "movable from fingers like doing left and right to screen then character should also move on his axis"
            if (this.character) {
                // Rotation speed depends on drag speed
                const rotSpeed = deltaX * 0.01;
                this.character.rotation.y += rotSpeed;
                this.playAnimation(this.animWalk);
            }
        }
        
        this.previousPointer = { x: e.clientX, y: e.clientY };
    }

    onPointerUp(e) {
        clearTimeout(this.longPressTimer);
        this.isPointerDown = false;
        this.isLongPressing = false;
        
        if (this.isDragging) {
            this.isDragging = false;
            // Snap to nearest element or let it fall
            this.checkFooting();
        } else {
            this.playAnimation(this.animIdle);
        }
    }

    onScroll() {
        if (!this.character || this.isDragging) return;
        
        const deltaScroll = window.scrollY - this.lastScrollY;
        const scrollSpeed = Math.abs(deltaScroll);
        
        // If scrolling down fast (reading down), make character fall to catch up
        if (deltaScroll > 50) {
            this.isFalling = true;
            this.gravity = 0;
            this.playAnimation(this.animFall);
            
            // Target is bottom of screen
            const targetY = this.domToThree(0, window.innerHeight - 50).y;
            this.targetPosition.y = targetY;
        } 
        // If scrolling up, it needs to climb up
        else if (deltaScroll < -10) {
            this.pathfindTick();
        }
        
        this.lastScrollY = window.scrollY;
    }

    checkFooting() {
        // Simple physics check - if character is dropped in the middle of nowhere, fall.
        // For now, let's just trigger pathfind
        this.pathfindTick();
    }

    getClimbableElements() {
        // Collect buttons, cards, etc.
        const els = document.querySelectorAll('button, .np-grid-btn, .glass-panel, a');
        let rects = [];
        els.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Must be visible in viewport
            if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
                rects.push(rect);
            }
        });
        return rects;
    }

    pathfindTick() {
        if (this.isDragging || this.isFalling || !this.character) return;
        
        const rects = this.getClimbableElements();
        if (rects.length === 0) return;

        // Character current DOM position
        const charDOM_X = this.character.position.x + window.innerWidth / 2;
        const charDOM_Y = -this.character.position.y + window.innerHeight / 2;

        // Find elements that are HIGHER than the character (smaller Y)
        // or just pick the best element to hop to
        let targetRect = null;
        let minDistance = Infinity;

        // We want the character to reach the top of the screen (Y near 100)
        const IDEAL_Y = 100;

        // Find the next step up
        rects.forEach(rect => {
            if (rect.top < charDOM_Y - 20) { // Must be at least 20px higher
                // Distance to ideal top area vs distance to character
                const distToChar = Math.hypot(rect.left + rect.width/2 - charDOM_X, rect.top - charDOM_Y);
                if (distToChar < minDistance && distToChar < 400) { // Max jump distance
                    minDistance = distToChar;
                    targetRect = rect;
                }
            }
        });

        if (targetRect) {
            // Climb to this element
            const dest = this.domToThree(targetRect.left + targetRect.width / 2, targetRect.top);
            this.targetPosition.set(dest.x, dest.y + (this.modelScale/2), 0); // Stand on it
            this.isMoving = true;
            this.playAnimation(this.animClimb);
            
            // Face target
            const angle = Math.atan2(dest.x - this.character.position.x, dest.y - this.character.position.y);
            this.character.rotation.y = angle;
        } else {
            // Already at top or no path found
            if (Math.abs(this.character.position.x - this.targetPosition.x) < 5 && 
                Math.abs(this.character.position.y - this.targetPosition.y) < 5) {
                this.isMoving = false;
                this.playAnimation(this.animIdle);
                // Turn to face user
                this.character.rotation.y = THREE.MathUtils.lerp(this.character.rotation.y, 0, 0.1);
            }
        }
    }

    render() {
        const delta = this.clock.getDelta();
        
        if (this.mixer) this.mixer.update(delta);

        if (this.character) {
            if (this.isFalling && !this.isDragging) {
                this.gravity += 20 * delta;
                this.character.position.y -= this.gravity;
                
                if (this.character.position.y <= this.targetPosition.y) {
                    this.character.position.y = this.targetPosition.y;
                    this.isFalling = false;
                    this.gravity = 0;
                    this.playAnimation(this.animIdle);
                }
            } 
            else if (this.isMoving && !this.isDragging) {
                // Smooth move to target
                this.character.position.lerp(this.targetPosition, 3 * delta);
                
                if (this.character.position.distanceTo(this.targetPosition) < 5) {
                    this.isMoving = false;
                    this.pathfindTick(); // Look for next step
                }
            } else if (!this.isDragging && !this.isFalling && !this.isMoving) {
                 // Slowly reset rotation to face forward if idle
                 this.character.rotation.y = THREE.MathUtils.lerp(this.character.rotation.y, 0, 2 * delta);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Inject into window to start it when imported
window.addEventListener('load', () => {
    window.npcEngine = new NPCEngine();
});
