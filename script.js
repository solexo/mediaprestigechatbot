// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 50);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1); // Black background

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Load GLB model
const loader = new THREE.GLTFLoader();
let robot;
loader.load('robotic_eye.glb', (gltf) => {
    robot = gltf.scene;
    scene.add(robot);
    robot.position.set(0, 0, 0);
    robot.scale.set(3, 3, 3); // Increased scale
    console.log('Robot model loaded successfully');

    // Traverse and adjust materials for visibility
    robot.traverse((child) => {
        if (child.isMesh) {
            // Set to a visible material if original is black
            child.material = new THREE.MeshStandardMaterial({
                color: 0x888888, // Gray color
                metalness: 0.5,
                roughness: 0.5
            });
        }
    });
}, undefined, (error) => {
    console.error('An error happened loading the GLB model:', error);
});

// Camera position
camera.position.z = 5;

// Mouse tracking
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove, false);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (robot) {
        // Floating animation
        robot.position.y = Math.sin(Date.now() * 0.001) * 0.1;

        // Rotate to follow cursor
        robot.rotation.y = -mouse.x * Math.PI; // Horizontal follow, inverted
        robot.rotation.x = mouse.y * Math.PI / 4; // Vertical follow
    }

    renderer.render(scene, camera);
}
animate();