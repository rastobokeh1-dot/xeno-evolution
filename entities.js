window.Entities = {
    orbs: [], 
    mutagens: [], // Nová kategória: Superpotrava
    traps: [], 
    predators: [], 
    maxOrbs: 45, 
    maxMutagens: 2, // Na mape budú maximálne 2 mutagény
    maxTraps: 5, 
    maxPredators: 4, // Zvýšený počet lovcov pre svorku
    biomassCount: 0,

    init() {
        while (this.orbs.length < this.maxOrbs) this.spawnOrb(0, 0);
        for (let i = 0; i < this.maxMutagens; i++) this.spawnMutagen(0, 0);
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

    // 🌟 NOVÉ: Generovanie Mutagénu (Superpotrava)
    spawnMutagen(aroundX, aroundY) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 30 + Math.random() * 40; // Sú vzácnejšie a ďalej
        const oX = aroundX + Math.cos(angle) * radius;
        const oY = aroundY + Math.sin(angle) * radius;

        let geometry = new THREE.OctahedronGeometry(0.4, 0); 
        let material = new THREE.MeshPhongMaterial({ 
            color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 4, shininess: 100 
        });
        const mutagen = new THREE.Mesh(geometry, material);
        mutagen.position.set(oX, oY, 0);
        scene.add(mutagen);
        this.mutagens.push(mutagen);
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

    spawnPredator() {
        const geom = new THREE.OctahedronGeometry(0.8, 0);
        const mat = new THREE.MeshPhongMaterial({ color: 0x7e22ce, emissive: 0x581c87, emissiveIntensity: 3, wireframe: true });
        const pred = new THREE.Mesh(geom, mat);
        
        pred.position.set(window.Player ? window.Player.posX + (Math.random()-0.5)*100 : 0, window.Player ? window.Player.posY + (Math.random()-0.5)*100 : 0, 0);
        
        // AI pamäť pre každého predátora
        pred.userData = { 
            velocityX: 0, velocityY: 0, 
            state: "PATROL" // Stavy: PATROL, HUNT, FLEE
        };
        
        scene.add(pred);
        this.predators.push(pred);
    },

    update() {
        if (!window.Player || !window.Player.mesh) return;

        const pX = window.Player.posX;
        const pY = window.Player.posY;
        const time = Date.now();

        // 1. ZBER BEŽNEJ POTRAVY
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            const dist = window.Player.mesh.position.distanceTo(orb.position);

            if (dist < (1.5 * window.Player.baseScale)) {
                scene.remove(orb);
                this.orbs.splice(i, 1);
                this.biomassCount++;
                this.updateUI();
                continue;
            }
            if (dist > 60) {
                scene.remove(orb);
                this.orbs.splice(i, 1);
            }
        }

        // 2. ZBER MUTAGÉNOV (Superpotrava s efektom)
        for (let i = this.mutagens.length - 1; i >= 0; i--) {
            const mut = this.mutagens[i];
            mut.rotation.x += 0.05;
            mut.rotation.y += 0.05;
            // Mutagén pulzuje
            mut.scale.setScalar(1 + Math.sin(time * 0.01) * 0.2);

            const dist = window.Player.mesh.position.distanceTo(mut.position);

            if (dist < (1.8 * window.Player.baseScale)) {
                scene.remove(mut);
                this.mutagens.splice(i, 1);
                
                // 💥 EFEKT: Masívny nárast biomasy a odhodenie predátorov (EMP)
                this.biomassCount += 5;
                this.updateUI();
                console.log("⚡ Mutagén pohltený! EMP vlna aktivovaná.");
                
                for(let pred of this.predators) {
                    pred.userData.state = "FLEE";
                    let forceX = pred.position.x - pX;
                    let forceY = pred.position.y - pY;
                    let forceLen = Math.sqrt(forceX*forceX + forceY*forceY);
                    pred.userData.velocityX = (forceX / forceLen) * 0.5; // Odstrelenie dozadu
                    pred.userData.velocityY = (forceY / forceLen) * 0.5;
                }
                continue;
            }
            if (dist > 80) {
                scene.remove(mut);
                this.mutagens.splice(i, 1);
            }
        }

        // 3. PASCE (Gravitácia)
        for (let trap of this.traps) {
            trap.rotation.z += 0.01;
            trap.material.emissiveIntensity = 1 + Math.sin(time * 0.005) * 0.5;
            
            const distTrap = window.Player.mesh.position.distanceTo(trap.position);
            if (distTrap < 10) {
                const force = (10 - distTrap) * 0.001;
                window.Player.velocityX += (trap.position.x - pX) * force;
                window.Player.velocityY += (trap.position.y - pY) * force;
            }
        }

        // 🧠 4. POKROČILÁ ROJOVÁ AI PREDÁTOROV (Swarm Logic)
        for (let i = this.predators.length - 1; i >= 0; i--) {
            let pred = this.predators[i];
            let distToPlayer = window.Player.mesh.position.distanceTo(pred.position);

            pred.rotation.x += 0.05;
            pred.rotation.y += 0.05;

            let dirX = pX - pred.position.x;
            let dirY = pY - pred.position.y;
            
            // Reakcia na Dash hráča - pud sebazáchovy
            if (window.Player.isDashing && distToPlayer < 20) {
                pred.userData.state = "FLEE";
            } else if (pred.userData.state !== "FLEE" && distToPlayer < 35) {
                pred.userData.state = "HUNT";
            } else if (distToPlayer >= 35 && pred.userData.state !== "FLEE") {
                pred.userData.state = "PATROL";
            }

            // Aplikácia logiky podľa stavu
            if (pred.userData.state === "HUNT") {
                // Smerovanie k hráčovi
                pred.userData.velocityX += (dirX / distToPlayer) * 0.002;
                pred.userData.velocityY += (dirY / distToPlayer) * 0.002;

                // 🧠 FLANKING (Obkľučovanie): Ak sú moc blízko v línii, pridajú tangenciálnu silu
                pred.userData.velocityX += (-dirY / distToPlayer) * 0.001;
                pred.userData.velocityY += (dirX / distToPlayer) * 0.001;
            } 
            else if (pred.userData.state === "FLEE") {
                // Útek (z Dashu alebo Mutagénu)
                pred.userData.velocityX -= (dirX / distToPlayer) * 0.01;
                pred.userData.velocityY -= (dirY / distToPlayer) * 0.01;
                
                // Po čase sa ukľudnia
                if (Math.random() < 0.02) pred.userData.state = "HUNT";
            }

            // 🧠 FLOCKING (Separácia): Predátori sa navzájom odpudzujú, aby neboli v jednom bode
            for (let other of this.predators) {
                if (other === pred) continue;
                let ox = pred.position.x - other.position.x;
                let oy = pred.position.y - other.position.y;
                let odist = Math.sqrt(ox*ox + oy*oy);
                if (odist < 3.0) {
                    pred.userData.velocityX += (ox / odist) * 0.005;
                    pred.userData.velocityY += (oy / odist) * 0.005;
                }
            }

            // Trenie prostredia (Friction) pre plynulý pohyb
            pred.userData.velocityX *= 0.95;
            pred.userData.velocityY *= 0.95;

            // Fyzický posun
            pred.position.x += pred.userData.velocityX;
            pred.position.y += pred.userData.velocityY;

            // Útok! (Zranenie hráča)
            if (distToPlayer < (1.2 * window.Player.baseScale) && pred.userData.state !== "FLEE") {
                this.biomassCount = Math.max(0, this.biomassCount - 5); 
                
                // Odskok po kusanici
                pred.userData.velocityX = -(dirX / distToPlayer) * 0.8;
                pred.userData.velocityY = -(dirY / distToPlayer) * 0.8;
                pred.userData.state = "FLEE"; // Po útoku dočasne ustúpia
                this.updateUI();
            }

            // Respawn vzdialených predátorov
            if (distToPlayer > 80) {
                scene.remove(pred);
                this.predators.splice(i, 1);
                this.spawnPredator();
            }
        }

        // Dopĺňanie chýbajúcich entít
        while (this.orbs.length < this.maxOrbs) this.spawnOrb(pX, pY);
        while (this.mutagens.length < this.maxMutagens) this.spawnMutagen(pX, pY);
    },

    updateUI() {
        const barFill = document.getElementById("bar-fill");
        const evoText = document.getElementById("evolution-text");
        
        if (barFill) barFill.style.width = Math.min(this.biomassCount * 2, 100) + "%";
        
        // Ak hráč ešte nezmutoval (fáza 1), ukazujeme normálne texty
        if (evoText && (!window.Player || window.Player.evolutionStage === 1)) {
            if (this.biomassCount < 10) evoText.innerText = "Spóru (Fáza 1)";
            else if (this.biomassCount >= 10 && this.biomassCount < 15) evoText.innerText = "Bakteriálna kolónia (Fáza 2)";
        }
    }
};
