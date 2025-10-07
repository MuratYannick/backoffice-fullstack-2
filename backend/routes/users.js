const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const {
  authMiddleware,
  requireRole,
  auditMiddleware,
} = require("../middlewares/auth");

// Toutes les routes utilisateurs nécessitent une authentification
router.use(authMiddleware);

// Liste des utilisateurs (admin et editor uniquement)
router.get(
  "/",
  requireRole("admin", "editor"),
  auditMiddleware("VIEW_USERS"),
  usersController.getAll
);

// Détail d'un utilisateur
router.get(
  "/:id",
  auditMiddleware("VIEW_USER"),
  async (req, res, next) => {
    const userId = parseInt(req.params.id);

    // Utilisateur peut voir son propre profil
    if (req.user.id === userId) {
      return next();
    }

    // Admin et editor peuvent voir tous les profils
    if (["admin", "editor"].includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Accès refusé à ce profil utilisateur",
    });
  },
  usersController.getById
);

// Création d'utilisateur (admin uniquement)
router.post(
  "/",
  requireRole("admin"),
  auditMiddleware("CREATE_USER"),
  usersController.create
);

// Modification d'utilisateur
router.put(
  "/:id",
  auditMiddleware("UPDATE_USER"),
  async (req, res, next) => {
    const userId = parseInt(req.params.id);

    // Utilisateur peut modifier son propre profil (champs limités)
    if (req.user.id === userId) {
      // Limiter les champs modifiables pour un utilisateur normal
      const allowedFields = ["name", "email"];
      req.body = Object.keys(req.body)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      return next();
    }

    // Admin peut modifier tout
    if (req.user.role === "admin") {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Accès refusé pour modifier cet utilisateur",
    });
  },
  usersController.update
);

// Suppression d'utilisateur (admin uniquement)
router.delete(
  "/:id",
  requireRole("admin"),
  auditMiddleware("DELETE_USER"),
  usersController.delete
);

// Route pour changer le rôle (admin uniquement)
router.patch(
  "/:id/role",
  requireRole("admin"),
  auditMiddleware("CHANGE_USER_ROLE"),
  usersController.changeRole
);

// Route pour désactiver/activer un compte (admin uniquement)
router.patch(
  "/:id/status",
  requireRole("admin"),
  auditMiddleware("CHANGE_USER_STATUS"),
  usersController.toggleStatus
);

module.exports = router;
