// backend/config/database.js

const { Sequelize } = require("sequelize");
// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "backoffice_db",
  dialect: "mysql",
  logging: console.log, // Affiche les requêtes SQL
  pool: {
    max: 5, // Maximum 5 connexions simultanées
    min: 0, // Minimum 0 connexions
    acquire: 30000, // Timeout d'acquisition : 30s
    idle: 10000, // Timeout d'inactivité : 10s
  },
};

// - Création automatique de la DB via Sequelize
const mysql = require("mysql2/promise");
async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
  );
  await connection.end();
  console.log(`📁 Base de données '${dbConfig.database}' prête`);
}

// Création de l'instance Sequelize
const sequelize = new Sequelize(dbConfig);
// Test de connexion
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion MySQL établie avec succès");
  } catch (error) {
    console.error("❌ Impossible de se connecter à MySQL:", error.message);
    process.exit(1);
  }
}
module.exports = { sequelize, testConnection, createDatabaseIfNotExists };
