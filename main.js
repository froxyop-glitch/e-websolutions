// Initialize Three.js Scene
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Camera setup
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
scene.add(camera);

// Colors
const saffron = '#FF9933';
const white = '#FFFFFF';
const green = '#138808';
const navyBlue = '#000080';

// Objects
const objectsDistance = 4;

// 1. The Ashoka Chakra (Navy Blue Torus Knot in center)
const chakraMaterial = new THREE.MeshStandardMaterial({
    color: navyBlue,
    roughness: 0.1,
    metalness: 0.9,
});
const chakra = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.15, 100, 16),
    chakraMaterial
);
chakra.position.y = -objectsDistance * 1; // Middle section
chakra.position.x = -1.5;
scene.add(chakra);

// 2. Floating festive objects (Balloons/Spheres)
const saffronMat = new THREE.MeshStandardMaterial({ color: saffron, roughness: 0.2, metalness: 0.5 });
const whiteMat = new THREE.MeshStandardMaterial({ color: white, roughness: 0.2, metalness: 0.5 });
const greenMat = new THREE.MeshStandardMaterial({ color: green, roughness: 0.2, metalness: 0.5 });

const balloon1 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), saffronMat);
balloon1.position.y = -objectsDistance * 0; // Top section
balloon1.position.x = 1.5;

const balloon2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), whiteMat);
balloon2.position.y = -objectsDistance * 1; // Middle section (near chakra)
balloon2.position.x = 2;
balloon2.scale.set(0.6, 0.6, 0.6);

const balloon3 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), greenMat);
balloon3.position.y = -objectsDistance * 2; // Bottom section
balloon3.position.x = 1.5;

scene.add(balloon1, balloon2, balloon3);

const sectionMeshes = [balloon1, chakra, balloon3];

// Particles (Confetti)
const particlesCount = 300;
const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);
const colorList = [new THREE.Color(saffron), new THREE.Color(white), new THREE.Color(green)];

for(let i = 0; i < particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    
    const randomColor = colorList[Math.floor(Math.random() * colorList.length)];
    colors[i * 3 + 0] = randomColor.r;
    colors[i * 3 + 1] = randomColor.g;
    colors[i * 3 + 2] = randomColor.b;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);


// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight('#ffffff', 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(white, 2, 10);
pointLight.position.set(-2, -1, 2);
scene.add(pointLight);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scroll integration with GSAP
gsap.registerPlugin(ScrollTrigger);

// Background Color Transitions
gsap.to('body', {
    backgroundColor: '#FFFFFF',
    scrollTrigger: {
        trigger: '#details',
        start: 'top center',
        end: 'center center',
        scrub: true
    }
});

gsap.to('body', {
    backgroundColor: '#138808',
    scrollTrigger: {
        trigger: '#register',
        start: 'top center',
        end: 'center center',
        scrub: true
    }
});

// Animate objects on scroll
sectionMeshes.forEach((mesh) => {
    gsap.to(mesh.rotation, {
        x: '+=2',
        y: '+=3',
        z: '+=1',
        ease: 'none',
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
        }
    });
});

// Camera Scroll Animation
let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Cursor parallax effect
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
});

// Animation Loop
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Animate camera based on scroll
    camera.position.y = -scrollY / sizes.height * objectsDistance;

    // Add slight floating animation to meshes
    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
    }
    
    // Fast spin for Chakra
    chakra.rotation.z -= deltaTime * 0.5;

    // Animate particles floating up
    particles.position.y = elapsedTime * 0.2;

    // Parallax effect for camera
    const parallaxX = cursor.x * 0.5;
    const parallaxY = -cursor.y * 0.5;
    camera.position.x += (parallaxX - camera.position.x) * 5 * deltaTime;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

// Handle Resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Form Submission
document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Submitting...';
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const portfolio = document.getElementById('portfolio').value;

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, portfolio })
        });

        if (response.ok) {
            btn.innerText = 'Happy Independence Day!';
            btn.style.background = 'linear-gradient(45deg, #FF9933, #FFFFFF, #138808)';
            btn.style.color = '#000080';
            e.target.reset();
        } else {
            const data = await response.json();
            btn.innerText = 'Error: ' + (data.error || 'Submission failed');
            btn.style.background = 'red';
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        btn.innerText = 'Connection Error (Is server running?)';
        btn.style.background = 'orange';
    }
    
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = '';
        btn.style.color = '';
    }, 4000);
});
