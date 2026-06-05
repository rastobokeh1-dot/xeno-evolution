window.Entities = {
    orbs: [], traps: [], predators: [], // Nový druh: Predátori
    maxOrbs: 40, maxTraps: 5, maxPredators: 3, 
    biomassCount: 0,

    init() {
        while (this.orbs.length < this.maxOrbs) this.spawnOrb(0, 0);
        for (let i = 0; i < this.maxTraps; i++) this.spawnTrap();
        for (let i = 0; i < this.maxPredators; i++) this.spawnPredator();
    },

    spawnOrb(aroundX, aroundY) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 15 + Math.random() * 25; 
        const oX = aroundX + Math.cos(angle) * radius;
        const oY = aroundY + Math.sin(angle) * radius;

        let geometry = new THREE.DodecahedronGeometry(0.2); 
        let material = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 3 });
        const orb = new THREE.Mesh(geometry, material);
        orb.position.set(oX, oY, 0);
        scene.add(orb);
        this.orbs.push(orb);
    },

    spawnTrap() {
        const trap = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.2, 0),
            new THREE.MeshPhongMaterial({ color: 0x4c0519, emissive: 0x881337, emissiveIntensity: 2 })
        );
        trap.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, 0);
        scene.add(trap);
        this.traps.push(trap);
    },

    // 🔴 NOVÉ: Generovanie predátora (Fág)
    spawnPredator() {
        const geom = new THREE.OctahedronGeometry(0.8, 0);
        const mat = new THREE.MeshPhongMaterial({ color: 0x7e22ce, emissive: 0x581c87, emissiveIntensity: 3, wireframe: true });
        const pred = new THREE.Mesh(geom, mat);
        
        // Spawnujú sa ďaleko, aby hneď nezaútočili
        pred.position.set(window.Player ? window.Player.posX + (Math.random()-0.5)*100 : 0, window.Player ? window.Player.posY + (Math.random()-0.5)*100 : 0, 0);
        scene.add(pred);
        this.predators.push(pred);
    },

    update() {
        if (!window.Player || !window.Player.mesh) return;

        const pX = window.Player.posX;
        const pY = window.Player.posY;

        // 1. ZBER POTRAVY
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            const dist = window.Player.mesh.position.distanceTo(orb.position);

            if (dist < (1.5 * window.Player.baseScale)) { // Čím si väčší, tým ľahšie zješ potravu
                scene.remove(orb);
                this.orbs.splice(i, 1);
                this.biomassCount++;
                this.updateUI();
                continue;
            }

            if (dist > 50) {
                scene.remove(orb);
                this.orbs.splice(i, 1);
            }
        }

        // 2. PASCE
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

        // 3. 🔴 PREDÁTORI (AI Lovci)
        for (let i = this.predators.length - 1; i >= 0; i--) {
            let pred = this.predators[i];
            let distPred = window.Player.mesh.position.distanceTo(pred.position);

            pred.rotation.x += 0.05;
            pred.rotation.y += 0.05;

            // AI Logika: Ak ťa predátor zacíti v okruhu 25 jednotiek, ide po tebe
            if (distPred < 25) {
                let dirX = pX - pred.position.x;
                let dirY = pY - pred.position.y;
                let len = Math.sqrt(dirX*dirX + dirY*dirY);
                
                // Rýchlosť predátora (trochu pomalší ako ty, dá sa ujsť)
                pred.position.x += (dirX / len) * 0.04;
                pred.position.y += (dirY / len) * 0.04;
            }

            // Útok! Ak ťa predátor chytí, uhryzne ťa, vezme ti biomasu a odrazí sa
            if (distPred < (1.2 * window.Player.baseScale)) {
                this.biomassCount = Math.max(0, this.biomassCount - 5); // Strata evolúcie
                
                // Odskok predátora po útoku
                pred.position.x -= (pX - pred.position.x) * 1.5;
                pred.position.y -= (pY - pred.position.y) * 1.5;
                this.updateUI();
            }

            // Respawn predátora, ak si od neho ušiel príliš ďaleko
            if (distPred > 70) {
                scene.remove(pred);
                this.predators.splice(i, 1);
                this.spawnPredator();
            }
        }

        while (this.orbs.length < this.maxOrbs) this.spawnOrb(pX, pY);
    },

    updateUI() {
        const barFill = document.getElementById("bar-fill");
        const evoText = document.getElementById("evolution-text");
        
        if (barFill) barFill.style.width = Math.min(this.biomassCount * 2, 100) + "%";
        
        if (evoText) {
            if (this.biomassCount < 10) evoText.innerText = "Spóru (Fáza 1)";
            else if (this.biomassCount >= 10 && this.biomassCount < 25) evoText.innerText = "Bakteriálna kolónia (Fáza 2)";
            else if (this.biomassCount >= 25 && this.biomassCount < 50) evoText.innerText = "Morfujúci organizmus (Fáza 3)";
            else if (this.biomassCount >= 50) evoText.innerText = "Apex Predátor (Fáza 4)";
        }
    }
};
