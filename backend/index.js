require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const { seedDatabase } = require("./seeders");

const app = express();
const PORT = process.env.PORT || 3000;

// const fnName = async (params) => {
//   const bcrypt = require('bcrypt')
//   const saltRounds =parseInt(process.env.BCRYPT_ROUNDS) || 10;
//   const hashed = await bcrypt.hash("azerty", saltRounds)
//   console.log("==============", hashed)
// }
// fnName();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import des routes
const apiRoutes = require("./routes");
app.use("/api", apiRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API BackOffice avec Sequelize",
    version: "2.0.0",
    database: "MySQL + Sequelize",
  });
});

// Initialisation de la base de données
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion Sequelize établie");

    // Synchronisation des modèles (ATTENTION: en développement seulement)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ force: true });
      console.log("🔄 Tables synchronisées");

      // Ajout des données de test
      await seedDatabase();
    }
  } catch (error) {
    console.error("❌ Erreur d'initialisation:", error);
    process.exit(1);
  }
}

// Démarrage du serveur
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
}
startServer();

// Gestion propre de l'arrêt
process.on("SIGINT", async () => {
  console.log("\n🔄 Fermeture de la connexion Sequelize...");
  await sequelize.close();
  process.exit(0);
});
