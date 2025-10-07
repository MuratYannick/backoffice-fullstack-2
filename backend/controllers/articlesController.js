const { Article, User, Category, sequelize } = require("../models");

const articlesController = {
  // GET /api/articles - Liste des articles
  getAll: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        author,
        status,
        search,
      } = req.query;
      const offset = (page - 1) * limit;

      // Construction dynamique des filtres
      const whereClause = {};

      if (category) whereClause.categoryId = category;
      if (author) whereClause.userId = author;
      if (status) whereClause.status = status;
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
        ];
      }

      // Si utilisateur connecté, montrer tous les articles
      // Sinon, montrer seulement les articles publiés
      if (!req.user) {
        whereClause.status = "published";
      }

      const { count, rows: articles } = await Article.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ["id", "name", "email", "role"],
          },
          {
            model: Category,
            attributes: ["id", "name", "color"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: articles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Erreur récupération articles:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des articles",
      });
    }
  },

  getById: async (req, res) => {
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

  // POST /api/articles - Création d'article
  create: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { title, content, categoryId, status = "draft" } = req.body;

      // Validation des données
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: "Titre et contenu requis",
        });
      }

      // Vérifier que la catégorie existe
      if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: "Catégorie invalide",
          });
        }
      }

      // Authors ne peuvent créer que des brouillons
      let finalStatus = status;
      if (req.user.role === "author" && status === "published") {
        finalStatus = "draft";
      }

      const article = await Article.create(
        {
          title,
          content,
          categoryId,
          status: finalStatus,
          userId: req.user.id,
        },
        { transaction }
      );

      await transaction.commit();

      // Récupérer l'article complet avec les relations
      const fullArticle = await Article.findByPk(article.id, {
        include: [
          {
            model: User,
            attributes: ["id", "name", "email", "role"],
          },
          {
            model: Category,
            attributes: ["id", "name", "color"],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Article créé avec succès",
        data: fullArticle,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur création article:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de l'article",
      });
    }
  },

  // PUT /api/articles/:id - Modification d'article
  update: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { title, content, categoryId, status } = req.body;
      const article = req.article; // Injecté par le middleware

      // Validation des données
      if (title !== undefined && !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Le titre ne peut pas être vide",
        });
      }

      // Vérifier la catégorie si fournie
      if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: "Catégorie invalide",
          });
        }
      }

      // Authors ne peuvent pas publier directement
      let finalStatus = status;
      if (req.user.role === "author" && status === "published") {
        finalStatus = "pending";
      }

      await article.update(
        {
          ...(title && { title }),
          ...(content && { content }),
          ...(categoryId && { categoryId }),
          ...(finalStatus && { status: finalStatus }),
        },
        { transaction }
      );

      await transaction.commit();

      // Récupérer l'article mis à jour avec les relations
      const updatedArticle = await Article.findByPk(article.id, {
        include: [
          {
            model: User,
            attributes: ["id", "name", "email", "role"],
          },
          {
            model: Category,
            attributes: ["id", "name", "color"],
          },
        ],
      });

      res.json({
        success: true,
        message: "Article mis à jour avec succès",
        data: updatedArticle,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur modification article:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la modification de l'article",
      });
    }
  },

  // DELETE /api/articles/:id - Suppression d'article
  delete: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const article = req.article; // Injecté par le middleware
      await article.destroy({ transaction });
      await transaction.commit();
      res.json({
        success: true,
        message: "Article supprimé avec succès",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur suppression article:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de l'article",
      });
    }
  },

  // GET /api/articles/stats/overview - Statistiques (admin uniquement)
  getStats: async (req, res) => {
    try {
      const stats = await Article.findAll({
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["status"],
      });

      const totalArticles = await Article.count();
      const publishedArticles = await Article.count({
        where: { status: "published" },
      });
      const draftArticles = await Article.count({ where: { status: "draft" } });
      const pendingArticles = await Article.count({
        where: { status: "pending" },
      });

      res.json({
        success: true,
        data: {
          total: totalArticles,
          published: publishedArticles,
          draft: draftArticles,
          pending: pendingArticles,
          byStatus: stats,
        },
      });
    } catch (error) {
      console.error("Erreur statistiques articles:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques",
      });
    }
  },
};

module.exports = articlesController;
