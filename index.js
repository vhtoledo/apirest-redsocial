// Importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

// Menejsae bienvenida
console.log("API NODE RED SOCIAL run")

// Conexion a database
connection();

// Crear servidor node
const app = express();
const puerto = 3900;

// Configurar cors
app.use(cors());

// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Cargar conf rutas

// Rutas 
app.get("/ruta-prueba", (req, res) => {

    return res.status(200).json(
        {
            "id": 1,
            "nombre": "victor",
            "web": "victortoledo.com.ar"
        }
    );
})

// Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor de node corriendo en el puerto:", puerto);
});