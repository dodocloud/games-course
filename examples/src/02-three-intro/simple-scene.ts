import * as THREE from 'three';

let canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
let camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);

let renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.width, canvas.height);

// add a cube
let geometry = new THREE.BoxGeometry();
let material = new THREE.MeshBasicMaterial({ color: 0xFF00FF });
let cube = new THREE.Mesh(geometry, material);

let scene = new THREE.Scene();
scene.add(cube);

camera.position.z = 5;

// game loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();