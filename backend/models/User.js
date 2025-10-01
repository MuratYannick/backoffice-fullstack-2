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
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 255],
          notEmpty: true,
        }
      },
      role: {
        type: DataTypes.ENUM("admin", "editor", "author"),
        defaultValue: "author",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lockedUntil:{
        type: DataTypes.DATE,
        allowNull:true,
      }
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
      hooks: {
        // Hook pour asher le mot de passe avant sauvegarde
        beforeCreate: async (user) => {
          if (user.password) {
            const bcrypt = require('bcrypt')
            const saltRounds =parseInt(process.env.BCRYPT_ROUNDS) || 10
            user.password = await bcrypt.hash(user.password, saltRounds)
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed(password)) {
            const bcrypt = require('bcrypt')
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10
            user.password = await bcrypt.hash(user.password, saltRounds)
          }
        }
      }
    }
  );

  // Méthode pour comparer les mots de passe
  User.prototype.comparePassword = async function (candidatePassword) {
    const bcrypt = require('bcrypt')
    return await bcrypt.compare(candidatePassword, this.password)
  }
  
  //method pour générer un JWT
  User.prototype.generateJWT = function() {
    const jwt = require('jsonwebtoken')
    const playload = {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role
    }

    return jwt.sign(playload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'backoffice-app'
    })
  }

  //Méthode pour verifier si le compte est bloqué
  User.prototype.isLocked = function () {
    return !!(this.lockedUntil && this.lockedUntil > Date.now())
  }

  return User;
};
