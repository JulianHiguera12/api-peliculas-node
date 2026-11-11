const db = require('../config/database');

// Obtener todos los directores
const obtenerDirectores = (req, res) => {
    const sql = 'SELECT * FROM directores';

    db.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al consultar los directores'
            });
        }

        res.json(resultados);
    });
};

// Obtener un director por ID
const obtenerDirectorPorId = (req, res) => {
    const { id } = req.params;

    const sql = 'SELECT * FROM directores WHERE id = ?';

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al consultar el director'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Director no encontrado'
            });
        }

        res.json(resultados[0]);
    });
};

// Crear un director
const crearDirector = (req, res) => {
    const { nombres, estado } = req.body;

    const sql = `
        INSERT INTO directores (nombres, estado)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [nombres, estado || 'Activo'],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al crear el director'
                });
            }

            res.status(201).json({
                mensaje: 'Director creado correctamente',
                id: resultado.insertId
            });
        }
    );
};

// Actualizar un director
const actualizarDirector = (req, res) => {
    const { id } = req.params;
    const { nombres, estado } = req.body;

    const sql = `
        UPDATE directores
        SET nombres = ?, estado = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [nombres, estado, id],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al actualizar el director'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Director no encontrado'
                });
            }

            res.json({
                mensaje: 'Director actualizado correctamente'
            });
        }
    );
};

// Eliminar un director
const eliminarDirector = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM directores WHERE id = ?';

    db.query(sql, [id], (error, resultado) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al eliminar el director'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Director no encontrado'
            });
        }

        res.json({
            mensaje: 'Director eliminado correctamente'
        });
    });
};

module.exports = {
    obtenerDirectores,
    obtenerDirectorPorId,
    crearDirector,
    actualizarDirector,
    eliminarDirector
};