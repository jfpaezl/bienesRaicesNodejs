import { check, validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import { generarId, generarToken } from '../helpers/tokens.js';
import bcrypt from 'bcrypt';
import { emailRegistro, olvidePassword } from '../helpers/email.js';


const formularioLogion = (req, res) => {
    res.render('auth/login',{
        pagina : 'Iniciar sesion',
        csrfToken: req.csrfToken()
    });
}

const authenticate = async (req, res) => {
    await check('email').isEmail().withMessage('El email es obligatorio').run(req);
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req);
    let resoults = validationResult(req);
    
    // verificar que el resultado no este vacio
    console.log(req.body.password, req.body.repetir_password);
    if(!resoults.isEmpty()){
        return res.render('auth/login',{
            pagina : 'Iniciar sesion',
            errores: resoults.array(),
            csrfToken: req.csrfToken(),
        });
    }

    // comprobar si el usuario existe
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({where: {email}});
    if(!usuario){
        return res.render('auth/login',{
            pagina : 'Iniciar sesion',
            errores: [{msg: 'El usuario no existe'}],
            csrfToken: req.csrfToken(),
        });
    }

    // confirmar si el usuario esta confirmado
    if(!usuario.confirm){
        return res.render('auth/login',{
            pagina : 'Iniciar sesion',
            errores: [{msg: 'El usuario no esta confirmado'}],
            csrfToken: req.csrfToken(),
        });
    }
    
    // verificar el password
    if(!bcrypt.compareSync(password, usuario.password)){
        return res.render('auth/login',{
            pagina : 'Iniciar sesion',
            errores: [{msg: 'El password es incorrecto'}],
            csrfToken: req.csrfToken(),
        });
    }

    // autenticar el usuario
    const token = generarToken(usuario.id);
    
    // almacenar en un co

    return res.cookie('_token', token, {
        httpOnly: true,

    }).redirect('/mis-propiedades');
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
        pagina : 'Confirmar cuenta',
        msj: 'La cuenta se ha confirmado correctamente'
    });
}

const formularioOlvidepassword = (req, res) => {
    res.render('auth/recover',{
        pagina : 'Recuperar cuenta',
        csrfToken: req.csrfToken(),
    });
}

const resetPassword = async (req, res) => {
    // validacion de campos
    await check('email').isEmail().withMessage('El email es obligatorio').run(req);

    let resoults = validationResult(req);

    // verificar que el resultado no este vacio
    console.log(req.body.password, req.body.repetir_password);
    if(!resoults.isEmpty()){
        return res.render('auth/recover',{
            pagina : 'Recuperar tu acceso a Bienes raices',
            errores: resoults.array(),
            csrfToken: req.csrfToken(),
        });
    }

    // Buscar al usuario
    const usuario = await Usuario.findOne({where: {email: req.body.email}});
    if(!usuario){
        return res.render('auth/recover',{
            pagina : 'Recuperar tu acceso a Bienes raices',
            errores: [{msg: 'El email no esta registrado'}],
            csrfToken: req.csrfToken(),
        });
    }
    
    //generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save();

    // enviar email de confirmacion
    olvidePassword({
        name: usuario.name,
        email: usuario.email,
        token: usuario.token
    });

    res.render('templates/mensaje',{
        pagina : 'Restablecer contraseña',
        mensaje: 'Hemos enviado un email de confirmacion preciona en el enlace',
        csrfToken: req.csrfToken(),
    });

}

const comporbarToken = async (req, res) => {
    const { token } = req.params;
    // verificar que el usuario existe
    const usuario = await Usuario.findOne({where: {token}});
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina : 'Restablecer contraseña',
            msj: 'Hubo un error al restablecer la contraseña',
            error: true,
            csrfToken: req.csrfToken(),
        });
    }
    res.render('auth/reset-password',{
        pagina : 'Restablecer contraseña',
        csrfToken: req.csrfToken(),
    });
}

const newpassword = async (req, res) => {
    // validacion de campos
    await check('password').isLength({min: 6}).withMessage('La contraseña debe tener al menos 6 caracteres').run(req);
    await check('repetir_password').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }).run(req);
    let resoults = validationResult(req);
    
    // verificar que el resultado no este vacio
    console.log(req.body.password, req.body.repetir_password);
    if(!resoults.isEmpty()){
        return res.render(`auth/recover`,{
            pagina : 'Restablecer contraseña',
            errores: resoults.array(),
            csrfToken: req.csrfToken(),
        });
    }
    const { token } = req.params;
    const { password } = req.body;

    // Buscar al usuario
    const usuario = await Usuario.findOne({where: {token}});

    //generar un token y enviar el email
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt) ;
    usuario.token = null;
    await usuario.save();

    res.render('auth/confirmar-cuenta',{
        pagina : 'Iniciar sesion',
        msj: 'Contraseña restablecida correctamente',
        csrfToken: req.csrfToken(),
    });

}

export {
    formularioLogion,
    authenticate,
    formularioRegistro,
    register,
    confirmar,
    formularioOlvidepassword,
    resetPassword,
    comporbarToken,
    newpassword
}   