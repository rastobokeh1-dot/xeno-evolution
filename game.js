let scene, camera, renderer;

const game = {
    init() {
        console.log("⚙️ XENO-GENESIS: Organický engine naštartovaný.");
        scene = new THREE.Scene();
        // Temná, hlboká voda (čierno-modrá hmla)
        scene.fog = new THREE.FogExp2(0x020617, 0.02);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 15);

        // Zapnutý antialiasing pre dokonale hladké hrany
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(renderer.domElement);

        // Osvetlenie hlbokomorského prostredia
        scene.add(new THREE.AmbientLight(0x0f172a, 1.5));
        
        const pointLight = new THREE.PointLight(0x38bdf8, 2, 50);
        pointLight.position.set(0, 5, 10);
        scene.add(pointLight);

        if (typeof Entities !== 'undefined') Entities.init();
        if (typeof Player !== 'undefined') Player.init();

        this.animate();
    },

    animate() {
        requestAnimationFrame(() => game.animate());

        if (typeof Player !== 'undefined') Player.update();
        if (typeof Entities !== 'undefined') Entities.update();

        // Plavný pohyb kamery za bunkou (žiadne trhanie)
        if (typeof Player !== 'undefined' && Player.mesh) {
            camera.position.x += (Player.posX - camera.position.x) * 0.08;
            camera.position.y += (Player.posY - camera.position.y) * 0.08;
        }
        
        renderer.render(scene, camera); 
    }
};

window.onload = () => game.init();

window.addEventListener("resize", () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
