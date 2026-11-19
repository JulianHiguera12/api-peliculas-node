const express = require('express');
const router = express.Router();

const {
    obtenerMedia,
    obtenerSiguienteSerial,
    obtenerMediaPorId,
    crearMedia,
    actualizarMedia,
    eliminarMedia
} = require('../controllers/mediaController');

router.get('/', obtenerMedia);
router.get('/siguiente-serial', obtenerSiguienteSerial);
router.get('/:id', obtenerMediaPorId);
router.post('/', crearMedia);
router.put('/:id', actualizarMedia);
router.delete('/:id', eliminarMedia);

module.exports = router;