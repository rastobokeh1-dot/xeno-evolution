console.log("⚙️ Modul GAME: Hlavný mozog spustený.");

let scene, camera, renderer, composer; // Pridaný composer do premenných

const game = {
    init() {
        console.log("⚙️ Inicializujem engine...");
        
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x010409, 0.015);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 15);

        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(renderer.domElement);

        // --- BLOOM KOMPOZÍTOR ---
        composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));
        
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight), 
            1.5, // Sila žiary
            0.4, // Polomer
            0.85 // Threshold (od akého jasu začne žiariť)
        );
        composer.addPass(bloomPass);
        // ------------------------

        const ambientLight = new THREE.AmbientLight(0x0ea5e9, 0.4);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1.2, 50);
        pointLight.position.set(5, 5, 10);
        scene.add(pointLight);

        if (typeof World !== 'undefined' && World.init) World.init();
        if (typeof Player !== 'undefined' && Player.init) Player.init();
        if (typeof Entities !== 'undefined' && Entities.init) Entities.init();

        this.animate();
    },

    animate() {
        requestAnimationFrame(() => game.animate());

        if (typeof Player !== 'undefined' && Player.update) Player.update();
        if (typeof Entities !== 'undefined' && Entities.update) Entities.update();

        if (typeof Player !== 'undefined' && Player.mesh) {
            camera.position.x += (Player.posX - camera.position.x) * 0.05;
            camera.position.y += (Player.posY - camera.position.y) * 0.05;
        }
        
        // Vykresľujeme cez composer (ktorý má v sebe zapnutý Bloom)
        composer.render(); 
    }
};

window.addEventListener("load", () => {
    game.init();
    console.log("🚀 XENO-GENESIS úspešne naštartovaná!");
});

window.addEventListener("resize", () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Aktualizujeme aj composer
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
});
