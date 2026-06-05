console.log("🧫 Modul PLAYER: Načítaný a pripravený na voľný pohyb.");

const Player = {
    mesh: null,
    // Reálna pozícia v nekonečnom svete
    posX: 0,
    posY: 0,
    // Smer a rýchlosť letu
    velocityX: 0,
    velocityY: 0,
    speed: 0.15, // Maximálna rýchlosť bunky

    init() {
        console.log("🧫 Vstrekujem kód pre živú amébu...");

        const geometry = new THREE.IcosahedronGeometry(1.2, 4);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x38bdf8, 
            emissive: 0x0ea5e9, 
            emissiveIntensity: 0.5,
            shininess: 80,
            transparent: true,
            opacity: 0.85
        });

        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);

        // Reset pozície na začiatku
        this.posX = 0;
        this.posY = 0;

        // Vstup pre mobil aj PC
        window.addEventListener("touchmove", (e) => {
            if (e.cancelable) e.preventDefault();
            this.calculateDirection(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        window.addEventListener("touchstart", (e) => {
            if (e.cancelable) e.preventDefault();
            this.calculateDirection(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        // Keď pustíš prst z obrazovky iPhonu, bunka plynule zastaví
        window.addEventListener("touchend", () => {
            this.velocityX = 0;
            this.velocityY = 0;
        });

        window.addEventListener("mousemove", (e) => {
            // Na PC simulujeme stlačenie tlačidla, na mobile to ide cez touch automaty
            if (e.buttons === 1) this.calculateDirection(e.clientX, e.clientY);
        });
    },

    calculateDirection(clientX, clientY) {
        // Zistíme stred obrazovky iPhonu
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Vypočítame vektor od stredu obrazovky k miestu dotyku prsta
        const dirX = clientX - centerX;
        const dirY = -(clientY - centerY); // Prevrátená Y-os pre 3D priestor

        // Normalizácia vektora (aby bunka neletela rýchlejšie, keď klikneš ďalej)
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        if (distance > 10) {
            this.velocityX = (dirX / distance) * this.speed;
            this.velocityY = (dirY / distance) * this.speed;
        }
    },

    update() {
        if (!this.mesh) return;

        // Pripočítavame rýchlosť k reálnej pozícii v nekonečne
        this.posX += this.velocityX;
        this.posY += this.velocityY;

        // Aktualizujeme pozíciu 3D modelu na scéne
        this.mesh.position.x = this.posX;
        this.mesh.position.y = this.posY;

        // Organické dýchanie bunky
        const time = Date.now() * 0.004;
        const pulse = 1 + Math.sin(time) * 0.05;
        this.mesh.scale.setScalar(pulse);

        // Rotácia
        this.mesh.rotation.y += 0.005;
    }
};
