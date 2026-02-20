// routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Item = require('../models/Item');

// Helper: validar ObjectId (evita 500 por ids inválidos)
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. CREATE (Crear un nuevo ítem)
router.post('/', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * 2. READ ALL (Obtener todos los ítems) - v2 MEJORADO
 * Query params:
 *  - page (default 1)
 *  - limit (default 10, max 100)
 *  - q (búsqueda por texto en campos name/title/description si existen)
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const skip = (page - 1) * limit;

    const q = (req.query.q || '').trim();

    // Filtro: búsqueda simple (ajusta campos según tu modelo)
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Item.countDocuments(filter)
    ]);

    res.json({
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. READ ONE (Obtener un ítem por ID)
router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Ítem no encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. UPDATE (Actualizar un ítem)
router.put('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) return res.status(404).json({ message: 'Ítem no encontrado para actualizar' });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. DELETE (Eliminar un ítem)
router.delete('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Ítem no encontrado para eliminar' });
    res.json({ message: 'Ítem eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;