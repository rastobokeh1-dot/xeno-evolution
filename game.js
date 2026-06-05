console.log("⚙️ Modul GAME: Hlavný mozog spustený.");

// Globálne premenné prístupné pre celú hru
let scene, camera, renderer;

const game = {
    init() {
        console.log("⚙️ Inicializujem engine...");
        
        // 1. Vytvorenie 3D sveta
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x010409, 0.015); // Hmlovina pre hĺbku

        // 2. Nastavenie kamery
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 15);

        // 3. Inicializácia vykresľovača pre iPhone
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(renderer.domElement);

        // 4. Svetlá
        const ambientLight = new THREE.AmbientLight(0x0ea5e9, 0.4);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1.2, 50);
        pointLight.position.set(5, 5, 10);
        scene.add(pointLight);

        // Spustenie sub-modulov (ak existujú)
        if (typeof World !== 'undefined' && World.init) World.init();
        if (typeof Player !== 'undefined' && Player.init) Player.init();
        if (typeof Entities !== 'undefined' && Entities.init) Entities.init();

        // Štart slučky
        this.animate();
    },

    animate() {
        requestAnimationFrame(() => game.animate());

        // AKTUALIZÁCIA MODULOV
        if (typeof Player !== 'undefined' && Player.update) {
            Player.update(); // Pohyb a pulzovanie hráča
        }

        if (typeof Entities !== 'undefined' && Entities.update) {
            Entities.update(); // Pohyb potravy a kontrola jedenia
        }
        
        // Vykreslenie scény
        renderer.render(scene, camera);
    }
};

// Spustenie hry po načítaní stránky
window.addEventListener("load", () => {
    game.init();
    console.log("🚀 XENO-GENESIS úspešne naštartovaná!");
});

// Responzivita pri otočení iPhonu
window.addEventListener("resize", () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
