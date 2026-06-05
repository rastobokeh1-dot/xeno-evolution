window.Player = {
    mesh: null, core: null, aura: null,
    posX: 0, posY: 0, velocityX: 0, velocityY: 0, speed: 0.15,
    trail: [],
    appendages: [], // 🦑 Nové: Fyzické končatiny/tykadlá
    baseScale: 1.0,

    init() {
        this.mesh = new THREE.Group();

        // Jadro bunky
        const coreGeom = new THREE.IcosahedronGeometry(1, 2);
        const coreMat = new THREE.MeshPhongMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, shininess: 100 });
        this.core = new THREE.Mesh(coreGeom, coreMat);
        this.mesh.add(this.core);

        // Žiariaca aura
        const auraGeom = new THREE.SphereGeometry(1.6, 16, 16);
        const auraMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending
        });
        this.aura = new THREE.Mesh(auraGeom, auraMat);
        this.mesh.add(this.aura);

        scene.add(this.mesh);

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

    // 🦑 PROCEDURÁLNA MUTÁCIA: Rast tykadiel
    evolveShape() {
        if (!window.Entities) return;
        
        // Vypočítame, koľko tykadiel by mala bunka mať (1 tykadlo na každých 8 zjedených biomás)
        const targetAppendages = Math.floor(window.Entities.biomassCount / 8);
        
        // Ak máme menej tykadiel, ako si zaslúžime, vygenerujeme nové!
        if (this.appendages.length < targetAppendages && this.appendages.length < 12) {
            console.log("🧬 Evolučný skok: Bunka mutuje a rastie tykadlo!");
            
            const geom = new THREE.ConeGeometry(0.15, 1.2, 5);
            geom.translate(0, 0.6, 0); // Posunieme, aby sa otáčali zospodu, nie zo stredu
            
            const mat = new THREE.MeshPhongMaterial({ color: 0x0ea5e9, emissive: 0x0284c7 });
            const spike = new THREE.Mesh(geom, mat);
            
            // Procedurálna matematika: Náhodné rozmiestnenie tykadiel po povrchu bunky
            const phi = Math.acos((Math.random() * 2) - 1);
            const theta = Math.random() * Math.PI * 2;
            
            // Namierime ich von z jadra
            spike.position.setFromSphericalCoords(1.0, phi, theta);
            spike.lookAt(0,0,0);
            spike.rotation.x -= Math.PI / 2; 

            // Uložíme si unikátny seed pre "organické vlnenie" tohto konkrétneho tykadla
            spike.userData = { 
                baseRotX: spike.rotation.x, 
                baseRotZ: spike.rotation.z,
                waveSpeed: 0.05 + Math.random() * 0.05,
                waveOffset: Math.random() * Math.PI * 2
            };

            this.core.add(spike);
            this.appendages.push(spike);
        }
        
        // Ak nás predátor zraní a klesne nám biomasa, strácame tykadlá (regresia)
        if (this.appendages.length > targetAppendages) {
            const lostSpike = this.appendages.pop();
            this.core.remove(lostSpike);
        }
    },

    createTrailParticle() {
        if (Math.abs(this.velocityX) < 0.01 && Math.abs(this.velocityY) < 0.01) return;
        const pGeom = new THREE.SphereGeometry(0.4 * this.baseScale, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const particle = new THREE.Mesh(pGeom, pMat);
        particle.position.set(this.posX - this.velocityX*5, this.posY - this.velocityY*5, 0);
        scene.add(particle);
        this.trail.push(particle);
    },

    update() {
        if (!this.mesh) return;

        // Kontrola, či sa nemáme fyzicky vyvinúť
        this.evolveShape();

        if (window.Entities) {
            const targetScale = 1.0 + (window.Entities.biomassCount * 0.015);
            this.baseScale += (targetScale - this.baseScale) * 0.05;
            this.mesh.scale.setScalar(this.baseScale);
        }

        this.posX += this.velocityX;
        this.posY += this.velocityY;
        this.mesh.position.set(this.posX, this.posY, 0);

        // Rotácia jadra
        this.core.rotation.y += 0.01;
        this.core.rotation.x += 0.005;

        // 🦑 Organické vlnenie tykadiel vo vode (ASMR efekt)
        const time = Date.now();
        for (let spike of this.appendages) {
            spike.rotation.x = spike.userData.baseRotX + Math.sin(time * spike.userData.waveSpeed + spike.userData.waveOffset) * 0.2;
            spike.rotation.z = spike.userData.baseRotZ + Math.cos(time * spike.userData.waveSpeed * 0.8 + spike.userData.waveOffset) * 0.2;
        }

        this.aura.scale.setScalar(1 + Math.sin(time * 0.005) * 0.1);

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
