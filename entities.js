console.log("🦠 Modul ENTITIES: Procedurálny ekosystém spustený.");

const Entities = {
    orbs: [],
    maxOrbs: 50,
    biomassCount: 0,
    spawnRadius: 25,
    despawnRadius: 35,

    init() {
        for (let i = 0; i < this.maxOrbs; i++) {
            this.spawnOrb(0, 0);
        }
    },

    spawnOrb(aroundX, aroundY) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * (this.spawnRadius - 5); 
        const oX = aroundX + Math.cos(angle) * radius;
        const oY = aroundY + Math.sin(angle) * radius;

        // ZISTÍME BIÓM ZO SEEDU PRE TIETO SÚRADNICE
        const biome = World.getBiomeAt(oX, oY);
        
        let geometry, material, type;

        if (biome === "VELOCIS") {
            // Fialová mutantná bunka (Osemsten)
            geometry = new THREE.OctahedronGeometry(0.25);
            material = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x6b21a8, emissiveIntensity: 1 });
            type = "VELOCIS";
        } else if (biome === "TOXIC") {
            // Červená/Zelená dravá bunka (Štvorsten)
            geometry = new THREE.TetrahedronGeometry(0.25);
            material = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 1 });
            type = "TOXIC";
        } else {
            // Štandardná zelená biomasa
            geometry = new THREE.DodecahedronGeometry(0.15);
            material = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.8 });
            type = "DEFAULT";
        }

        const orb = new THREE.Mesh(geometry, material);
        orb.position.set(oX, oY, 0);
        orb.userData = { type: type }; // Uložíme typ bunky priamo do 3D objektu

        scene.add(orb);
        this.orbs.push(orb);
    },

    update() {
        if (!Player.mesh) return;
        const pX = Player.posX;
        const pY = Player.posY;

        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            orb.rotation.x += 0.01;
            orb.rotation.y += 0.01;

            const distance = Player.mesh.position.distanceTo(orb.position);

            // Pohltenie
            if (distance < (1.2 * Player.mesh.scale.x + 0.2)) {
                const type = orb.userData.type;
                
                scene.remove(orb);
                this.orbs.splice(i, 1);

                this.biomassCount++;
                this.updateUI();

                // SPUSŤ EVOLÚCIU HRAČA PODĽA TYPU BUNKY!
                Player.mutate(type);

                this.spawnOrb(pX, pY);
                continue;
            }

            // Despawn mimo dohľad iPhonu
            if (distance > this.despawnRadius) {
                scene.remove(orb);
                this.orbs.splice(i, 1);
                this.spawnOrb(pX, pY);
            }
        }
    },

    updateUI() {
        const barFill = document.getElementById("bar-fill");
        if (barFill) {
            const percentage = Math.min(this.biomassCount * 2, 100);
            barFill.style.width = percentage + "%";
        }
    }
};
