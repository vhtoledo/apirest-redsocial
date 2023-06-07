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
const save = (req, res) => {

    // Conseguir datos por body
    const params = req.body;

    // Sacar el id del usuario identificado
    const identity = req.user;

    // Crear objeto con modelo follow
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    // Guardar objeto en base de datos
    userToFollow.save()
                .then((followStored) => {
                    if(!followStored) {
                        return res.status(404).send({
                            status: "error",
                            message: "No se a podido seguir al usuario"
                        });
                    }

                    return res.status(200).send({
                        status: "success",
                        identity: req.user,
                        follow: followStored
                    });
                })

}

// Acción de borrar un follow (acción dejar de seguir)

// Acción de listado de usuarios que estoy siguiendo

// Acción de listado de usuarios que me siguen

// Exportar acciones
module.exports = {
    pruebaFollow,
    save
}