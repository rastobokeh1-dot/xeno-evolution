console.log("🧫 Modul PLAYER: Evolučná DNA pripravená.");

window.Player = {
    mesh: null,
    posX: 0,
    posY: 0,
    velocityX: 0,
    velocityY: 0,
    speed: 0.15,

    dna: {
        name: "Amoeba Primordialis",
        title: "Pasívny mikroorganizmus",
        level: 0,
        speedPoints: 0,
        toxicPoints: 0
    },

    init() {
        console.log("🧫 Vstrekujem evolučnú bunku...");

        const geometry = new THREE.IcosahedronGeometry(1.2, 4);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x38bdf8, 
            emissive: 0x0ea5e9, 
            emissiveIntensity: 0.5,
            shininess: 80,
            transparent: true,
            opacity: 0.85
        });

        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);

        this.createCellLabel();

        // Ovládanie pre iPhone
        window.addEventListener("touchmove", (e) => {
            if (e.cancelable) e.preventDefault();
            this.calculateDirection(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        window.addEventListener("touchstart", (e) => {
            if (e.cancelable) e.preventDefault();
            this.calculateDirection(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        window.addEventListener("touchend", () => {
            this.velocityX = 0;
            this.velocityY = 0;
        });

        // Ovládanie pre PC
        window.addEventListener("mousemove", (e) => {
            if (e.buttons === 1) this.calculateDirection(e.clientX, e.clientY);
        });
        window.addEventListener("mouseup", () => {
            this.velocityX = 0;
            this.velocityY = 0;
        });
    },

    createCellLabel() {
        const oldLabel = document.getElementById("cell-label");
        if (oldLabel) oldLabel.remove();

        const label = document.createElement("div");
        label.id = "cell-label";
        label.style.position = "absolute";
        label.style.color = "#38bdf8";
        label.style.fontFamily = "monospace";
        label.style.fontSize = "12px";
        label.style.fontWeight = "bold";
        label.style.textShadow = "0 0 8px #0ea5e9";
        label.style.pointerEvents = "none";
        label.style.textAlign = "center";
        label.style.zIndex = "99999";
        
        label.innerHTML = `<div id="cell-main-name">${this.dna.name}</div><div id="cell-sub-title" style="font-size:8px; color:#64748b; font-style:italic;">${this.dna.title}</div>`;
        
        document.body.appendChild(label);
    },

    calculateDirection(clientX, clientY) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const dirX = clientX - centerX;
        const dirY = -(clientY - centerY);

        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        if (distance > 15) { 
            this.velocityX = (dirX / distance) * this.speed;
            this.velocityY = (dirY / distance) * this.speed;
        }
    },

    mutate(type) {
        this.dna.level++;
        
        let targetColor = 0x38bdf8; 
        let targetEmissive = 0x0ea5e9;

        if (type === "VELOCIS") {
            this.dna.speedPoints++;
            this.speed += 0.008; 
            targetColor = 0xa855f7; 
            targetEmissive = 0x7e22ce;
        } else if (type === "TOXIC") {
            this.dna.toxicPoints++;
            targetColor = 0xef4444; 
            targetEmissive = 0x991b1b;
        }

        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.setHex(targetColor);
            this.mesh.material.emissive.setHex(targetEmissive);
        }

        if (this.dna.speedPoints > this.dna.toxicPoints) {
            this.dna.name = `Xeno-Velocis v${this.dna.level}`;
            this.dna.title = `⚡ Bičíkový synapsor (Gen: ${this.dna.speedPoints})`;
            const lbl = document.getElementById("cell-label");
            if (lbl) lbl.style.color = "#a855f7";
        } else if (this.dna.toxicPoints > this.dna.speedPoints) {
            this.dna.name = `Bio-Toxiferum Alpha`;
            this.dna.title = `🧪 Kyselinový mutant (Gen: ${this.dna.toxicPoints})`;
            const lbl = document.getElementById("cell-label");
            if (lbl) lbl.style.color = "#ef4444";
        } else {
            this.dna.name = `Chimera Hybridis`;
            this.dna.title = `🧬 Stabilizovaný hybrid (Evo: ${this.dna.level})`;
            const lbl = document.getElementById("cell-label");
            if (lbl) lbl.style.color = "#38bdf8";
        }

        const mainName = document.getElementById("cell-main-name");
        const subTitle = document.getElementById("cell-sub-title");
        if (mainName) mainName.innerText = this.dna.name;
        if (subTitle) subTitle.innerText = this.dna.title;
    },

    update() {
        if (!this.mesh) return;

        this.posX += this.velocityX;
        this.posY += this.velocityY;

        this.mesh.position.set(this.posX, this.posY, 0);

        const label = document.getElementById("cell-label");
        if (label && typeof camera !== 'undefined') {
            const tempV = new THREE.Vector3(this.posX, this.posY + 1.8, 0);
            tempV.project(camera);
            
            const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
            const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;
            
            label.style.left = Math.round(x) + "px";
            label.style.top = Math.round(y) + "px";
            label.style.transform = "translate(-50%, -50%)";
        }

        const time = Date.now() * 0.004;
        this.mesh.scale.setScalar(1 + Math.sin(time) * 0.04);
        this.mesh.rotation.y += 0.005;
    }
};
