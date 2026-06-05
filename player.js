console.log("🧫 Modul PLAYER: Evolučná DNA pripravená.");

const Player = {
    mesh: null,
    posX: 0,
    posY: 0,
    velocityX: 0,
    velocityY: 0,
    speed: 0.15,

    // DNA štatistiky pre evolúciu
    dna: {
        name: "Amoeba Primordialis",
        title: "Pasívny mikroorganizmus",
        level: 0,
        speedPoints: 0,
        toxicPoints: 0,
        predatorPoints: 0
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

        // Vytvoríme textový štítok v HTML pre názov bunky
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
    },

    createCellLabel() {
        // Ak už štítok existuje, zmažeme ho
        const oldLabel = document.getElementById("cell-label");
        if (oldLabel) oldLabel.remove();

        // Vytvoríme nový štítok, ktorý bude lietať nad bunkou
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
        
        label.innerHTML = `<div id="cell-main-name">${this.dna.name}</div><div id="cell-sub-title" style="font-size:8px; color:#64748b; font-style:italic;">${this.dna.title}</div>`;
        
        document.body.appendChild(label);
    },

    calculateDirection(clientX, clientY) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const dirX = clientX - centerX;
        const dirY = -(clientY - centerY);

        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        if (distance > 10) {
            this.velocityX = (dirX / distance) * this.speed;
            this.velocityY = (dirY / distance) * this.speed;
        }
    },

    // Funkcia, ktorú zavoláme z entities.js, keď zožerieme mutovanú bunku
    mutate(type) {
        this.dna.level++;
        
        if (type === "VELOCIS") {
            this.dna.speedPoints++;
            this.speed += 0.01;
            this.mesh.material.color.setHex(0xa855f7); // Zmena farby na fialovú
            this.mesh.material.emissive.setHex(0x7e22ce);
        } else if (type === "TOXIC") {
            this.dna.toxicPoints++;
            this.mesh.material.color.setHex(0x22c55e); // Zmena farby na toxickú zelenú
            this.mesh.material.emissive.setHex(0x15803d);
        }

        // KREATÍVNA AI DETEKCIA EVOLÚCIE: Dynamicky meníme názvy podľa bodov
        if (this.dna.speedPoints > this.dna.toxicPoints) {
            this.dna.name = `Xeno-Velocis Mk.${this.dna.level}`;
            this.dna.title = "⚡ Bičíkový synapsor";
            document.getElementById("cell-label").style.color = "#a855f7";
        } else {
            this.dna.name = `Bio-Toxiferum Alpha`;
            this.dna.title = "🧪 Kyselinový mutant";
            document.getElementById("cell-label").style.color = "#22c55e";
        }

        // Aktualizujeme text na obrazovke
        document.getElementById("cell-main-name").innerText = this.dna.name;
        document.getElementById("cell-sub-title").innerText = this.dna.title;
    },

    update() {
        if (!this.mesh) return;

        this.posX += this.velocityX;
        this.posY += this.velocityY;

        this.mesh.position.set(this.posX, this.posY, 0);

        // Prepočet 3D pozície bunky na 2D pixely na displeji iPhonu, aby štítok lietal presne nad ňou
        const label = document.getElementById("cell-label");
        if (label) {
            const tempV = new THREE.Vector3(this.posX, this.posY + 1.8, 0);
            tempV.project(camera);
            
            // Prepočet na pixely obrazovky
            const x = (tempV.x * .5 + .5) * window.innerWidth;
            const y = (tempV.y * -.5 + .5) * window.innerHeight;
            
            label.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
        }

        const time = Date.now() * 0.004;
        this.mesh.scale.setScalar(1 + Math.sin(time) * 0.05);
        this.mesh.rotation.y += 0.005;
    }
};
