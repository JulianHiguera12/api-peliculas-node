const express = require('express');
const db = require('./config/database');

const generoRoutes = require('./routes/generoRoutes');
const directorRoutes = require('./routes/directorRoutes');
const productoraRoutes = require('./routes/productoraRoutes');
const tipoRoutes = require('./routes/tipoRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

const app = express();

app.use(express.json());

app.use('/api/generos', generoRoutes);
app.use('/api/directores', directorRoutes);
app.use('/api/productoras', productoraRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/media', mediaRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API REST de Películas funcionando correctamente'
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});