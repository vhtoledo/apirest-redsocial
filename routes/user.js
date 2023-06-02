const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const check = require("../middlewares/auth");

// Definir rutas
router.get("/prueba-usuario", check.auth, UserController.pruebaUser)
router.post("/register", check.auth, UserController.register);
router.post("/login", UserController.login);

// Exportar router
module.exports = router;