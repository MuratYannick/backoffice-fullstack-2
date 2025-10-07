const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../models')

const authMiddleware = async (req,res,next) => {
  try {
    const authHeader = req.headers.authorization
    console.log('REQUEST :', req) // visualisation de req
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({
        success:false,
        message: 'token d\'authentification requis',
        code:'TOKEN_MISSING'
      })
    }

    const token = authHeader.substring(7)

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Récupérer l'utilisateur complet
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] } 
    })

    if (!user) {
      return res.status(401).json({
        succes: false,
        message: "utilisateur non trouvé",
        code: "USER_NOT_FOUND"
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        succes: false,
        message: "Compte désactivé",
        code: "ACCOUNT_DISABLED"
      })
    }

    // Vérifier si le compte est bloqué:
    if (user.isLocked && user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Compte temporairement bloqué',
        code: "ACCOUNT_LOCKED"
      })
    }

    // Ajouter l'utilisateur à la requête
    req.user = user
    req.token = token
    next()
  } catch (error) {
    console.error("Erreur authentification:", error)

    if (error.name == 'jsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Token invalide",
        code: "TOKEN_INVALID"
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré",
        code: "TOKEN_EXPIRED"
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification',
      code: "AUTH_ERROR"
    })
  }
}

// Middleware pour Verifier les rôles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
        code: "AUTH_REQUIRED"
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        succes: false,
        message: "Permissions insuffisantes",
        code: "INSUFFICIENT_PERMISSIONS",
        required: allowedRoles,
        current: req.user.role
      })
    }

    next()
  }
}

// Middleware pour vérifier la propriété d'une ressource
const requireOwnership = (modelName, idParam = 'id', userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      const { [modelName]: Model } = require('../models')
      const resourceId = req.params[idParam]

      const resource = await Model.findByPk(resourceId)

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource non trouvée',
          code: "RESOURCE_NOT_FOUND"
        })
      }

      // Admin peut tout faire
      if (req.user.role === 'admin') {
        req.resource = resource
        return next()
      }

      // Vérifier la propriété
      if (resource[userIdField] !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé à cette ressource',
          code: 'ACCESS_DENIED'
        })
      }

      req.resource = resource
      next()
    } catch (error) {
      console.error('Erreur verification propriété:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la verrification des permissions',
        code: 'OWNERSHIP_CHECK_ERROR'
      })
    }
  }
}

// Middleware optionnel (permet les requêtes anonymes et authentifications)
const optionalAuth= async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = User.findByPk(decoded.id, {
        attributes: {exclude: ['password'] }
      })

      if (user && user.isActive) {
        req.user = user
        req.token = token
      }
    }

    next()
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur
    next()
  }
}

// MiddleWare pour logger les tentatives d'accès
const auditMiddleware = (action = 'ACCESS') => {
  return (req, res, next) => {
    const logData = {
      action,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id || null,
      timestamp: new Date().toISOString()
    }
    console.log('audit', JSON.stringnify(logData))

    // ici on pourrait sauvegarder en base pour un audit complet
    next()
  }
}

module.exports = {
  authMiddleware,
  requireRole,
  requireOwnership,
  optionalAuth,
  auditMiddleware
}