window.Player = {
    mesh: null, aura: null,
    posX: 0, posY: 0, velocityX: 0, velocityY: 0, speed: 0.15,
    trail: [], // Úložisko pre chvost
    baseScale: 1.0, // Základná veľkosť

    init() {
        // Hlavná skupina hráča
        this.mesh = new THREE.Group();

        // 1. Pevné vnútorné jadro
        const coreGeom = new THREE.IcosahedronGeometry(1, 2);
        const coreMat = new THREE.MeshPhongMaterial({ 
            color: 0x0ea5e9, emissive: 0x0284c7, shininess: 100 
        });
        const core = new THREE.Mesh(coreGeom, coreMat);
        this.mesh.add(core);

        // 2. Falošný Bloom (Aura) - Funguje na každom zariadení!
        const auraGeom = new THREE.SphereGeometry(1.6, 16, 16);
        const auraMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending // Toto vytvára pocit silného svetla
        });
        this.aura = new THREE.Mesh(auraGeom, auraMat);
        this.mesh.add(this.aura);

        scene.add(this.mesh);

        // Ovládanie pohybu (Myš aj Dotyk)
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

    // Generovanie organického chvosta
    createTrailParticle() {
        if (Math.abs(this.velocityX) < 0.01 && Math.abs(this.velocityY) < 0.01) return;

        const pGeom = new THREE.SphereGeometry(0.4 * this.baseScale, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({
            color: 0x0ea5e9, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
        });
        const particle = new THREE.Mesh(pGeom, pMat);
        
        // Chvost sa objaví jemne za bunkou
        particle.position.set(this.posX - this.velocityX*5, this.posY - this.velocityY*5, 0);
        scene.add(particle);
        this.trail.push(particle);
    },

    update() {
        if (!this.mesh) return;

        // Rast bunky na základe biomasy (z Entities)
        if (window.Entities) {
            // Každých 10 zjedených guličiek sa bunka jemne zväčší
            const targetScale = 1.0 + (window.Entities.biomassCount * 0.015);
            this.baseScale += (targetScale - this.baseScale) * 0.05; // Plynulý rast
            this.mesh.scale.setScalar(this.baseScale);
        }

        this.posX += this.velocityX;
        this.posY += this.velocityY;
        this.mesh.position.set(this.posX, this.posY, 0);

        // Rotácia bunky
        this.mesh.children[0].rotation.y += 0.01;
        this.mesh.children[0].rotation.x += 0.005;

        // Pulzovanie aury
        this.aura.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);

        // Tvorba chvosta (iba pri pohybe, každých pár snímkov)
        if (Math.random() > 0.5) this.createTrailParticle();

        // Fyzika chvosta (plynulé miznutie a zmenšovanie)
        for (let i = this.trail.length - 1; i >= 0; i--) {
            let p = this.trail[i];
            p.material.opacity -= 0.02; // Rýchlosť miznutia
            p.scale.setScalar(p.material.opacity);
            
            if (p.material.opacity <= 0) {
                scene.remove(p);
                this.trail.splice(i, 1);
            }
        }
    }
};
