import { check, validationResult } from 'express-validator';
import Usuario from '../models/usuario.js';
import { generarId } from '../helpers/tokens.js';
import { emailRegistro } from '../helpers/email.js';

const formularioLogion = (req, res) => {
    res.render('auth/login',{
        pagina : 'Iniciar sesion',
        csrfToken: req.csrfToken()
    });
}

const formularioRegistro = (req, res) => {
    res.render('auth/register',{
        pagina : 'Crear cuenta',
        csrfToken: req.csrfToken()
    });
}
const register = async (req, res) => {
    // validacion de campos
    await check('name').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('email').isEmail().withMessage('El email es obligatorio').run(req);
    await check('password').isLength({min: 6}).withMessage('La contraseña debe tener al menos 6 caracteres').run(req);
    await check('repetir_password').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }).run(req);
    let resoults = validationResult(req);
    console.log(resoults);
    // verificar que el resultado no este vacio
    console.log(req.body.password, req.body.repetir_password);
    if(!resoults.isEmpty()){
        return res.render('auth/register',{
            pagina : 'Crear cuenta',
            errores: resoults.array(),
            csrfToken: req.csrfToken(),
            usuario:{
                name: req.body.name,
                email: req.body.email,
            }
        });
    }
    const existeEmail = await Usuario.findOne({where: {email: req.body.email}});
    if(existeEmail){
        return res.render('auth/register',{
            pagina : 'Crear cuenta',
            errores: [{msg: 'El email ya esta registrado'}],
            csrfToken: req.csrfToken(),
            usuario:{
                name: req.body.name,
                email: req.body.email,
            }
        });
    }

    const usuario = await Usuario.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        token: generarId(),
    });

    // enviar email de confirmacion
    emailRegistro({
        name: usuario.name,
        email: usuario.email,
        token: usuario.token
    });

    res.render('templates/mensaje',{
        pagina : 'Hemos enviado un email de confirmacion preciona en el enlace',
        mensaje: 'Usuario creado correctamente'
    });
    
}

const confirmar = async (req, res) => {
    const { token } = req.params;
    // verificar que el usuario existe
    const usuario = await Usuario.findOne({where: {token}});
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina : 'Error al confirmar cuenta',
            msj: 'El usuario no existe',
            error: true
        });
    }
    // confirmar el usuario
    usuario.confirm = true;
    usuario.token = null;

    await usuario.save();
    res.render('auth/confirmar-cuenta',{
        pagina : 'Error al confirmar cuenta',
        msj: 'La cuenta se ha confirmado correctamente'
    });
}
const formularioOlvidepassword = (req, res) => {
    res.render('auth/recover',{
        pagina : 'Recuperar cuenta'
    });
}

export {
    formularioLogion,
    formularioRegistro,
    register,
    confirmar,
    formularioOlvidepassword
}   