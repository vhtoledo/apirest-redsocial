const Publication = require("../models/publication");

// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js"
    });
}

// Guardar publicacion
const save = (req, res) => {

    // Recoger datos del body
    const params = req.body;

    // Si no me llegan dar respuesta negativa
    if(!params.text) return res.status(400).send({status: "error", message: "Debes enviar el texto de la publicación"});

    // Crear y rellenar el objeto del modelo
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;

    // Guardar objeto en base de datos
    newPublication.save()
                  .then((publicationStore) => {
                    if(!publicationStore) {
                        return res.status(404).send({
                            status: "error",
                            message: "No se ha guardado publicación"
                        });
                    }

                    return res.status(200).send({
                        status: "success",
                        message: "Publicación guardad",
                        publicationStore
                    });
                  });

}

// Metodo mostrar publicacion
const detail = (req, res) => {

    // Sacar id de publicacion de la url
    const publicationId = req.params.id;

    // Find con la condicion del id
    Publication.findById(publicationId)
               .then((publicationStore) => {
                 if(!publicationStore){
                    return res.status(404).send({
                        status: "error",
                        message: "No existe la publicacion"
                    });
                 }

                 return res.status(200).send({
                     status: "success",
                     message: "Mostrar publicacion",
                     publication: publicationStore
               })

    });
}

// Eliminar publicacion
const remove = (req, res) => {

    // Sacar el id de la publicacion a eliminar
    const publicacionId = req.params.id;

    // Find y remove
    Publication.find({"user": req.user.id, "_id": publicacionId })
               .findOneAndRemove()
               .then((publicacionRemove) => {
                if(!publicacionRemove){
                    return res.status(404).send({
                        status: "error",
                        message: "No se ha eliminado la publicacion"
                    });
                }
                return res.status(200).send({
                    status: "success",
                    message: "Publicacion eliminada correctamente",
                    publication: publicacionRemove
              });
            });

}

// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove
}