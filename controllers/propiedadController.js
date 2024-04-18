import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad } from '../models/index.js';

const admin = (req, res) => {
    res.render('propiedades/admin', {
        pagina: 'Mis propiedades',
        barra: true,
    });
}

const crear = async (req, res) => {
    // Consultar Modelo de precio y Categorias
    const [precios, categorias] = await Promise.all([
        Precio.findAll(),
        Categoria.findAll()
    ]);
    res.render('propiedades/crear', {
        pagina: 'Crear propiedad',
        barra: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    });
}

const guardar = async (req, res) => {
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        // Consultar el modelo de precio y categorias
        const [precios, categorias] = await Promise.all([
            Precio.findAll(),
            Categoria.findAll()
        ]);

        return res.render('propiedades/crear', {
            pagina: 'Crear propiedad',
            barra: true,
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }
    // crear un registro
    const { titulo, descripcion, habitaciones,estacionamiento, wc, calle, lat, lng, precio, categoria } = req.body;
    const { id: usuarioId } = req.usuario;
    try {
        const propiedadGruardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId: precio,
            categoriaId: categoria,
            usuarioId,
            imagen: ''
        });

        const { id } = propiedadGruardada;

        res.redirect(`/propiedades/agregar-imagen/${id}`);

    } catch (error) {
        console.log(error);
    }
}

export {
    admin,
    crear,
    guardar
}