const express = require("express");
const router = express.Router();
const articlesController = require("../controllers/articlesController");
const {
  authMiddleware,
  requireRole,
  requireOwnership,
  optionalAuth,
  auditMiddleware,
} = require("../middlewares/auth");

// Routes publiques (lecture seule)
router.get(
  "/",
  optionalAuth,
  auditMiddleware("VIEW_ARTICLES"),
  articlesController.getAll
);

router.get(
  "/:id",
  optionalAuth,
  auditMiddleware("VIEW_ARTICLE"),
  articlesController.getByID
);

// Routes protégées - Création (tous les utilisateurs connectés)
router.post(
  "/",
  authMiddleware,
  auditMiddleware("CREATE_ARTICLE"),
  articlesController.create
);

// Routes protégées - Modification (propriétaire ou admin/editor)
router.put(
  "/:id",
  authMiddleware,
  auditMiddleware("UPDATE_ARTICLE"),
  async (req, res, next) => {
    // Logique personnalisée pour la modification
    const articleId = req.params.id;
    const { Article } = require("../models");

    try {
      const article = await Article.findByPk(articleId);

      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article non trouvé",
        });
      }
      // Admin et editor peuvent modifier tout
      if (["admin", "editor"].includes(req.user.role)) {
        req.article = article;
        return next();
      }
      // Author ne peut modifier que ses propres articles
      if (req.user.role === "author" && article.userId === req.user.id) {
        req.article = article;
        return next();
      }
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez modifier que vos propres articles",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification des permissions",
      });
    }
  },
  articlesController.update
);

// Routes protégées - Suppression (propriétaire ou admin)
router.delete(
  "/:id",
  authMiddleware,
  auditMiddleware("DELETE_ARTICLE"),
  async (req, res, next) => {
    const articleId = req.params.id;
    const { Article } = require("../models");

    try {
      const article = await Article.findByPk(articleId);

      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article non trouvé",
        });
      }

      // Admin peut supprimer tout
      if (req.user.role === "admin") {
        req.article = article;
        return next();
      }

      // Author ne peut supprimer que ses propres articles
      if (req.user.role === "author" && article.userId === req.user.id) {
        req.article = article;
        return next();
      }

      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez supprimer que vos propres articles",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification des permissions",
      });
    }
  },

  articlesController.delete
);

// Route admin uniquement - Statistiques
router.get(
  "/stats/overview",
  authMiddleware,
  requireRole("admin"),
  auditMiddleware("VIEW_STATS"),
  articlesController.getStats
);

module.exports = router;
