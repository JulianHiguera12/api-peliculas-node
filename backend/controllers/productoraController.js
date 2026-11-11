const db = require('../config/database');

// Obtener todas las productoras
const obtenerProductoras = (req, res) => {
    const sql = 'SELECT * FROM productoras';

    db.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al consultar las productoras'
            });
        }

        res.json(resultados);
    });
};

// Obtener una productora por ID
const obtenerProductoraPorId = (req, res) => {
    const { id } = req.params;

    const sql = 'SELECT * FROM productoras WHERE id = ?';

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al consultar la productora'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Productora no encontrada'
            });
        }

        res.json(resultados[0]);
    });
};

// Crear una productora
const crearProductora = (req, res) => {
    const { nombre, estado, slogan, descripcion } = req.body;

    const sql = `
        INSERT INTO productoras
        (nombre, estado, slogan, descripcion)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [nombre, estado || 'Activo', slogan, descripcion],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al crear la productora'
                });
            }

            res.status(201).json({
                mensaje: 'Productora creada correctamente',
                id: resultado.insertId
            });
        }
    );
};

// Actualizar una productora
const actualizarProductora = (req, res) => {
    const { id } = req.params;
    const { nombre, estado, slogan, descripcion } = req.body;

    const sql = `
        UPDATE productoras
        SET nombre = ?, estado = ?, slogan = ?, descripcion = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [nombre, estado, slogan, descripcion, id],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al actualizar la productora'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Productora no encontrada'
                });
            }

            res.json({
                mensaje: 'Productora actualizada correctamente'
            });
        }
    );
};

// Eliminar una productora
const eliminarProductora = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM productoras WHERE id = ?';

    db.query(sql, [id], (error, resultado) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al eliminar la productora'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Productora no encontrada'
            });
        }

        res.json({
            mensaje: 'Productora eliminada correctamente'
        });
    });
};

module.exports = {
    obtenerProductoras,
    obtenerProductoraPorId,
    crearProductora,
    actualizarProductora,
    eliminarProductora
};