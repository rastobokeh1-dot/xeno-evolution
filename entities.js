console.log("🦠 Modul ENTITIES: Ekosystém a efekty spustené.");

window.Entities = {
    orbs: [],
    particles: [], // 💥 Nový zásobník pre vizuálne efekty
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
        orb.userData = { type: type, colorHex: material.color.getHex() };

        if (typeof scene !== 'undefined') {
            scene.add(orb);
            this.orbs.push(orb);
        }
    },

    // 💥 Funkcia na vytvorenie explózie častíc
    createExplosion(x, y, colorHex) {
        if (typeof scene === 'undefined') return;
        const particleCount = 8; // Počet odletujúcich kúskov
        
        for (let i = 0; i < particleCount; i++) {
            const geom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
            const mat = new THREE.MeshBasicMaterial({ 
                color: colorHex, 
                transparent: true, 
                opacity: 1 
            });
            const p = new THREE.Mesh(geom, mat);
            p.position.set(x, y, 0);

            const angle = Math.random() * Math.PI * 2;
            const speed = 0.05 + Math.random() * 0.08;
            
            p.userData = {
                vX: Math.cos(angle) * speed,
                vY: Math.sin(angle) * speed,
                life: 1.0 // Životnosť častice
            };
            
            scene.add(p);
            this.particles.push(p);
        }
    },

    update() {
        if (!window.Player || !window.Player.mesh) return;
        
        const pX = window.Player.posX;
        const pY = window.Player.posY;

        // 💥 Aktualizácia častíc (explózií)
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.position.x += p.userData.vX;
            p.position.y += p.userData.vY;
            p.userData.life -= 0.03; // Postupné miznutie
            p.material.opacity = p.userData.life;
            p.scale.setScalar(p.userData.life); // Zmenšovanie častice
            
            if (p.userData.life <= 0) {
                if (typeof scene !== 'undefined') scene.remove(p);
                this.particles.splice(i, 1);
            }
        }

        // Aktualizácia jedla (Orbs)
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            if (!orb) continue;

            orb.rotation.x += 0.02;
            orb.rotation.y += 0.02;

            const distance = window.Player.mesh.position.distanceTo(orb.position);

            if (distance < (1.2 * window.Player.mesh.scale.x + 0.2)) {
                const type = orb.userData.type;
                const hexColor = orb.userData.colorHex;
                
                // 💥 Odpálenie explózie pri zjedení
                this.createExplosion(orb.position.x, orb.position.y, hexColor);
                
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
