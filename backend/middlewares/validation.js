const { body, param, validationResult } = require("express-validator");

// Middleware pour géréer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { // ✅ Correction ici
    return res.status(400).json({
      success: false,
      message: "Erreurs de validation", // ✅ Et correction de la faute
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// Règle de validation pour les articles
const articleValidationRules = () => {
  return [
    body("title")
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage("Le titre doit contenir entre 3 et 255 caractères")
      .custom(async (value, { req }) => {
        // Vérifier l'unicité du titre (sauf pour l'article en cours de modification)
        const { Article } = require("../models");
        const whereCondition = { title: value };
        
        // TODO: Correction de la syntaxe pour l'exclusion de l'ID lors de la modification
        if (req.params.id) {
          const { Op } = require("sequelize");
          whereCondition.id = { [Op.ne]: req.params.id };
        }
        
        const existingArticle = await Article.findOne({
          where: whereCondition,
        });
        
        if (existingArticle) {
          throw new Error("Un article avec ce titre existe déjà");
        }
        return true;
      }),

    body('summary')
      .optional()
      .trim()
      .isLength({max: 500})
      .withMessage('Le resumé ne peut dépasser 500 caractères'),

    body('content')
      .trim()
      .isLength({min:10, max: 65535})
      .withMessage('Le contenu doit contenir entre 10 et 65535 caractères'),

    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Le statut doit être draft, published ou archived'),

    body('categoryId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID de catégorie doit être un entier positif')
      .custom(async (value) => {
        if (value) {
          const { Category } = require('../models')
          const category = await Category.findByPk(value)
          if (!category) {
            throw new Error('La catégorie spécifiée n\'existe pas')
          }
        }
        return true
      }),

    body('userId')
      .isInt({ min: 1 })
      .withMessage('L\'ID utilisateur doit être un entier positif')
      .custom(async (value) => {
        const { User } = require('../models')
        const user = await User.findByPk(value)
        if (!user) {
          throw new Error('L\'utilisateur spécifié n\'existe pas')
        }
        return true
      })
  ]
}

// Validation des paramètres ID
const validateId = () => {
  return [
    param("id")
      .isInt({ min: 1 })
      .withMessage("L'ID doit être un entier positif"),
  ];
};

module.exports = {
  handleValidationErrors,
  articleValidationRules,
  validateId,
};