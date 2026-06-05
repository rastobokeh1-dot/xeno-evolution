window.Entities = {
    orbs: [], traps: [], maxOrbs: 50,

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
            emissiveIntensity: 2 // Vyššia intenzita pre Bloom
        });
        
        const orb = new THREE.Mesh(geometry, material);
        orb.position.set(oX, oY, 0);
        scene.add(orb);
        this.orbs.push(orb);
    },

    update() {
        if (!window.Player || !window.Player.mesh) return;

        // 1. Udržuj počet potravy
        while (this.orbs.length < this.maxOrbs) {
            this.spawnOrb(window.Player.posX, window.Player.posY);
        }

        // 2. Čisti ďalekú potravu
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            if (window.Player.mesh.position.distanceTo(this.orbs[i].position) > 40) {
                scene.remove(this.orbs[i]);
                this.orbs.splice(i, 1);
            }
        }
    }
};
