import express from 'express';

import { 
    formularioLogion, 
    formularioRegistro, 
    formularioOlvidepassword, 
    confirmar,
    register } 
from '../controllers/userController.js';

const router = express.Router();

router.get('/login', formularioLogion);

router.get('/register', formularioRegistro);
router.post('/register', register);

router.get('/recover', formularioOlvidepassword);

router.get('/confirm/:token', confirmar)
export default router;