import express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import usersRoutes from './routes/usuariosRoutes.js';
import db from './config/db.js';

// crear el app de express
const app = express();


// leer los datos del body
app.use(express.urlencoded({ extended: true }));

// Habilitar cookie-parser
app.use(cookieParser());

// Habilitar csurf
app.use(csurf({ cookie: true}));

// conectar a la base de datos
try {
    await db.authenticate();
    db.sync();
    console.log('Database connected');
} catch (e) {
    console.log(e);
}

// Habilitar pug
app.set('view engine', 'pug');
app.set('views', './views');

// carpeta publica
app.use(express.static('public'));

// middleware
app.use('/auth', usersRoutes);

// puerto
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port localhost:${port}`);
});