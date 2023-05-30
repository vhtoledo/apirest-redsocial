// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const User = require("../models/user");

// Registro de usuarios
const register = async (req, res) => {

    // Recoger datos de la peticion
    let params = req.body;

    // Comprobar que me llegan bien los datos y validar
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    // Control usuarios duplicados
    try {
        const existingUsers = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        }).exec();
 
        if (existingUsers && existingUsers.length >= 1) {
            return res.status(200).send({
                status: "success",
                messague: "El usuario ya existe"
            });
        }

        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10); 
        params.password = pwd;

        // crear objeto de usuario
        let usersave = new User(params);
 
        // Guardar usuario en la base de datos
        usersave
        .save()
        .then((userStored) => {
          return res.status(200).json({
            status: "success",
            user: userStored,
            mensaje: "Usuario creado con exito",
          });
        })
        .catch((error) => {
            return res.status(400).json({
              status: "error",
              mensaje: "No se ha guardado el usuario: " + error.message,
            });
        });
 
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            messague: "Error en la consulta de usuarios"
        });
    }
}

// Exportar acciones
module.exports = {
    register
}