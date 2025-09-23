module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [2, 50],
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9-]+$/, // Format slug : lettres, chiffres, tirets
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING(7), // Format hex : #FFFFFF
        defaultValue: "#6B7280",
        validate: {
          is: /^#[0-9A-F]{6}$/i,
        },
      },
    },
    {
      tableName: "categories",
      timestamps: true,
    }
  );
  
  return Category;
};
