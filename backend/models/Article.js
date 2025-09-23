module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    "Article",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 255],
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9-]+$/,
        },
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 500],
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [10, 65535], // Minimum 10 caractères
        },
      },
      featuredImage: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      status: {
        type: DataTypes.ENUM("draft", "published", "archived"),
        defaultValue: "draft",
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      // Clés étrangères définies par les associations
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
      },
    },
    {
      tableName: "articles",
      timestamps: true,
      indexes: [
        {
          fields: ["status"],
        },
        {
          fields: ["publishedAt"],
        },
        {
          unique: true,
          fields: ["slug"],
        },
      ],
      // Hooks Sequelize
      hooks: {
        // Hook AVANT validation - pour générer le slug
        beforeValidate: (article) => {
          console.log("🚀 Hook beforeValidate exécuté");

          // Auto-génération du slug si non fourni
          if (!article.slug && article.title) {
            console.log("Génération du slug pour:", article.title);
            article.slug = article.title
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "");
            console.log("Slug généré:", article.slug);
          }
        },

        // Hook AVANT création - pour la date de publication
        beforeCreate: (article) => {
          console.log("🚀 Hook beforeCreate exécuté");

          // Publication automatique si status = published
          if (article.status === "published" && !article.publishedAt) {
            article.publishedAt = new Date();
            console.log("Date de publication définie:", article.publishedAt);
          }
        },

        beforeUpdate: (article) => {
          // Mise à jour date de publication
          if (
            article.changed("status") &&
            article.status === "published" &&
            !article.publishedAt
          ) {
            article.publishedAt = new Date();
          }
        },
      },
    }
  );

  return Article;
};
