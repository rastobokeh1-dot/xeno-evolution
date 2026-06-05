window.Entities = {
    orbs: [], traps: [], maxOrbs: 40, maxTraps: 5, biomassCount: 0,

    init() {
        while (this.orbs.length < this.maxOrbs) this.spawnOrb(0, 0);
        for (let i = 0; i < this.maxTraps; i++) this.spawnTrap();
    },

    spawnOrb(aroundX, aroundY) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 15 + Math.random() * 25; // Generuje sa trochu ďalej, aby to nevyskakovalo priamo pred očami
        const oX = aroundX + Math.cos(angle) * radius;
        const oY = aroundY + Math.sin(angle) * radius;

        let geometry = new THREE.DodecahedronGeometry(0.2); 
        let material = new THREE.MeshStandardMaterial({ 
            color: 0x22c55e, 
            emissive: 0x15803d, 
            emissiveIntensity: 3 
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
        // Pasce sa rozhádžu po väčšej ploche
        trap.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, 0);
        scene.add(trap);
        this.traps.push(trap);
    },

    update() {
        if (!window.Player || !window.Player.mesh) return;

        const pX = window.Player.posX;
        const pY = window.Player.posY;

        // 1. ZBER A ČISTENIE POTRAVY
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            const dist = window.Player.mesh.position.distanceTo(orb.position);

            // Zjedenie potravy
            if (dist < 1.5) {
                scene.remove(orb);
                this.orbs.splice(i, 1);
                this.biomassCount++;
                this.updateUI();
                continue;
            }

            // ⚠️ CHÝBAJÚCA ČASŤ DOPLNENÁ: Zmazanie starej potravy za chrbtom
            if (dist > 45) {
                scene.remove(orb);
                this.orbs.splice(i, 1);
            }
        }

        // 2. PASCE (Priťahovanie)
        for (let trap of this.traps) {
            trap.rotation.z += 0.01;
            trap.material.emissiveIntensity = 1 + Math.sin(Date.now() * 0.005) * 0.5;
            
            const distTrap = window.Player.mesh.position.distanceTo(trap.position);
            if (distTrap < 10) {
                const force = (10 - distTrap) * 0.001;
                window.Player.velocityX += (trap.position.x - pX) * force;
                window.Player.velocityY += (trap.position.y - pY) * force;
            }
        }

        // 3. DOPĹŇANIE POTRAVY
        // Keď sa zmaže zjedená alebo ďaleká potrava, tu sa hneď vygeneruje nová okolo teba
        while (this.orbs.length < this.maxOrbs) {
            this.spawnOrb(pX, pY);
        }
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
