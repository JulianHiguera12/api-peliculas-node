const express = require('express');

const router = express.Router();

const {
    obtenerDirectores,
    obtenerDirectorPorId,
    crearDirector,
    actualizarDirector,
    eliminarDirector
} = require('../controllers/directorController');

// GET /api/directores
router.get('/', obtenerDirectores);

// GET /api/directores/:id
router.get('/:id', obtenerDirectorPorId);

// POST /api/directores
router.post('/', crearDirector);

// PUT /api/directores/:id
router.put('/:id', actualizarDirector);

// DELETE /api/directores/:id
router.delete('/:id', eliminarDirector);

module.exports = router;