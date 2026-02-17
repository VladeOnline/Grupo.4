const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    // Nombre que será usado en Flutter
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Descripción que Flutter puede actualizar
    description: {
        type: String,
        required: false
    },
    // Fecha de creación (se añade automáticamente)
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Item', itemSchema);
