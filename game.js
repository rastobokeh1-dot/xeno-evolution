let scene, camera, renderer, composer;

const game = {
    init() {
        console.log("⚙️ Spúšťam XENO-GENESIS...");
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x010409, 0.015);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 15);

        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(renderer.domElement);

        // BLOOM SETUP
        composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));
        
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight), 
            1.5, 0.4, 0.85
        );
        composer.addPass(bloomPass);

        // Svetlá
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const pointLight = new THREE.PointLight(0xffffff, 1.2, 50);
        pointLight.position.set(5, 5, 10);
        scene.add(pointLight);

        if (typeof Entities !== 'undefined') Entities.init();
        if (typeof Player !== 'undefined') Player.init();

        this.animate();
    },

    animate() {
        requestAnimationFrame(() => game.animate());

        if (typeof Player !== 'undefined') Player.update();
        if (typeof Entities !== 'undefined') Entities.update();

        if (typeof Player !== 'undefined' && Player.mesh) {
            camera.position.x += (Player.posX - camera.position.x) * 0.05;
            camera.position.y += (Player.posY - camera.position.y) * 0.05;
        }
        
        composer.render(); // Bloom render
    }
};

window.onload = () => game.init();

window.addEventListener("resize", () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
