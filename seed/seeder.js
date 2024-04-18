import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./usuarios.js";
import {Categoria, Precio, Usuario} from "../models/index.js"
import db from "../config/db.js";

const importarDatos = async () => {
    try {
        // Autenticar
        await db.authenticate();
        // Generar las columnas de la tabla
        await db.sync()
        // Insertar los datos
        /**
         * esta sintaxis es cuando un paso depende del otro y se ejecutan en orden
         * 
         * await Categoria.bulkCreate(categorias);
         * await Precio.bulkCreate(precios);
         */

        /**
         * esta sintaxis es cuando los pasos no dependen uno del otro y se ejecutan en paralelo
         * await Promise.all([Categoria.bulkCreate(categorias), Precio.bulkCreate(precios)]);
         */
        await Promise.all([
            Categoria.bulkCreate(categorias), 
            Precio.bulkCreate(precios), 
            Usuario.bulkCreate(usuarios)
        ]);
        process.exit(0); // Salir del proceso y el proceso fue exitoso
    } catch (error) {
        console.log(error);
        process.exit(1); // Salir del proceso y el proceso fue fallido
    }
}

const eliminarDatos = async () => {
    try {
        await db.authenticate();
        await db.sync();
        /**
         * esta sintaxis es cuando un paso depende del otro y se ejecutan en orden
         * 
         * await Promise.all([Categoria.destroy(categorias), Precio.destroy(precios)]);
         */

        await db.sync({ force: true });
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

if(process.argv[2] === "-i") {
    importarDatos();
}
if(process.argv[2] === "-e") {
    eliminarDatos();
}

// "db:importar": "node ./seed/seeder.js -i"
