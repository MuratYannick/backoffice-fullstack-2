const express = require("express");
const { Category, Article } = require("../models");
const router = express.Router();
// GET /api/categories - Toutes les catégories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Article,
          as: "articles",
          attributes: ["id"],
          where: { status: "published" },
          required: false, // LEFT JOIN pour inclure catégories sans articles
        },
      ],
      order: [["name", "ASC"]],
    });

    // Ajouter le compte d'articles pour chaque catégorie
    const categoriesWithCount = categories.map((category) => {
      const categoryData = category.toJSON();
      categoryData.articleCount = category.articles.length;
      delete categoryData.articles; // Supprimer le détail des articles
      return categoryData;
    });

    res.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error("Erreur récupération catégories:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
});
// GET /api/categories/:id - Catégorie spécifique avec articles
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Article,
          as: "articles",
          where: { status: "published" },
          required: false,
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "name"],
            },
          ],
          order: [["publishedAt", "DESC"]],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Catégorie non trouvée",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Erreur récupération catégorie:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
});
module.exports = router;
