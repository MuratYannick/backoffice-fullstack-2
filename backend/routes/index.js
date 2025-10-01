const express = require("express");
const router = express.Router();

// Import des routes
const articlesRoutes = require("./articles");
const usersRoutes = require("./users");
const categoriesRoutes = require("./categories");
const authRoutes = require('./auth')

// Montage des routes
router.use("/articles", articlesRoutes);
router.use("/users", usersRoutes);
router.use("/categories", categoriesRoutes);
router.use('/auth', authRoutes)

// Route de santé avec info auth
router.get("/health", async (req, res) => {
  try {
    const { sequelize } = require("../models");
    await sequelize.authenticate();

    res.json({
      success: true,
      message: "API opérationnelle",
      features: {
        database: "MySQL + Sequelize",
        authentication: 'JWT + bcrypt'
      },
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
