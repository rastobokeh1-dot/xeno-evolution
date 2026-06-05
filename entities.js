window.Entities = {
    orbs: [], traps: [], maxOrbs: 40, maxTraps: 5, biomassCount: 0,

    init() {
        while (this.orbs.length < this.maxOrbs) this.spawnOrb(0, 0);
        for (let i = 0; i < this.maxTraps; i++) this.spawnTrap();
    },

    spawnOrb(aroundX, aroundY) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 20; 
        const oX = aroundX + Math.cos(angle) * radius;
        const oY = aroundY + Math.sin(angle) * radius;

        let geometry = new THREE.DodecahedronGeometry(0.2); // Zväčšené
        let material = new THREE.MeshStandardMaterial({ 
            color: 0x22c55e, 
            emissive: 0x15803d, 
            emissiveIntensity: 3 // Silnejší Bloom
        });
        
        const orb = new THREE.Mesh(geometry, material);
        orb.position.set(oX, oY, 0);
        scene.add(orb);
        this.orbs.push(orb);
    },

    spawnTrap() {
        const geometry = new THREE.IcosahedronGeometry(1.2, 0);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x4c0519, 
            emissive: 0x881337, 
            emissiveIntensity: 2 
        });
        const trap = new THREE.Mesh(geometry, material);
        trap.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, 0);
        scene.add(trap);
        this.traps.push(trap);
    },

    update() {
        if (!window.Player || !window.Player.mesh) return;

        // 1. Zber potravy
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            if (window.Player.mesh.position.distanceTo(orb.position) < 1.5) {
                scene.remove(orb);
                this.orbs.splice(i, 1);
                this.biomassCount++;
                this.updateUI();
            }
        }

        // 2. Pasce
        for (let trap of this.traps) {
            trap.rotation.z += 0.01;
            trap.material.emissiveIntensity = 1 + Math.sin(Date.now() * 0.005) * 0.5;
            
            if (window.Player.mesh.position.distanceTo(trap.position) < 10) {
                const force = (10 - window.Player.mesh.position.distanceTo(trap.position)) * 0.001;
                window.Player.velocityX += (trap.position.x - window.Player.posX) * force;
                window.Player.velocityY += (trap.position.y - window.Player.posY) * force;
            }
        }

        // 3. Dopĺňanie potravy
        while (this.orbs.length < this.maxOrbs) this.spawnOrb(window.Player.posX, window.Player.posY);
    },

    updateUI() {
        const barFill = document.getElementById("bar-fill");
        const evoText = document.getElementById("evolution-text");
        
        if (barFill) barFill.style.width = Math.min(this.biomassCount * 2, 100) + "%";
        
        if (evoText) {
            if (this.biomassCount >= 10 && this.biomassCount < 25) evoText.innerText = "Bakteriálna kolónia";
            else if (this.biomassCount >= 25 && this.biomassCount < 50) evoText.innerText = "Multibunkový organizmus";
            else if (this.biomassCount >= 50) evoText.innerText = "Predátor mikrosveta";
        }
    }
};
