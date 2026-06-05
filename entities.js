console.log("🦠 Modul ENTITIES: Načítaný a pripravený.");

const Entities = {
    orbs: [],
    maxOrbs: 40,
    biomassCount: 0, // Sledovanie skóre

    init() {
        console.log("🦠 Prebúdzam mikro-organizmy...");
        
        // Vygenerujeme počiatočnú vlnu potravy
        for (let i = 0; i < this.maxOrbs; i++) {
            this.spawnOrb();
        }
    },

    spawnOrb() {
        // Profesionálna 3D geometria pre mikro-organizmy (Dodecahedron = 12-sten)
        const geometry = new THREE.DodecahedronGeometry(0.15);
        const material = new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            emissive: 0x15803d,
            emissiveIntensity: 0.8,
            roughness: 0.1
        });

        const orb = new THREE.Mesh(geometry, material);

        // Náhodné umiestnenie v hernej zóne
        orb.position.set(
            (Math.random() - 0.5) * 25, // X-os
            (Math.random() - 0.5) * 15, // Y-os
            0                           // Z-os (v rovine hráča)
        );

        scene.add(orb);
        this.orbs.push(orb);
    },

    update() {
        // Kontrola kolízie s hráčom (v player.js máme Player.mesh)
        if (!Player.mesh) return;

        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];

            // Plynulá rotácia potravy, aby to žilo
            orb.rotation.x += 0.01;
            orb.rotation.y += 0.01;

            // Výpočet vzdialenosti medzi stredom bunky a potravou
            const distance = Player.mesh.position.distanceTo(orb.position);

            // Detekcia pohltenia (ak je vzdialenosť menšia ako polomer bunky + potravy)
            if (distance < 1.3) {
                scene.remove(orb); // Zmazať z 3D sveta
                this.orbs.splice(i, 1); // Zmazať z poľa

                // Logika rastu a skóre
                this.biomassCount++;
                this.updateUI();

                // Nový režisérsky efekt: Jemné zväčšenie hráča pri každom zjední
                Player.mesh.scale.multiplyScalar(1.01);

                // Okamžite spawni novú potravu niekde inde, aby bol ekosystém nekonečný
                this.spawnOrb();
            }
        }
    },

    updateUI() {
        // Prepojenie na naše HTML/CSS rozhranie
        const barFill = document.getElementById("bar-fill");
        if (barFill) {
            // Prúžok biomasy sa bude plniť (max 100%)
            const percentage = Math.min(this.biomassCount * 2, 100);
            barFill.style.width = percentage + "%";
        }
    }
};
