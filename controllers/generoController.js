const db = require('../config/database');

// Obtener todos los géneros
const obtenerGeneros = (req, res) => {
    const sql = 'SELECT * FROM generos';

    db.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al consultar los géneros'
            });
        }

        res.json(resultados);
    });
};

// Obtener un género por ID
const obtenerGeneroPorId = (req, res) => {
    const { id } = req.params;

    const sql = 'SELECT * FROM generos WHERE id = ?';

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al consultar el género'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Género no encontrado'
            });
        }

        res.json(resultados[0]);
    });
};

// Crear un género
const crearGenero = (req, res) => {
    const { nombre, estado, descripcion } = req.body;

    const sql = `
        INSERT INTO generos (nombre, estado, descripcion)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [nombre, estado || 'Activo', descripcion],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al crear el género'
                });
            }

            res.status(201).json({
                mensaje: 'Género creado correctamente',
                id: resultado.insertId
            });
        }
    );
};

// Actualizar un género
const actualizarGenero = (req, res) => {
    const { id } = req.params;
    const { nombre, estado, descripcion } = req.body;

    const sql = `
        UPDATE generos
        SET nombre = ?, estado = ?, descripcion = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [nombre, estado, descripcion, id],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al actualizar el género'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Género no encontrado'
                });
            }

            res.json({
                mensaje: 'Género actualizado correctamente'
            });
        }
    );
};

// Eliminar un género
const eliminarGenero = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM generos WHERE id = ?';

    db.query(sql, [id], (error, resultado) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al eliminar el género'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Género no encontrado'
            });
        }

        res.json({
            mensaje: 'Género eliminado correctamente'
        });
    });
};

module.exports = {
    obtenerGeneros,
    obtenerGeneroPorId,
    crearGenero,
    actualizarGenero,
    eliminarGenero
};