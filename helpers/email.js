import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: ".env" });

const emailRegistro = async (data) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { name, email, token } = data;
    // enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
            <h1>Confirma tu cuenta</h1>
            <p>Hola ${name}, solo falta un paso para confirmar tu cuenta</p>
            <p>Presiona en el siguiente enlace:</p>
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirm/${token}">Confirmar cuenta</a>
            <p>Si no funciono el enlace copia y pega en tu navegador la siguiente direccion:</p>
        `
    })
}

export {
    emailRegistro
}