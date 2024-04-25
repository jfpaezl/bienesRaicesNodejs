import express from 'express';
import { body } from 'express-validator';
import { admin, crear, guardar, agregarImagen, almacenarImagen } from '../controllers/propiedadController.js';
import protegerRuta from '../middleware/ProtegerRuta.js';
import upload from '../middleware/subirArchivo.js';

const router = express.Router();

router.get('/mis-propiedades', protegerRuta, admin);
router.get('/propiedades/crear', protegerRuta, crear);
router.post('/propiedades/crear', 
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo es obligatorio'),
    body('descripcion').notEmpty().isLength({max: 200}).withMessage('La descripcion es obligatorio'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un precio'),
    body('estacionamiento').isNumeric().withMessage('Selecciona una cantidad de estacionamientos'),
    body('habitaciones').isNumeric().withMessage('Selecciona una cantidad de habitaciones'),
    body('wc').isNumeric().withMessage('Selecciona una cantidad de baños'),
    body('lat').notEmpty().withMessage('Selecciona una ubicacion en el mapa'),
    guardar
);
router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen);
router.post('/propiedades/agregar-imagen/:id', 
    protegerRuta,
    upload.single('imagen'),   
    almacenarImagen
);

export default router;