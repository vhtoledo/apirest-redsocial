// Importar Modelo
const Follow = require("../models/follow");
const User = require("../models/user");

// Importar dependencias 
const mongoosePaginate = require("mongoose-pagination");

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
const unfollow = (req, res) => {

    // Recoger el id del usuario identificado
    const userId = req.user.id;

    // Recoger el id del usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id;

    // Find de las coincidencias y hacer remove
    Follow.find({"user": userId,"followed": followedId})
          .findOneAndRemove()
          .then((followDelete) => {
            if(!followDelete){
                return res.status(404).send({
                    status: "error",
                    message: "No has dejado de seguir a nadie"
                });
            }
            return res.status(200).send({
                status: "success",
                message: "Follow eliminado correctamente",

            });
          })

}

// Acción listado de usuarios que cualquier usuario está siguiendo (siguiendo)
const following = (req, res) => {

    // Sacar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega el id por parametro en url
    if(req.params.id) userId = req.params.id;

    // Comprobar si me llega la pagina, si no la pagina 1
    let page = 1;

    if(req.params.page) page = req.params.page;

    // Usuarios por pagina quiero mostrar
    const itemsPerPage = 5;

    // Find a follow, popular datos de los usuarios y paginar con mongoose paginate
    Follow.find({"user": userId})
          .populate("user followed", "-password -role -__v")
          .paginate(page, itemsPerPage)
          .then((follows) => {
            if(!follows){
                return res.status(404).send({
                    status: "error",
                    message: "No sigues a nadie"
                });
            }

            

            return res.status(200).send({
                status: "success",
                message: "Listado siguiendo",
                follows
            });
          })

}

// Acción listado de usuarios que siguen a cualquier usuario (soy seguido, mis seguidores)
const followers = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Listado siguen",
    });
}

// Exportar acciones
module.exports = {
    pruebaFollow,
    save, 
    unfollow,
    following,
    followers
}