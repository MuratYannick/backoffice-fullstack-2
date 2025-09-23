const { Article, User, Category, sequelize } = require("../models");
const { Op } = require("sequelize");

const articleController = {
  // GET /api/articles - Liste avec filtres et pagination
  index: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        categoryId,
        userId,
        search,
        sortBy = "createdAt",
        sortOrder = "DESC",
      } = req.query;

      // Construction des filtres
      const where = {};
      if (status) where.status = status;
      if (categoryId) where.categoryId = categoryId;
      if (userId) where.userId = userId;
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { summary: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
        ];
      }

      // Calcul pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Requête avec comptage
      const { count, rows: articles } = await Article.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "email", "role"],
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug", "color"],
          },
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset,
        distinct: true,
      });

      // Métadonnées pagination
      const totalPages = Math.ceil(count / limit);
      const pagination = {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
      res.json({
        success: true,
        data: articles,
        pagination,
        filters: { status, categoryId, userId, search, sortBy, sortOrder },
      });
    } catch (error) {
      console.error("Erreur récupération articles:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des articles",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // GET /api/articles/:id - Article spécifique
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const article = await Article.findByPk(id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "email", "role"],
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug", "color", "description"],
          },
        ],
      });
      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article non trouvé",
        });
      }

      // Incrémenter le compteur de vues de manière asynchrone
      article
        .increment("viewCount")
        .catch((err) => console.error("Erreur incrémentation vues:", err));
      res.json({
        success: true,
        data: article,
      });
    } catch (error) {
      console.error("Erreur récupération article:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de l'article",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // POST /api/articles - Créer un article
  store: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        title,
        summary,
        content,
        status = "draft",
        categoryId,
        userId,
      } = req.body;

      // Génération automatique du slug
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
        .replace(/[^a-z0-9\s-]/g, ""); // Garder seulement lettres, chiffres, espaces,
      tirets
        .replace(/\s+/g, "-") // Remplacer espaces par tirets
        .replace(/-+/g, "-") // Éviter tirets multiples
        .replace(/^-|-$/g, ""); // Supprimer tirets début/fin
      const articleData = {
        title,
        slug,
        summary: summary || null,
        content,
        status,
        categoryId: categoryId || null,
        userId,
      };

      // Si publié, définir la date de publication
      if (status === "published") {
        articleData.publishedAt = new Date();
      }
      const article = await Article.create(articleData, { transaction });

      // Récupérer l'article avec ses relations
      const createdArticle = await Article.findByPk(article.id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "email", "role"],
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug", "color"],
          },
        ],
        transaction,
      });
      await transaction.commit();
      res.status(201).json({
        success: true,
        data: createdArticle,
        message: "Article créé avec succès",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur création article:", error);

      // Gestion des erreurs Sequelize
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          message: "Erreurs de validation",
          errors: error.errors.map((err) => ({
            field: err.path,
            message: err.message,
            value: err.value,
          })),
        });
      }
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          success: false,
          message: "Un article avec ce titre ou ce slug existe déjà",
        });
      }
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de l'article",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // PUT /api/articles/:id - Modifier un article
  update: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { title, summary, content, status, categoryId } = req.body;
      const article = await Article.findByPk(id, { transaction });
      if (!article) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Article non trouvé",
        });
      }

      // Générer nouveau slug si le titre change
      let updateData = {
        title,
        summary: summary || null,
        content,
        status,
        categoryId: categoryId || null,
      };
      if (title !== article.title) {
        updateData.slug = title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      }

      // Gestion date de publication
      if (status === "published" && article.status !== "published") {
        updateData.publishedAt = new Date();
      } else if (status !== "published" && article.status === "published") {
        updateData.publishedAt = null;
      }
      await article.update(updateData, { transaction });

      // Récupérer avec relations
      const updatedArticle = await Article.findByPk(id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "email", "role"],
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug", "color"],
          },
        ],
        transaction,
      });
      await transaction.commit();
      res.json({
        success: true,
        data: updatedArticle,
        message: "Article modifié avec succès",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur modification article:", error);
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          message: "Erreurs de validation",
          errors: error.errors.map((err) => ({
            field: err.path,
            message: err.message,
            value: err.value,
          })),
        });
      }
      res.status(500).json({
        success: false,
        message: "Erreur lors de la modification de l'article",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // DELETE /api/articles/:id - Supprimer un article
  destroy: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const article = await Article.findByPk(id, { transaction });
      if (!article) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Article non trouvé",
        });
      }

      // Stocker les infos pour la réponse
      const articleInfo = {
        id: article.id,
        title: article.title,
      };
      await article.destroy({ transaction });
      await transaction.commit();
      res.json({
        success: true,
        message: `Article "${articleInfo.title}" supprimé avec succès`,
        data: { id: articleInfo.id },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur suppression article:", error);

      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de l'article",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // POST /api/articles/:id/duplicate - Dupliquer un article
  duplicate: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const originalArticle = await Article.findByPk(id, { transaction });
      if (!originalArticle) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Article à dupliquer non trouvé",
        });
      }

      // Créer une copie
      const duplicateData = {
        title: `${originalArticle.title} (Copie)`,
        slug: `${originalArticle.slug}-copie-${Date.now()}`,
        summary: originalArticle.summary,
        content: originalArticle.content,
        status: "draft", // Toujours en brouillon
        categoryId: originalArticle.categoryId,
        userId: originalArticle.userId,
        publishedAt: null,
        viewCount: 0,
      };
      const duplicatedArticle = await Article.create(duplicateData, {
        transaction,
      });

      // Récupérer avec relations
      const articleWithRelations = await Article.findByPk(
        duplicatedArticle.id,
        {
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "name", "email", "role"],
            },
            {
              model: Category,
              as: "category",
              attributes: ["id", "name", "slug", "color"],
            },
          ],
          transaction,
        }
      );
      await transaction.commit();
      res.status(201).json({
        success: true,
        data: articleWithRelations,
        message: "Article dupliqué avec succès",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur duplication article:", error);

      res.status(500).json({
        success: false,
        message: "Erreur lors de la duplication de l'article",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
};

module.exports = articleController;
