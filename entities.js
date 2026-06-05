console.log("🦠 Modul ENTITIES: Ekosystém obohatený o nebezpečné pasce.");

window.Entities = {
    orbs: [],
    traps: [], // 🕸️ Nový zásobník pre pasce
    particles: [],
    maxOrbs: 40,
    maxTraps: 5, // Počet pascí na mape
    biomassCount: 0,
    spawnRadius: 25,
    despawnRadius: 35,

    init() {
        for (let i = 0; i < this.maxOrbs; i++) this.spawnOrb(0, 0);
        for (let i = 0; i < this.maxTraps; i++) this.spawnTrap();
    },

    spawnTrap() {
        // Vytvoríme vizuálne odlišný objekt (tŕnitý)
        const geometry = new THREE.TetrahedronGeometry(1.5, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x1e293b, emissive: 0x0f172a, wireframe: true });
        const trap = new THREE.Mesh(geometry, material);
        
        trap.position.set((Math.random()-0.5)*40, (Math.random()-0.5)*40, 0);
        trap.userData = { damage: 0.5 }; // Koľko biomasy uberie
        
        scene.add(trap);
        this.traps.push(trap);
    },

    spawnOrb(aroundX, aroundY) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * (this.spawnRadius - 5); 
        const oX = aroundX + Math.cos(angle) * radius;
        const oY = aroundY + Math.sin(angle) * radius;

        const biome = (window.World && window.World.getBiomeAt) ? window.World.getBiomeAt(oX, oY) : "DEFAULT";
        let geometry = new THREE.DodecahedronGeometry(0.15);
        let material = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.8 });
        
        const orb = new THREE.Mesh(geometry, material);
        orb.position.set(oX, oY, 0);
        orb.userData = { type: "DEFAULT", colorHex: 0x22c55e };

        scene.add(orb);
        this.orbs.push(orb);
    },

    createExplosion(x, y, colorHex) {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const geom = new THREE.SphereGeometry(0.1, 4, 4);
            const mat = new THREE.MeshBasicMaterial({ color: colorHex });
            const p = new THREE.Mesh(geom, mat);
            p.position.set(x, y, 0);
            p.userData = { vX: (Math.random()-0.5)*0.2, vY: (Math.random()-0.5)*0.2, life: 1.0 };
            scene.add(p);
            this.particles.push(p);
        }
    },

    update() {
        if (!window.Player || !window.Player.mesh) return;

        // 🕸️ Kontrola pascí (Gravitácia a Poškodenie)
        for (let trap of this.traps) {
            trap.rotation.z += 0.01;
            const dist = window.Player.mesh.position.distanceTo(trap.position);
            
            // Ak je hráč blízko, pasca ho priťahuje
            if (dist < 8) {
                const force = (8 - dist) * 0.002;
                window.Player.velocityX += (trap.position.x - window.Player.posX) * force;
                window.Player.velocityY += (trap.position.y - window.Player.posY) * force;
            }

            // Ak sa dotkne, stráca biomasu
            if (dist < 1.5) {
                this.biomassCount = Math.max(0, this.biomassCount - 0.1);
                this.updateUI();
                // --- ROZŠÍRENIE: ORGANICKÉ POZADIE A ATMOSFÉRA ---
window.Entities.addAtmosphere = function() {
    // Vytvoríme svetlo, ktoré dodá hre hĺbku
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1, 50);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Pridáme "hmlovinu" v pozadí (mikro-častice, ktoré sa nehýbu)
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.1, transparent: true, opacity: 0.2 });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
    console.log("🌌 Atmosféra pridaná: Rozšírenie ekosystému úspešné.");
};
            }
        }

        // Aktualizácia orbov (ostáva rovnaká)
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            if (window.Player.mesh.position.distanceTo(orb.position) < 1.5) {
                this.createExplosion(orb.position.x, orb.position.y, orb.userData.colorHex);
                scene.remove(orb);
                this.orbs.splice(i, 1);
                this.biomassCount++;
                this.updateUI();
                this.spawnOrb(window.Player.posX, window.Player.posY);
            }
        }
    },

    updateUI() {
        const barFill = document.getElementById("bar-fill");
        if (barFill) barFill.style.width = Math.min(this.biomassCount * 2, 100) + "%";
    }
};
