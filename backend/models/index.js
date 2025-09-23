const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");

// Import des modèles
const User = require("./User")(sequelize, DataTypes);
const Article = require("./Article")(sequelize, DataTypes);
const Category = require("./Category")(sequelize, DataTypes);

// Définition des associations
User.hasMany(Article, {
  foreignKey: "userId",
  as: "articles",
});

Article.belongsTo(User, {
  foreignKey: "userId",
  as: "author",
});

Category.hasMany(Article, {
  foreignKey: "categoryId",
  as: "articles",
});

Article.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

// Export des modèles
module.exports = {
  sequelize,
  User,
  Article,
  Category,
};
