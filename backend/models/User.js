module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 100],
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      role: {
        type: DataTypes.ENUM("admin", "editor", "author"),
        defaultValue: "author",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "users",
      timestamps: true, // createdAt, updatedAt
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
      ],
    }
  );
  
  return User;
};
