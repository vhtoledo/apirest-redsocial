// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// Importar modelos
const User = require("../models/user");

// Importar servicios
const jwt = require("../services/jwt");


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

const login = (req, res) => {

    // Recoger parametros body
    let params = req.body

    if (!params.email || !params.password){
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }

    // Buscar el base de datos si existe
    User.findOne({email: params.email})
        //.select({"password": 0})
        .then((user) => {
            // si no existe el usuario
            if(!user){
                return res.status(404).send({
                    status: "error",
                    message: "No se ha encontrado el usuario",
                });
            }

            // Comprobar contraseña
            const pwd = bcrypt.compareSync(params.password, user.password);

            if(!pwd){
                return res.status(400).send({
                    status: "error",
                    message: "No te has identificado correctamente"
                });
            }

            // Conseguir Token
            const token = jwt.createToken(user);

            // Devolver Datos del Usuario
            return res.status(200).json({
                status: "success",
                mensaje: "Identificado correctamente",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token
              });
        });
}

const profile = (req, res) => {
    // Recibir el paramtro del id de usuario por la url
    const id = req.params.id;

    // Consulta para sacar los datos del usuario
    User.findById(id)
        .select({password: 0, role: 0})
        .then((userProfile) => {
            if(!userProfile){
                return res.status(404).send({
                    status: "error",
                    message: "El usuario no existe o hay un error"
                })
            }

            // Devolver el restulado 
            // Posteriormente: devolver informacion follows
            return res.status(200).json({
                status: "success",
                user: userProfile
            });
        });
}

const list = (req, res) => {
    // Controlar en que pagina estamos
    let page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    page = parseInt(page);

    // Consulta con mongoose paginate
    let itemsPerPage = 5;

    User.find()
        .sort('_id')
        .paginate(page, itemsPerPage)
        .then((users, total) => {
            if(!users) {
                return res.status(404).send({
                    status: "error",
                    message: "No hay usuarios disponibles"
                });
            }

            // Devolver el resultado (posteriormente info follow)
            return res.status(200).json({
                status: "success",
                users,
                page,
                itemsPerPage,
                total,
                page: Math.ceil(total/itemsPerPage)
            });
        });

}

const update = async (req, res) => {
    // Recoger info del usuario actualizar
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    // Control usuarios duplicados
    try {
        const users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        }).exec();

        let userIsset = false;
        users.forEach(user => {
            if(user && user._id != userIdentity.id) userIsset = true;
        })
 
        if (userIsset) {
            return res.status(200).send({
                status: "success",
                messague: "El usuario ya existe"
            });
        }

        // Cifrar la contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10); 
            userToUpdate.password = pwd;
        }

        // Buscar y actualizar
        User.findByIdAndUpdate(userIdentity.id, userToUpdate, {new:true})
            .then((userUpdate) => {
                if(!userUpdate) {
                    return res.status(404).send({
                        status: "error",
                        message: "No se a podido actualizar"
                    });
                }

                return res.status(200).send({
                    status:"success",
                    message: "Metodo actualizar usuario",
                    user: userUpdate
                });
            })

    } catch (error) {
        return res.status(500).json({
            status: "Error",
            messague: "Internal server error"
        });
    }
}

// metodo subir imagen
const upload = (req, res) => {

    // Recoger el fichero de imagen y comprobar que existe
    if(!req.file){
        return res.status(404).send({
            status: "error",
            message: "Petición no incluye la imagen"
        });
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];
    
    // Comprobar extension
    if(extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif"){

        // Borrar archivo subido
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);
        // Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "Extensión del fichero inválida"
        });
    }

    // Si es correcta, guardar imagen en base de datos
    User.findByIdAndUpdate(req.user.id, {image: req.file.filename}, {new:true})
        .then((userUpdate) => {
            if(!userUpdate) {
                return res.status(500).send({
                    status: "error",
                    message: "Error en la subida de avatar"
                });
            }


            return res.status(200).send({
                status:"success",
                user: userUpdate,
                file: req.file,
            });
        });
}

// Metodo mostrar avatar
const avatar = (req, res) => {

    // Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/avatars/"+file;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {

        if(!exists){
            return res.status(404).send({
                status: "error", 
                message: "No existe la imagen"
            });
        } 
        
        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    });

}


// Exportar acciones
module.exports = {
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}