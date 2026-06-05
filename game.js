console.log("⚙️ Modul GAME: Hlavný mozog spustený.");

// Globálne premenné prístupné pre celú hru
let scene, camera, renderer;

const Game = {
    init() {
        // 1. Vytvorenie 3D sveta
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x010409, 0.015); // Hmlovina pre hĺbku ostrosti

        // 2. Nastavenie kamery (pohľad zhora/mierny uhol)
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 15);

        // 3. Inicializácia profesionálneho vykresľovača
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimalizácia pre iPhony
        document.body.appendChild(renderer.domElement);

        // 4. Globálne ambientné svetlo (aby sme videli obrysy)
        const ambientLight = new THREE.AmbientLight(0x0ea5e9, 0.4);
        scene.add(ambientLight);

        // 5. Bodové svetlo (bude neskôr sledovať bunku)
        const pointLight = new THREE.PointLight(0xffffff, 1.2, 50);
        pointLight.position.set(5, 5, 10);
        scene.add(pointLight);

        // Spustenie sub-modulov
        World.init();
        Player.init();
        Entities.init();

        // Štart nekonečnej renderovacej slučky
        this.animate();
    },

   animate() {
        requestAnimationFrame(() => Game.animate());

        // AKTUALIZÁCIA MODULOV
        if (typeof Player !== 'undefined' && Player.update) {
            Player.update(); // Hráč sa pohne a dýchne
        }
        
        // Vykreslenie scény
        renderer.render(scene, camera);
    }
};

// Režisérsky povel na štart po načítaní stránky
window.addEventListener("load", () => {
    Game.init();
    console.log("🚀 XENO-GENESIS úspešne naštartovaná na engine WebGL!");
});

// Responzivita pri otočení iPhonu
window.addEventListener("resize", () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
