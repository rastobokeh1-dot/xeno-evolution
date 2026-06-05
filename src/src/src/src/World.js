window.World = {
    backgroundParticles: null,

    init() {
        console.log("🌍 Modul WORLD: Vytváram mikroskopický oceán...");
        
        // Vytvoríme 2000 mikro-častíc (planktón / organický prach)
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Rozptýlime ich po obrovskej ploche, ale zatlačíme ich do hĺbky (os Z)
            positions[i * 3] = (Math.random() - 0.5) * 200;      // X (šírka)
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;  // Y (výška)
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20; // Z (hĺbka vzadu)
            
            // Náhodná veľkosť častíc pre ilúziu perspektívy
            sizes[i] = Math.random() * 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Materiál pre hlbinný planktón
        const material = new THREE.PointsMaterial({
            color: 0x0284c7, // Tmavšia modrá, aby neťahala oči
            size: 0.2,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending // Svietiaci efekt pri prekrytí
        });

        this.backgroundParticles = new THREE.Points(geometry, material);
        scene.add(this.backgroundParticles);
    },

    update() {
        if (!this.backgroundParticles) return;
        
        // Celý oceán sa jemne a pomaly otáča, čo vytvára organický prúd vody
        this.backgroundParticles.rotation.z += 0.0003;
        this.backgroundParticles.rotation.x += 0.0001;
    }
};
