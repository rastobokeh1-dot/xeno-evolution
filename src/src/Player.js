window.Player = {
    mesh: null, core: null, aura: null, coreMat: null,
    posX: 0, posY: 0, velocityX: 0, velocityY: 0, 
    baseSpeed: 0.15, speed: 0.15, // baseSpeed drží normálnu rýchlosť, speed sa mení pri výpade
    trail: [], appendages: [], baseScale: 1.0,

    geneticSeed: null, evolutionStage: 1, rarity: "Spóru",
    currentColorC: 0x0ea5e9, currentColorG: 0x38bdf8,

    // ⚡ Systém výpadu (Dash)
    isDashing: false,
    lastTapTime: 0,

    init() {
        this.mesh = new THREE.Group();

        // Jadro s tekutým Shaderom
        const coreGeom = new THREE.IcosahedronGeometry(1, 32);
        this.coreMat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(window.BioShaders.liquidCell.uniforms),
            vertexShader: window.BioShaders.liquidCell.vertexShader,
            fragmentShader: window.BioShaders.liquidCell.fragmentShader,
            transparent: true, side: THREE.DoubleSide
        });
        
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

        // Pohybový kalkulátor
        const moveHandler = (clientX, clientY) => {
            const dirX = clientX - window.innerWidth / 2;
            const dirY = -(clientY - window.innerHeight / 2);
            const dist = Math.sqrt(dirX*dirX + dirY*dirY);
            if (dist > 10) {
                this.velocityX = (dirX / dist) * this.speed;
                this.velocityY = (dirY / dist) * this.speed;
            }
        };

        // Detekcia dvojitého dotyku (Double-Tap pre Dash)
        const handleDashInput = () => {
            const now = Date.now();
            if (now - this.lastTapTime < 300) {
                this.triggerDash();
            }
            this.lastTapTime = now;
        };

        // Event Listenery optimalizované pre gestá aj myš
        window.addEventListener("touchstart", () => { handleDashInput(); }, {passive: true});
        window.addEventListener("touchmove", (e) => { e.preventDefault(); moveHandler(e.touches[0].clientX, e.touches[0].clientY); }, {passive:false});
        window.addEventListener("mousedown", () => { handleDashInput(); });
        window.addEventListener("mousemove", (e) => { if(e.buttons === 1) moveHandler(e.clientX, e.clientY); });
        window.addEventListener("touchend", () => { this.velocityX = 0; this.velocityY = 0; });
        window.addEventListener("mouseup", () => { this.velocityX = 0; this.velocityY = 0; });

        // Event Listener pre klávesnicu
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") this.triggerDash();
        });
    },

    // ⚡ Mechanika explozívneho výpadu
    triggerDash() {
        if (this.isDashing || !window.Entities) return;

        // Výpad spáli 2 biomasy (Zákon zachovania energie)
        if (window.Entities.biomassCount >= 2) {
            window.Entities.biomassCount -= 2;
            window.Entities.updateUI();

            this.isDashing = true;
            this.speed = this.baseSpeed * 3.5; // Prudká akcelerácia
            this.aura.scale.setScalar(2.2); // Tlaková vlna Aury
            this.aura.material.opacity = 0.8; // Zjasnenie

            // Vizuálna explózia častíc za bunkou
            for(let i = 0; i < 12; i++) {
                this.createTrailParticle(true);
            }

            // Svaly sa po 300ms unavia a bunka sa vráti do normálu
            setTimeout(() => {
                this.isDashing = false;
                this.speed = this.baseSpeed;
                this.aura.material.opacity = 0.3;
            }, 300);
        }
    },

    addAppendage() {
        const geom = new THREE.ConeGeometry(0.15, 1.2, 5);
        geom.translate(0, 0.6, 0);
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

    triggerProceduralMutation() {
        this.evolutionStage = 2; 
        this.geneticSeed = Math.random();
        
        if (this.geneticSeed > 0.90) {
            this.rarity = "ULTRA ALIEN";
            this.currentColorC = 0x9f1239; 
            this.currentColorG = 0xfacc15; 
            this.baseSpeed = 0.22; 
        } else if (this.geneticSeed > 0.70) {
            this.rarity = "EPIC";
            this.currentColorC = 0x6b21a8; 
            this.currentColorG = 0xd946ef; 
            this.baseSpeed = 0.19;
        } else if (this.geneticSeed > 0.40) {
            this.rarity = "RARE";
            this.currentColorC = 0x1d4ed8; 
            this.currentColorG = 0x38bdf8;
            this.baseSpeed = 0.17;
        } else {
            this.rarity = "COMMON";
            this.currentColorC = 0x15803d; 
            this.currentColorG = 0x4ade80;
            this.baseSpeed = 0.16;
        }

        this.speed = this.baseSpeed; // Aplikácia novej rýchlosti

        this.coreMat.uniforms.colorC.value.setHex(this.currentColorC);
        this.coreMat.uniforms.colorG.value.setHex(this.currentColorG);
        this.aura.material.color.setHex(this.currentColorG);

        for(let spike of this.appendages) {
            spike.material.color.setHex(this.currentColorC);
            spike.material.emissive.setHex(this.currentColorG);
        }
        for(let i=0; i<4; i++) this.addAppendage();

        const evoText = document.getElementById("evolution-text");
        if (evoText) evoText.innerHTML = `Organizmy <span style="color:#${this.currentColorG.toString(16)};">(${this.rarity})</span>`;
    },

    evolveShape() {
        if (!window.Entities) return;
        
        if (this.evolutionStage === 1 && window.Entities.biomassCount < 15) {
            const targetAppendages = Math.floor(window.Entities.biomassCount / 3);
            if (this.appendages.length < targetAppendages && this.appendages.length < 6) {
                this.addAppendage();
            }
        } 
        else if (this.evolutionStage === 1 && window.Entities.biomassCount >= 15) {
            this.triggerProceduralMutation();
        }

        // Ak príliš veľa dashujeme alebo nás zrania a stratíme biomasu, prídeme o tykadlá
        const expectedAppendages = Math.floor(window.Entities.biomassCount / 3);
        if (this.evolutionStage === 1 && this.appendages.length > expectedAppendages) {
            const lostSpike = this.appendages.pop();
            this.core.remove(lostSpike);
        }
    },

    // Upravený chvost pre bežný let aj explóziu pri Dashi
    createTrailParticle(isExplosion = false) {
        if (!isExplosion && Math.abs(this.velocityX) < 0.01 && Math.abs(this.velocityY) < 0.01) return;
        
        const size = (isExplosion ? 0.8 : 0.4) * this.baseScale;
        const pGeom = new THREE.SphereGeometry(size, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: this.currentColorG, transparent: true, opacity: (isExplosion ? 0.9 : 0.6), blending: THREE.AdditiveBlending });
        const particle = new THREE.Mesh(pGeom, pMat);
        
        // Pri explózii sa častice rozptýlia po bokoch pre efekt šokovej vlny
        const offsetX = isExplosion ? (Math.random() - 0.5) * 2.5 : 0;
        const offsetY = isExplosion ? (Math.random() - 0.5) * 2.5 : 0;

        particle.position.set(this.posX - this.velocityX*5 + offsetX, this.posY - this.velocityY*5 + offsetY, 0);
        scene.add(particle);
        this.trail.push(particle);
    },

    update() {
        if (!this.mesh) return;

        if (this.coreMat) this.coreMat.uniforms.time.value = Date.now() * 0.001;

        this.evolveShape();

        if (window.Entities) {
            const targetScale = 1.0 + (window.Entities.biomassCount * 0.015);
            this.baseScale += (targetScale - this.baseScale) * (this.isDashing ? 0.2 : 0.05); // Pri dashi sa bunka jemne natiahne
            this.mesh.scale.setScalar(this.baseScale);
        }

        this.posX += this.velocityX;
        this.posY += this.velocityY;
        this.mesh.position.set(this.posX, this.posY, 0);

        this.core.rotation.y += (this.isDashing ? 0.05 : 0.01);
        this.core.rotation.x += (this.isDashing ? 0.02 : 0.005);

        const time = Date.now();
        for (let spike of this.appendages) {
            spike.rotation.x = spike.userData.baseRotX + Math.sin(time * spike.userData.waveSpeed + spike.userData.waveOffset) * 0.2;
            spike.rotation.z = spike.userData.baseRotZ + Math.cos(time * spike.userData.waveSpeed * 0.8 + spike.userData.waveOffset) * 0.2;
        }

        // Aura pulzuje prudšie, keď sa bunka hýbe
        if (!this.isDashing) {
            this.aura.scale.setScalar(1 + Math.sin(time * 0.005) * 0.1);
        }

        if (Math.random() > (this.isDashing ? 0.1 : 0.5)) this.createTrailParticle();

        for (let i = this.trail.length - 1; i >= 0; i--) {
            let p = this.trail[i];
            p.material.opacity -= (this.isDashing ? 0.04 : 0.02);
            p.scale.setScalar(p.material.opacity);
            if (p.material.opacity <= 0) {
                scene.remove(p);
                this.trail.splice(i, 1);
            }
        }
    }
};
