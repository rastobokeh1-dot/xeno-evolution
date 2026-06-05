window.Player = {
    mesh: null, core: null, aura: null, coreMat: null,
    posX: 0, posY: 0, velocityX: 0, velocityY: 0, speed: 0.15,
    trail: [], appendages: [], baseScale: 1.0,
    
    // 🧬 NOVÝ SYSTÉM EVOLÚCIE
    geneticSeed: null,
    evolutionStage: 1, // 1 = Bunka, 2 = Organizmus
    rarity: "Spóru",
    currentColorC: 0x0ea5e9, // Základná farba jadra
    currentColorG: 0x38bdf8, // Základná farba žiary

    init() {
        this.mesh = new THREE.Group();

        // Jadro s tekutým Shaderom (z nášho BioShaders.js)
        const coreGeom = new THREE.IcosahedronGeometry(1, 32);
        this.coreMat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(window.BioShaders.liquidCell.uniforms),
            vertexShader: window.BioShaders.liquidCell.vertexShader,
            fragmentShader: window.BioShaders.liquidCell.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Nastavenie počiatočnej farby do Shaderu
        this.coreMat.uniforms.colorC.value.setHex(this.currentColorC);
        this.coreMat.uniforms.colorG.value.setHex(this.currentColorG);

        this.core = new THREE.Mesh(coreGeom, this.coreMat);
        this.mesh.add(this.core);

        // Ochranná Aura
        const auraGeom = new THREE.SphereGeometry(1.6, 16, 16);
        const auraMat = new THREE.MeshBasicMaterial({
            color: this.currentColorG, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending
        });
        this.aura = new THREE.Mesh(auraGeom, auraMat);
        this.mesh.add(this.aura);

        scene.add(this.mesh);

        // Pohyb
        const moveHandler = (clientX, clientY) => {
            const dirX = clientX - window.innerWidth / 2;
            const dirY = -(clientY - window.innerHeight / 2);
            const dist = Math.sqrt(dirX*dirX + dirY*dirY);
            if (dist > 10) {
                this.velocityX = (dirX / dist) * this.speed;
                this.velocityY = (dirY / dist) * this.speed;
            }
        };

        window.addEventListener("touchmove", (e) => { e.preventDefault(); moveHandler(e.touches[0].clientX, e.touches[0].clientY); }, {passive:false});
        window.addEventListener("mousemove", (e) => { if(e.buttons === 1) moveHandler(e.clientX, e.clientY); });
        window.addEventListener("touchend", () => { this.velocityX = 0; this.velocityY = 0; });
        window.addEventListener("mouseup", () => { this.velocityX = 0; this.velocityY = 0; });
    },

    // 🦑 Procedurálny rast tykadiel
    addAppendage() {
        const geom = new THREE.ConeGeometry(0.15, 1.2, 5);
        geom.translate(0, 0.6, 0);
        // Tykadlá preberajú farbu jadra!
        const mat = new THREE.MeshPhongMaterial({ color: this.currentColorC, emissive: this.currentColorG, emissiveIntensity: 0.5 });
        const spike = new THREE.Mesh(geom, mat);
        
        const phi = Math.acos((Math.random() * 2) - 1);
        const theta = Math.random() * Math.PI * 2;
        spike.position.setFromSphericalCoords(1.0, phi, theta);
        spike.lookAt(0,0,0);
        spike.rotation.x -= Math.PI / 2; 

        spike.userData = { 
            baseRotX: spike.rotation.x, baseRotZ: spike.rotation.z,
            waveSpeed: 0.05 + Math.random() * 0.05, waveOffset: Math.random() * Math.PI * 2
        };

        this.core.add(spike);
        this.appendages.push(spike);
    },

    // 🧬 HLAVNÁ PROCEDURÁLNA METAMORFÓZA
    triggerProceduralMutation() {
        this.evolutionStage = 2; // Prechod do fázy organizmu
        
        // 1. Vygenerovanie "Seed" (Genetický kód od 0.00 do 1.00)
        this.geneticSeed = Math.random();
        console.log(`🧬 Spúšťam mutáciu! Genetický Seed: ${this.geneticSeed.toFixed(4)}`);
        
        // 2. Logika vzácnosti (Chémia farieb a tvarov)
        if (this.geneticSeed > 0.90) {
            this.rarity = "ULTRA ALIEN";
            this.currentColorC = 0x9f1239; // Temne červená
            this.currentColorG = 0xfacc15; // Žiarivá zlatá
            this.speed = 0.22; // Evolučná výhoda
        } else if (this.geneticSeed > 0.70) {
            this.rarity = "EPIC";
            this.currentColorC = 0x6b21a8; // Fialová
            this.currentColorG = 0xd946ef; // Neónová ružová
            this.speed = 0.19;
        } else if (this.geneticSeed > 0.40) {
            this.rarity = "RARE";
            this.currentColorC = 0x1d4ed8; // Hlbokomorská
            this.currentColorG = 0x38bdf8;
            this.speed = 0.17;
        } else {
            this.rarity = "COMMON";
            this.currentColorC = 0x15803d; // Rastlinná zelená
            this.currentColorG = 0x4ade80;
            this.speed = 0.16;
        }

        // 3. Okamžitá aplikácia chémie do Shaderu a Aury
        this.coreMat.uniforms.colorC.value.setHex(this.currentColorC);
        this.coreMat.uniforms.colorG.value.setHex(this.currentColorG);
        this.aura.material.color.setHex(this.currentColorG);

        // Prehustenie tykadiel (staré prefarbíme, nové pridáme)
        for(let spike of this.appendages) {
            spike.material.color.setHex(this.currentColorC);
            spike.material.emissive.setHex(this.currentColorG);
        }
        for(let i=0; i<4; i++) this.addAppendage();

        // 4. Úprava HUD UI - Hráč vidí, čo sa z neho stalo
        const evoText = document.getElementById("evolution-text");
        if (evoText) {
            evoText.innerHTML = `Organizmy <span style="color:#${this.currentColorG.toString(16)};">(${this.rarity})</span>`;
        }
    },

    evolveShape() {
        if (!window.Entities) return;
        
        // Postupný rast tykadiel vo fáze 1
        if (this.evolutionStage === 1 && window.Entities.biomassCount < 15) {
            const targetAppendages = Math.floor(window.Entities.biomassCount / 3);
            if (this.appendages.length < targetAppendages && this.appendages.length < 6) {
                this.addAppendage();
            }
        } 
        // 🧬 Zlomový bod evolúcie: 15 biomasy
        else if (this.evolutionStage === 1 && window.Entities.biomassCount >= 15) {
            this.triggerProceduralMutation();
        }
    },

    createTrailParticle() {
        if (Math.abs(this.velocityX) < 0.01 && Math.abs(this.velocityY) < 0.01) return;
        const pGeom = new THREE.SphereGeometry(0.4 * this.baseScale, 8, 8);
        // Chvost tiež získava novú farbu mutácie!
        const pMat = new THREE.MeshBasicMaterial({ color: this.currentColorG, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const particle = new THREE.Mesh(pGeom, pMat);
        particle.position.set(this.posX - this.velocityX*5, this.posY - this.velocityY*5, 0);
        scene.add(particle);
        this.trail.push(particle);
    },

    update() {
        if (!this.mesh) return;

        // Vlňanie Shaderu (Čas prechádza do jadra)
        if (this.coreMat) {
            this.coreMat.uniforms.time.value = Date.now() * 0.001;
        }

        // Fyzická kontrola evolúcie
        this.evolveShape();

        // Plynulý rast do veľkosti
        if (window.Entities) {
            const targetScale = 1.0 + (window.Entities.biomassCount * 0.015);
            this.baseScale += (targetScale - this.baseScale) * 0.05;
            this.mesh.scale.setScalar(this.baseScale);
        }

        // Pohyb
        this.posX += this.velocityX;
        this.posY += this.velocityY;
        this.mesh.position.set(this.posX, this.posY, 0);

        // Jemná rotácia celého jadra
        this.core.rotation.y += 0.01;
        this.core.rotation.x += 0.005;

        // ASMR organické vlnenie tykadiel
        const time = Date.now();
        for (let spike of this.appendages) {
            spike.rotation.x = spike.userData.baseRotX + Math.sin(time * spike.userData.waveSpeed + spike.userData.waveOffset) * 0.2;
            spike.rotation.z = spike.userData.baseRotZ + Math.cos(time * spike.userData.waveSpeed * 0.8 + spike.userData.waveOffset) * 0.2;
        }

        // Pulz aury
        this.aura.scale.setScalar(1 + Math.sin(time * 0.005) * 0.1);

        // Vytváranie svetelného chvosta
        if (Math.random() > 0.5) this.createTrailParticle();

        for (let i = this.trail.length - 1; i >= 0; i--) {
            let p = this.trail[i];
            p.material.opacity -= 0.02;
            p.scale.setScalar(p.material.opacity);
            if (p.material.opacity <= 0) {
                scene.remove(p);
                this.trail.splice(i, 1);
            }
        }
    }
};
