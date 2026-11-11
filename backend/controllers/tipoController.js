const db = require('../config/database');

// Obtener todos los tipos
const obtenerTipos = (req, res) => {
    const sql = 'SELECT * FROM tipos';

    db.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al consultar los tipos'
            });
        }

        res.json(resultados);
    });
};

// Obtener un tipo por ID
const obtenerTipoPorId = (req, res) => {
    const { id } = req.params;

    const sql = 'SELECT * FROM tipos WHERE id = ?';

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al consultar el tipo'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Tipo no encontrado'
            });
        }

        res.json(resultados[0]);
    });
};

// Crear un tipo
const crearTipo = (req, res) => {
    const { nombre, descripcion } = req.body;

    const sql = `
        INSERT INTO tipos (nombre, descripcion)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [nombre, descripcion],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al crear el tipo'
                });
            }

            res.status(201).json({
                mensaje: 'Tipo creado correctamente',
                id: resultado.insertId
            });
        }
    );
};

// Actualizar un tipo
const actualizarTipo = (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const sql = `
        UPDATE tipos
        SET nombre = ?, descripcion = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [nombre, descripcion, id],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al actualizar el tipo'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Tipo no encontrado'
                });
            }

            res.json({
                mensaje: 'Tipo actualizado correctamente'
            });
        }
    );
};

// Eliminar un tipo
const eliminarTipo = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM tipos WHERE id = ?';

    db.query(sql, [id], (error, resultado) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al eliminar el tipo'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Tipo no encontrado'
            });
        }

        res.json({
            mensaje: 'Tipo eliminado correctamente'
        });
    });
};

module.exports = {
    obtenerTipos,
    obtenerTipoPorId,
    crearTipo,
    actualizarTipo,
    eliminarTipo
};