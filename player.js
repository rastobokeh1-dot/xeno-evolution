console.log("🧫 Modul PLAYER: Načítaný a pripravený.");

const Player = {
    mesh: null,
    targetX: 0,
    targetY: 0,

    init() {
        console.log("🧫 Vstrekujem kód pre živú amébu...");

        // Profesionálna 3D geometria s hustou sieťou pre budúce vlnenie
        const geometry = new THREE.IcosahedronGeometry(1.2, 4);
        
        // Žiariaci, polo-priehľadný organický materiál
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x38bdf8, 
            emissive: 0x0ea5e9, 
            emissiveIntensity: 0.5,
            shininess: 80,
            transparent: true,
            opacity: 0.85
        });

        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh); // Pridanie do scény z game.js

        // Sledovanie dotyku/myši pre iPhone aj PC
        window.addEventListener("touchmove", (e) => this.handleInput(e.touches[0].clientX, e.touches[0].clientY));
        window.addEventListener("mousemove", (e) => this.handleInput(e.clientX, e.clientY));
    },

    handleInput(clientX, clientY) {
        // Prepočet pixelov z displeja na 3D súradnice sveta
        this.targetX = (clientX / window.innerWidth) * 10 - 5;
        this.targetY = -(clientY / window.innerHeight) * 6 + 3;
    },

    update() {
        if (!this.mesh) return;

        // Plynulý organický pohyb smerom k prstu (zotrvačnosť)
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.08;
        this.mesh.position.y += (this.targetY - this.mesh.position.y) * 0.08;

        // Konstantné mikroskopické pulzovanie (dýchanie bunky)
        const time = Date.now() * 0.004;
        const pulse = 1 + Math.sin(time) * 0.05;
        this.mesh.scale.setScalar(pulse);

        // Jemná rotácia, aby svetlo hralo na povrchu
        this.mesh.rotation.y += 0.005;
    }
};
