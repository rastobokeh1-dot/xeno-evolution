console.log("🌌 Modul WORLD: Seed Engine pripravený.");

const World = {
    currentSeed: 84920, // Tvoj unikátny seed sveta. Zmenou tohto čísla sa kompletne zmení celý vesmír!
    stars: [],

    // Matematická funkcia na generovanie pseudonáhodných čísel podľa seedu
    seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    },

    init() {
        console.log(`🌌 Generujem procedurálny svet pre SEED: ${this.currentSeed}`);
        
        // Vygenerujeme hviezdne pozadie stabilne naviazané na náš seed
        const starGeometry = new THREE.SphereGeometry(0.04, 4, 4);
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });

        let localSeed = this.currentSeed;
        for (let i = 0; i < 300; i++) {
            const star = new THREE.Mesh(starGeometry, starMaterial);
            
            // Súradnice sú vypočítané cez náš seed, takže hviezdy budú vždy na rovnakom mieste pre daný seed
            const rx = this.seededRandom(localSeed++) * 200 - 100;
            const ry = this.seededRandom(localSeed++) * 120 - 60;
            const rz = this.seededRandom(localSeed++) * 40 - 30;
            
            star.position.set(rx, ry, rz);
            scene.add(star);
            this.stars.push(star);
        }
    },

    // Funkcia, ktorá povie, aký bióm sa nachádza na daných súradniciach v nekonečne
    getBiomeAt(x, y) {
        const value = this.seededRandom(this.currentSeed + Math.floor(x/10) + Math.floor(y/10));
        if (value < 0.3) return "DEFAULT";  // Zelená potrava
        if (value < 0.6) return "VELOCIS";  // Fialové bunky (Rýchlosť)
        return "TOXIC";                     // Červené/Zelené bunky (Agresivita)
    }
};
