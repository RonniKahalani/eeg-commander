"use strict"
/*
Copyright (c) 2026 Ronni Kahalani

X: https://x.com/RonniKahalani
Github: https://github.com/RonniKahalani
Website: https://learningisliving.dk
LinkedIn: https://www.linkedin.com/in/kahalani/

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.
*/

/**
 * This 3D example creates a Three.js scene with a pin that can be moved by a pattern action
 */
const TEXTURE_LOGO = '/commander/img/brainbit.png';
const TEXTURE_TEXT = '/commander/img/gold.jpg';
const FONT_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/refs/heads/dev/examples/fonts/helvetiker_regular.typeface.json';

const parent = byId('view3d');
let contentWidth = parent.offsetWidth;
let contentHeight = 400;
let isDragging = false;
let previousX = 0;
let previousY = 0;
let rotationSpeed = 0.002;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, contentWidth / contentHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const textureLoader = new THREE.TextureLoader();

camera.position.set(0, 4, 7);
camera.lookAt(0, 1.5, 0);

renderer.setSize(parent.offsetWidth, 400);
renderer.setClearColor(0x000000); // Black background
parent.appendChild(renderer.domElement);

scene.add(createAmbientLight());
scene.add(createDirectionalLight());
textureLoader.load(TEXTURE_LOGO, (texture) => scene.add(createLogoPlane(texture)));

const pin = createPin();

const canvas = renderer.domElement;
canvas.addEventListener('mousedown', (e) => handleMouseDown(e));
canvas.addEventListener('mousemove', (e) => handleMouseMove(e));
canvas.addEventListener('wheel', (e) => handleWheel(e));
window.addEventListener('resize', (e) => handleResize(e));
window.addEventListener('mouseup', (e) => handleMouseUp(e));

// Start everything
animate();

/**
 * Animates the scene
 */
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

/**
 * Moves the pin.
 * @param {*} dx 
 * @param {*} dy 
 * @param {*} dz 
 */
function movePin(dx, dy, dz) {
    pin.position.x += dx;
    pin.position.y += dy;
    pin.position.z += dz;

    // Clamp to reasonable area
    pin.position.x = Math.max(-7, Math.min(7, pin.position.x));
    pin.position.y = Math.max(0.1, Math.min(6, pin.position.y));
    pin.position.z = Math.max(-7, Math.min(7, pin.position.z));
}

/**
 * Creates a plane geometry
 * @param {*} texture 
 * @returns {object}
 */
function createLogoPlane(texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1); // Tile the texture

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), createLogoMaterial(texture));
    plane.position.y = -1;
    plane.rotation.x = -Math.PI * 0.5;
    window.plane = plane;

    return plane;
}

/**
 * Creates a material
 * @param {*} texture 
 * @returns {object}
 */
function createLogoMaterial(texture) {
    return new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,   // ← Texture visible on both sides
        shininess: 30,
        specular: 0x222222
    });
}

/**
 * Creates a directional light
 * @returns {void}
 */
function createDirectionalLight() {
    const light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(5, 10, 5);
    return light;
}

/**
 * Creates an ambient light
 * @returns {object}
 */
function createAmbientLight() {
    return new THREE.AmbientLight(0xaaaaaa, 0.8);
}

/**
 * Creates a pin used for movement
 * @returns {object}
 */
function createPin() {
    const pin = new THREE.Group();
    pin.position.set(0, 0, 0);

    const pinBody = new THREE.Mesh(
        new THREE.CylinderGeometry(.5, .5, 3, 32),
        new THREE.MeshLambertMaterial({ color: 0x0000ff })
    );
    pinBody.position.y = 0.6;
    pin.add(pinBody);

    // Pin head (small white sphere)
    const pinHead = new THREE.Mesh(
        new THREE.SphereGeometry(1, 10, 10),
        new THREE.MeshLambertMaterial({ color: 0x0000ff })
    );
    pinHead.position.y = 3;
    pin.add(pinHead);

    scene.add(pin);
    return pin;
}

function setPinColor(r, g, b) {
    for (let child of pin.children) {
        child.material.color = new THREE.Color(r, g, b);
    }
}

/**
 * Handles mouse wheel events
 * @param {*} e 
 * @returns {void}
 */
function handleWheel(e) {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.01;
    camera.position.z = Math.max(3, Math.min(15, camera.position.z));
}

/**
 * Handles mouse move events
 * @param {*} e 
 * @returns {void}
 */
function handleMouseMove(e) {
    if (!isDragging) return;

    const deltaX = e.clientX - previousX;
    const deltaY = e.clientY - previousY;

    // Rotate the entire scene group (not just the text)
    scene.rotation.y += deltaX * 0.005;
    scene.rotation.x += deltaY * 0.005;

    previousX = e.clientX;
    previousY = e.clientY;
}

/**
 * Handles mouse down events
 * @param {*} e 
 * @returns {void}
 */
function handleMouseDown(e) {
    isDragging = true;
    previousX = e.clientX;
    previousY = e.clientY;
}

/**
 * Handles mouse up events
 * @param {*} e 
 * @param {void}
 */
function handleMouseUp(e) {
    isDragging = false
}

/**
 * Handles resize events
 * @param {*} e 
 * @returns {void}
 */
function handleResize(e) {

    if (!parent.offsetWidth) return;

    contentWidth = parent.offsetWidth;
    contentHeight = 400;

    camera.aspect = contentWidth / contentHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(contentWidth, contentHeight);
}