console.log("🦠 Modul ENTITIES: Procedurálny ekosystém spustený.");

window.Entities = {
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

        const biome = (window.World && window.World.getBiomeAt) ? window.World.getBiomeAt(oX, oY) : "DEFAULT";
        
        let geometry, material, type;

        if (biome === "VELOCIS") {
            geometry = new THREE.OctahedronGeometry(0.25);
            material = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x6b21a8, emissiveIntensity: 1 });
            type = "VELOCIS";
        } else if (biome === "TOXIC") {
            geometry = new THREE.TetrahedronGeometry(0.25);
            material = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 1 });
            type = "TOXIC";
        } else {
            geometry = new THREE.DodecahedronGeometry(0.15);
            material = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.8 });
            type = "DEFAULT";
        }

        const orb = new THREE.Mesh(geometry, material);
        orb.position.set(oX, oY, 0);
        orb.userData = { type: type };

        if (typeof scene !== 'undefined') {
            scene.add(orb);
            this.orbs.push(orb);
        }
    },

    update() {
        // Tu bol problém – teraz to bezpečne kontroluje globálne okno
        if (!window.Player || !window.Player.mesh) return;
        
        const pX = window.Player.posX;
        const pY = window.Player.posY;

        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            if (!orb) continue;

            orb.rotation.x += 0.01;
            orb.rotation.y += 0.01;

            const distance = window.Player.mesh.position.distanceTo(orb.position);

            if (distance < (1.2 * window.Player.mesh.scale.x + 0.2)) {
                const type = orb.userData.type;
                
                if (typeof scene !== 'undefined') scene.remove(orb);
                this.orbs.splice(i, 1);

                this.biomassCount++;
                this.updateUI();

                if (window.Player.mutate) {
                    window.Player.mutate(type);
                }

                this.spawnOrb(pX, pY);
                continue;
            }

            if (distance > this.despawnRadius) {
                if (typeof scene !== 'undefined') scene.remove(orb);
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
