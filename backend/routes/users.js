const express = require("express");
const { User, Article } = require("../models");
const router = express.Router();
// GET /api/users - Tous les utilisateurs
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "isActive", "createdAt"],
      include: [
        {
          model: Article,
          as: "articles",
          attributes: ["id", "status"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Ajouter statistiques pour chaque utilisateur
    const usersWithStats = users.map((user) => {
      const userData = user.toJSON();
      const articles = userData.articles || [];

      userData.stats = {
        totalArticles: articles.length,
        publishedArticles: articles.filter((a) => a.status === "published")
          .length,
        draftArticles: articles.filter((a) => a.status === "draft").length,
      };

      delete userData.articles;
      return userData;
    });

    res.json({
      success: true,
      data: usersWithStats,
    });
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
});
// GET /api/users/:id - Utilisateur spécifique
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "role", "isActive", "createdAt"],
      include: [
        {
          model: Article,
          as: "articles",
          attributes: ["id", "title", "status", "publishedAt", "viewCount"],
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Erreur récupération utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
});
module.exports = router;
