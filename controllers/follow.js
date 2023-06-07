// Importar Modelo
const Follow = require("../models/follow");
const User = require("../models/user");

// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/follow.js"
    });
}

// Acción de guardar un follow (acción seguir)

// Acción de borrar un follow (acción dejar de seguir)

// Acción de listado de usuarios que estoy siguiendo

// Acción de listado de usuarios que me siguen

// Exportar acciones
module.exports = {
    pruebaFollow
}