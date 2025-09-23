const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

const {
  articleValidationRules,
  validateId,
  // handleValidationErrors,
} = require("../middlewares/validation");

// GET /api/articles - Liste des articles
router.get("/", articleController.index);

// GET /api/articles/:id - Article spécifique
router.get(
  "/:id",
  validateId(),
  // handleValidationErrors,
  articleController.show
);

// POST /api/articles - Créer un article
router.post(
  "/",
  articleValidationRules(),
  // handleValidationErrors,
  articleController.store
);

// PUT /api/articles/:id - Modifier un article
router.put(
  "/:id",
  validateId(),
  articleValidationRules(),
  // handleValidationErrors,
  articleController.update
);

// DELETE /api/articles/:id - Supprimer un article
router.delete(
  "/:id",
  validateId(),
  // handleValidationErrors,
  articleController.destroy
);

// POST /api/articles/:id/duplicate - Dupliquer un article
router.post(
  "/:id/duplicate",
  validateId(),
  // handleValidationErrors,
  articleController.duplicate
);
module.exports = router;
