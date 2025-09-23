const express = require("express");
const router = express.Router();
// Import des routes
const articlesRoutes = require("./articles");
const usersRoutes = require("./users");
const categoriesRoutes = require("./categories");
// Montage des routes
router.use("/articles", articlesRoutes);
router.use("/users", usersRoutes);
router.use("/categories", categoriesRoutes);
// Route de santé avec info DB
router.get("/health", async (req, res) => {
  try {
    const { sequelize } = require("../models");
    await sequelize.authenticate();

    res.json({
      success: true,
      message: "API opérationnelle",
      database: "MySQL + Sequelize",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur base de données",
      error: error.message,
    });
  }
});
module.exports = router;
