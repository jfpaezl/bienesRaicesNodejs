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

const agregarImagen = async (req, res) => {

    const { id } = req.params;

    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        res.redirect('/mis-propiedades');
    }
    // validar que la propiedad no este publicada 
    if (propiedad.publicada) {
        res.redirect('/mis-propiedades');
    }
    // validar que la propiedad pertenezca al usuario
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        res.redirect('/mis-propiedades');
    }
    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    });
}

const almacenarImagen = async (req, res, next) => {
    const { id } = req.params;
    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        res.redirect('/mis-propiedades');
    }
    // validar que la propiedad no este publicada 
    if (propiedad.publicada) {
        res.redirect('/mis-propiedades');
    }
    // validar que la propiedad pertenezca al usuario
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        res.redirect('/mis-propiedades');
    }
    // validar que se haya subido una imagen
    if (!req.file) {
        res.redirect(`/propiedades/agregar-imagen/${id}`);
    }
    // almacenar la imagen
    try {
        propiedad.imagen = req.file.filename;
        propiedad.publicado = true;
        await propiedad.save();
        next();
    } catch (error) {
        console.log(error);
    }
}
export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen
}