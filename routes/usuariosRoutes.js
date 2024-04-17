import express from 'express';

import { 
    formularioLogion, 
    authenticate,
    formularioRegistro, 
    formularioOlvidepassword, 
    confirmar,
    register,
    resetPassword,
    newpassword,
    comporbarToken
} 
from '../controllers/userController.js';

const router = express.Router();

router.get('/login', formularioLogion);
router.post('/login', authenticate);

router.get('/register', formularioRegistro);
router.post('/register', register);

router.get('/recover', formularioOlvidepassword);
router.post('/recover', resetPassword);

//Almacena el nuevo password
router.get('/recover/:token', comporbarToken)
router.post('/recover/:token', newpassword)

router.get('/confirm/:token', confirmar)
export default router;