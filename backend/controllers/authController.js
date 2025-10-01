const { User, sequelize } = require('../models')

const authController = {
  // POST /api/auth/register - Inscription
  register: async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
      const {name, email, password, role = 'author' } = req.body

      // Création de l'utilisateur (le hook before va hasher le password)
      const user = await User.create({
        name,
        email,
        password,
        role
      }, { transaction })
      
      await transaction.commit()

      // Générer le JWT

      const token = User.generateJWT()

      // Réponse sans le mot de passe
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      }
      
      res.status(201).json({
        success: true,
        message: 'Compte créé avec succès',
        user: userResponse,
        token
      })
    } catch (error) {
      await transaction.rollback()
      console.error('Erreur inscription:', error)

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        })
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du compte'
      })
    }
  },

  // Post api/auth/login - connexion
  login: async (req, res) => {
    try {
      const { email, password } = req.body

      // Récupérer l'utilisateur avec le mot de passe
      const user = await User.findOne({
        where: { email }
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        })
      }

      // Verifier si le compte est actif
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Compte désactivé'
        })
      }

      // Comparer le mot de passe
      const isPasswordValid = await user.comparePassword(password)

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        })
      }

      // générer le JWT
      const token = user.generateJWT()

      // Réponse sans le mot de passe
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive, 
        emailVerified: user.emailVerified
      }

      res.json({
        success: true,
        message: 'connexion réussie',
        user: userResponse,
        token
      })
    } catch (error) {
      console.error('Erreur connexion:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion'
      })
    }
  },

  // GET /api/auth/me - profil utilisateur
  me: async (req, res) => {
    try {
      // req.user est defini par le middleware authMiddleware
      const user = await user.findByPk(req.user.id, {
        attributes: { exclude: ['password']}
      })
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        })
      }

      res.json({
        success: true,
        data: user
      })
    } catch (error) {
      console.error('Erreur récupération profil:', error)
      res.status(500).json({
        success: false,
        message: 'Erreurs lors de la récupération du profil'
      })
    }
  }
}

module.exports=authController