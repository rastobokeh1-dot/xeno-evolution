console.log("🧫 Modul PLAYER: Spúšťam ultra-organickú evolučnú simuláciu.");

window.Player = {
    mesh: null,
    coreMesh: null,       // 🌌 Vnútorné biochemické jadro
    membraneMesh: null,   // 🌌 Vonkajšia pulzujúca membrána
    originalVertices: [], // 🧬 Pamäť pre organickú deformáciu
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
        console.log("🧫 Injektujem bio-organické tkanivo...");

        // Použijeme vysokodetailnú geometriu (64 segmentov), aby bolo vlnenie dokonale plynulé
        const geometry = new THREE.IcosahedronGeometry(1.2, 4);
        
        // Uložíme si pôvodné pozície bodov pre výpočet tekutých vĺn
        const posAttr = geometry.attributes.position;
        this.originalVertices = [];
        for (let i = 0; i < posAttr.count; i++) {
            this.originalVertices.push(new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)));
        }

        // 1. MATERIÁL PRE VNÚTORNÉ JADRO (Hutná bio-hmota)
        const coreMat = new THREE.MeshPhongMaterial({ 
            color: 0x0ea5e9, 
            emissive: 0x0369a1, 
            emissiveIntensity: 0.8,
            shininess: 100,
            flatShading: false
        });
        this.coreMesh = new THREE.Mesh(geometry, coreMat);
        this.coreMesh.scale.setScalar(0.85); // Jadro je o niečo menšie

        // 2. MATERIÁL PRE VONKAJŠIU MEMBRÁNU (Tekutý sklenený obal)
        const membraneMat = new THREE.MeshPhongMaterial({ 
            color: 0x38bdf8, 
            emissive: 0x0ea5e9, 
            emissiveIntensity: 0.3,
            shininess: 30,
            transparent: true,
            opacity: 0.45,
            wireframe: false // Ak by si chcel digitálny vzhľad, prepni na true
        });
        // Pre vonkajšiu membránu vytvoríme klon geometrie
        this.membraneMesh = new THREE.Mesh(geometry.clone(), membraneMat);

        // Spojíme jadro a membránu do jedného hlavného objektu
        this.mesh = new THREE.Group();
        this.mesh.add(this.coreMesh);
        this.mesh.add(this.membraneMesh);
        
        scene.add(this.mesh);

        this.createCellLabel();

        // Ovládanie
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
        label.style.color = "#ffffff";
        label.style.fontFamily = "'Courier New', monospace";
        label.style.fontSize = "11px";
        label.style.fontWeight = "bold";
        label.style.letterSpacing = "1px";
        label.style.background = "rgba(8, 47, 73, 0.5)"; 
        label.style.backdropFilter = "blur(6px)"; 
        label.style.border = "1px solid rgba(56, 189, 248, 0.3)"; 
        label.style.padding = "6px 12px";
        label.style.borderRadius = "4px"; // Ostré laboratórne rohy vyzerajú dospelemie ako oblé guličky
        label.style.boxShadow = "0 0 15px rgba(14, 165, 233, 0.2)";
        label.style.pointerEvents = "none";
        label.style.textAlign = "center";
        label.style.zIndex = "99999";
        
        label.innerHTML = `<div id="cell-main-name" style="color: #38bdf8; text-shadow: 0 0 8px #0ea5e9;">${this.dna.name}</div>
                           <div id="cell-sub-title" style="font-size:8px; color:#64748b; margin-top: 3px; text-transform: uppercase;">${this.dna.title}</div>`;
        
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
        
        let coreColor = 0x0ea5e9, coreEmis = 0x0369a1;
        let membColor = 0x38bdf8, membEmis = 0x0ea5e9;
        let borderColor = "rgba(56, 189, 248, 0.3)";

        if (type === "VELOCIS") {
            this.dna.speedPoints++;
            this.speed += 0.008; 
            coreColor = 0x7e22ce; coreEmis = 0x4c1d95;
            membColor = 0xc084fc; membEmis = 0xa855f7;
            borderColor = "rgba(168, 85, 247, 0.4)";
        } else if (type === "TOXIC") {
            this.dna.toxicPoints++;
            coreColor = 0xb91c1c; coreEmis = 0x7f1d1d;
            membColor = 0xfca5a5; membEmis = 0xef4444;
            borderColor = "rgba(239, 68, 68, 0.4)";
        }

        if (this.coreMesh && this.membraneMesh) {
            this.coreMesh.material.color.setHex(coreColor);
            this.coreMesh.material.emissive.setHex(coreEmis);
            this.membraneMesh.material.color.setHex(membColor);
            this.membraneMesh.material.emissive.setHex(membEmis);
        }

        const lbl = document.getElementById("cell-label");
        const mainName = document.getElementById("cell-main-name");
        const subTitle = document.getElementById("cell-sub-title");

        if (lbl) {
            lbl.style.border = `1px solid ${borderColor}`;
            lbl.style.boxShadow = `0 0 15px ${borderColor}`;
        }

        if (this.dna.speedPoints > this.dna.toxicPoints) {
            this.dna.name = `XENO-VELOCIS v${this.dna.level}`;
            this.dna.title = `⚡ SYNAPSOR [GEN: ${this.dna.speedPoints}]`;
            if (mainName) { mainName.style.color = "#c084fc"; mainName.style.textShadow = "0 0 8px #a855f7"; }
        } else if (this.dna.toxicPoints > this.dna.speedPoints) {
            this.dna.name = `BIO-TOXIFERUM MATER`;
            this.dna.title = `🧪 MUTANT [GEN: ${this.dna.toxicPoints}]`;
            if (mainName) { mainName.style.color = "#fca5a5"; mainName.style.textShadow = "0 0 8px #ef4444"; }
        } else {
            this.dna.name = `CHIMERA HYBRIDIS`;
            this.dna.title = `🧬 HYBRID [EVO: ${this.dna.level}]`;
            if (mainName) { mainName.style.color = "#38bdf8"; mainName.style.textShadow = "0 0 8px #0ea5e9"; }
        }

        if (mainName) mainName.innerText = this.dna.name;
        if (subTitle) subTitle.innerText = this.dna.title;
    },

    update() {
        if (!this.mesh) return;

        this.posX += this.velocityX;
        this.posY += this.velocityY;
        this.mesh.position.set(this.posX, this.posY, 0);

        // 🧬 ULTRA-GRAFIKA: ORGANICKÁ DEFORMÁCIA (PRELIEVANIE BUNKAMI)
        const time = Date.now() * 0.0025;
        
        // Deformujeme jadro
        const corePosAttr = this.coreMesh.geometry.attributes.position;
        for (let i = 0; i < corePosAttr.count; i++) {
            const orig = this.originalVertices[i];
            
            // Komplexné trojrozmerné vlnenie (sinusoidy naprieč osami X, Y, Z)
            const wave = Math.sin(orig.x * 2.5 + time) * 0.08 + 
                         Math.cos(orig.y * 2.0 + time) * 0.08 + 
                         Math.sin(orig.z * 3.0 + time * 0.5) * 0.04;
            
            // Posunieme bod v smere jeho normály (smerom von/dnu)
            corePosAttr.setXYZ(i, orig.x + wave, orig.y + wave, orig.z + wave);
        }
        corePosAttr.needsUpdate = true;

        // Deformujeme membránu (s miernym oneskorením a inou frekvenciou, aby sa prelievali cez seba)
        const membPosAttr = this.membraneMesh.geometry.attributes.position;
        for (let i = 0; i < membPosAttr.count; i++) {
            const orig = this.originalVertices[i];
            const wave = Math.sin(orig.y * 3.0 - time) * 0.12 + 
                         Math.cos(orig.z * 1.5 + time) * 0.06;
            
            membPosAttr.setXYZ(i, orig.x + wave, orig.y + wave, orig.z + wave);
        }
        membPosAttr.needsUpdate = true;

        // Pomalá organická rotácia oboch vrstiev proti sebe
        this.coreMesh.rotation.y += 0.003;
        this.membraneMesh.rotation.y -= 0.001;
        this.membraneMesh.rotation.x += 0.002;

        // UI Label sledovanie
        const label = document.getElementById("cell-label");
        if (label && typeof camera !== 'undefined') {
            const tempV = new THREE.Vector3(this.posX, this.posY + 2.2, 0);
            tempV.project(camera);
            const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
            const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;
            label.style.left = Math.round(x) + "px";
            label.style.top = Math.round(y) + "px";
            label.style.transform = "translate(-50%, -50%)";
        }
    }
};
