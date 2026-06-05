console.log("🌌 Modul WORLD: Načítaný a pripravený.");

const World = {
    stars: [],

    init() {
        console.log("🌌 Generujem mikro-vesmír a hmlovinu...");

        // Vytvoríme 400 unikátnych mikro-častíc (hviezdny prach)
        const starGeometry = new THREE.SphereGeometry(0.03, 4, 4);
        const starMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });

        // Rozmiestnime ich do obrovského 3D priestoru
        for (let i = 0; i < 400; i++) {
            const star = new THREE.Mesh(starGeometry, starMaterial);
            
            star.position.set(
                (Math.random() - 0.5) * 100, // Šírka
                (Math.random() - 0.5) * 60,  // Výška
                (Math.random() - 0.5) * 40   // Hĺbka (Z-os, vytvára 3D vrstvy)
            );

            // Jemná náhodná veľkosť pre prirodzenejší vzhľad
            const randomScale = Math.random() * 1.5;
            star.scale.setScalar(randomScale);

            scene.add(star); // Pridáme do globálnej scény z game.js
            this.stars.push(star);
        }
    }
};
