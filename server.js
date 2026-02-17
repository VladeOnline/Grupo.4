require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware para parsear JSON (fundamental para recibir datos del cliente)
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB Atlas');

    // Iniciar el servidor solo si la conexión es exitosa
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error de conexión a MongoDB:', error.message);
  });

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API para Flutter activa.');
});

// Aquí se incluirán las rutas de la API (CRUD)
const itemRoutes = require('./routes/itemRoutes');
app.use('/api/items', itemRoutes);
