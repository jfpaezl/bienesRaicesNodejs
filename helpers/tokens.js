import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: ".env" });

const generarToken = (id) => jwt.sign({id}, process.env.SECRET_KEY,{
    expiresIn: '1d'
});

const generarId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export { 
    generarToken,
    generarId 
};