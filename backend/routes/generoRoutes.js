const express = require('express');

const router = express.Router();

const {
    obtenerGeneros,
    obtenerGeneroPorId,
    crearGenero,
    actualizarGenero,
    eliminarGenero
} = require('../controllers/generoController');

// GET /api/generos
router.get('/', obtenerGeneros);

// GET /api/generos/:id
router.get('/:id', obtenerGeneroPorId);

// POST /api/generos
router.post('/', crearGenero);

// PUT /api/generos/:id
router.put('/:id', actualizarGenero);

// DELETE /api/generos/:id
router.delete('/:id', eliminarGenero);

module.exports = router;