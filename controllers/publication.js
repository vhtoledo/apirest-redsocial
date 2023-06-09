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

// Exportar acciones
module.exports = {
    pruebaPublication,
    save
}