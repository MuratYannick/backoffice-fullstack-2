const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../models')

const authMiddleware = async (req,res,next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({
        success:false,
        message: 'token d\'authentification requis'
      })
    }

    const token = authHeader.substring(7) // Enlever "Bearer "

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Récupérer l'utilisateur complet depuis la DB
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password']} // Exclure le mot de passe
    })

    if (!user) {
      return res.status(401).json({
        succes: false,
        message: "utilisateur non trouvé",
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        succes: false,
        message: "Compte désactivé"
      })
    }

    // Ajouter l'utilisateur à la requête
    req.user = user
    next()
  } catch (error) {
    console.error("Erreur authentification:", error)

    if (error.name == 'jsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Token invalide"
      })
    }

    if (error.name === "TokenEpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré"
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification'
    })
  }
}

// Middleware pour Verifier les rôles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise"
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        succes: false,
        message: "Permissions insuffisantes"
      })
    }

    next()
  }
}

module.exports = {
  authMiddleware,
  requireRole
}