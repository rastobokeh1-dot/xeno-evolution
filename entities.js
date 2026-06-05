window.Entities = {
    orbs: [], 
    traps: [], 
    maxOrbs: 50,
    biomassCount: 0,

    init() {
        while (this.orbs.length < this.maxOrbs) this.spawnOrb(0, 0);
    },

    spawnOrb(aroundX, aroundY) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 20; 
        const oX = aroundX + Math.cos(angle) * radius;
        const oY = aroundY + Math.sin(angle) * radius;

        let geometry = new THREE.DodecahedronGeometry(0.15);
        let material = new THREE.MeshStandardMaterial({ 
            color: 0x22c55e, 
            emissive: 0x15803d, 
            emissiveIntensity: 2 
        });
        
        const orb = new THREE.Mesh(geometry, material);
        orb.position.set(oX, oY, 0);
        scene.add(orb);
        this.orbs.push(orb);
    },

    update() {
        if (!window.Player || !window.Player.mesh) return;

        // 1. Zber potravy (tu bola tá chyba, chýbal tento cyklus)
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            const dist = window.Player.mesh.position.distanceTo(orb.position);

            // Ak sa dotkneš potravy
            if (dist < 1.5) {
                scene.remove(orb);
                this.orbs.splice(i, 1);
                this.biomassCount++;
                this.updateUI();
                continue; // Preskočíme zvyšok, lebo potrava už neexistuje
            }

            // 2. Čistenie ďalekej potravy (ak je príliš ďaleko od teba, zmaž ju)
            if (dist > 40) {
                scene.remove(orb);
                this.orbs.splice(i, 1);
            }
        }

        // 3. Udržuj počet potravy (dopĺňaj chýbajúce)
        while (this.orbs.length < this.maxOrbs) {
            this.spawnOrb(window.Player.posX, window.Player.posY);
        }
    },

    updateUI() {
        const barFill = document.getElementById("bar-fill");
        if (barFill) barFill.style.width = Math.min(this.biomassCount * 2, 100) + "%";
    }
};
