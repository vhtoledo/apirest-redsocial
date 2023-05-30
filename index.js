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
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);


// Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor de node corriendo en el puerto:", puerto);
});