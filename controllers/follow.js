// Importar Modelo
const Follow = require("../models/follow");
const User = require("../models/user");

// Importar servicio
const followService = require("../services/followService");

// Importar dependencias 
const mongoosePaginate = require("mongoose-pagination");


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
          .populate("user followed", "-password -role -__v -email")
          .paginate(page, itemsPerPage)
          .then(async(follows) => {
            if(!follows){
                return res.status(404).send({
                    status: "error",
                    message: "No sigues a nadie"
                });
            }

            //Listado de usuarios
            // Sacar un array de ids de los usuarios que me siguen y de los que sigo
            let followsUserIds = await followService.followsUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                message: "Listado siguiendo",
                follows,
                user_following: followsUserIds.following,
                user_follow_me: followsUserIds.followers
            });
          })

}

// Acción listado de usuarios que siguen a cualquier usuario (soy seguido, mis seguidores)
const followers = (req, res) => {

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
    Follow.find({"followed": userId})
          .populate("user", "-password -role -__v -email")
          .paginate(page, itemsPerPage)
          .then(async(follows) => {
            if(!follows){
                return res.status(404).send({
                    status: "error",
                    message: "No sigues a nadie"
                });
            }

            let followsUserIds = await followService.followsUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                message: "Listado siguiendo",
                follows,
                user_following: followsUserIds.following,
                user_follow_me: followsUserIds.followers
            });
          });
}

// Exportar acciones
module.exports = {
    save, 
    unfollow,
    following,
    followers
}