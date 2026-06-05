console.log("⚙️ Modul GAME: Hlavný mozog spustený.");

// Inicializácia hry po načítaní všetkých súborov
window.addEventListener("load", () => {
    World.init();
    Player.init();
    Entities.init();
    console.log("🚀 XENO-GENESIS úspešne naštartovaná!");
});
