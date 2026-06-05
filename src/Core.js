window.XenoCore = {
    scene: null, camera: null, renderer: null, composer: null,
    
    init() {
        console.log("🚀 XenoCore: Inicializujem AAA prostredie...");
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x010409, 0.015);
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 15);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(this.renderer.domElement);

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        this.composer.addPass(bloomPass);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        
        if (window.World) window.World.init(this.scene);
        if (window.Entities) window.Entities.init(this.scene);
        if (window.Player) window.Player.init(this.scene);

        this.animate();
    },

    animate() {
        requestAnimationFrame(() => this.animate());
        if (window.World) window.World.update();
        if (window.Player) window.Player.update();
        if (window.Entities) window.Entities.update();

        if (window.Player && window.Player.mesh) {
            this.camera.position.x += (window.Player.posX - this.camera.position.x) * 0.05;
            this.camera.position.y += (window.Player.posY - this.camera.position.y) * 0.05;
        }
        this.composer.render();
    }
};
