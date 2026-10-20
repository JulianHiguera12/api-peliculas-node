const db = require('../config/database');

// Obtener todas las medias
const obtenerMedia = (req, res) => {
    const sql = `
        SELECT
            m.id,
            m.serial,
            m.titulo,
            m.sinopsis,
            m.url,
            m.imagen,
            m.fecha_creacion,
            m.fecha_actualizacion,
            m.anio_estreno,
            g.nombre AS genero,
            d.nombres AS director,
            p.nombre AS productora,
            t.nombre AS tipo
        FROM media m
        INNER JOIN generos g ON m.genero_id = g.id
        INNER JOIN directores d ON m.director_id = d.id
        INNER JOIN productoras p ON m.productora_id = p.id
        INNER JOIN tipos t ON m.tipo_id = t.id
    `;

    db.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al consultar la media'
            });
        }

        res.json(resultados);
    });
};

// Obtener una media por ID
const obtenerMediaPorId = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            m.id,
            m.serial,
            m.titulo,
            m.sinopsis,
            m.url,
            m.imagen,
            m.fecha_creacion,
            m.fecha_actualizacion,
            m.anio_estreno,
            g.nombre AS genero,
            d.nombres AS director,
            p.nombre AS productora,
            t.nombre AS tipo
        FROM media m
        INNER JOIN generos g ON m.genero_id = g.id
        INNER JOIN directores d ON m.director_id = d.id
        INNER JOIN productoras p ON m.productora_id = p.id
        INNER JOIN tipos t ON m.tipo_id = t.id
        WHERE m.id = ?
    `;

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al consultar la media'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Media no encontrada'
            });
        }

        res.json(resultados[0]);
    });
};

// Crear una media
const crearMedia = (req, res) => {
    const {
        serial,
        titulo,
        sinopsis,
        url,
        imagen,
        anio_estreno,
        genero_id,
        director_id,
        productora_id,
        tipo_id
    } = req.body;

    const sql = `
        INSERT INTO media
        (
            serial,
            titulo,
            sinopsis,
            url,
            imagen,
            anio_estreno,
            genero_id,
            director_id,
            productora_id,
            tipo_id
        )
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        WHERE EXISTS (
            SELECT 1 FROM generos
            WHERE id = ? AND estado = 'Activo'
        )
        AND EXISTS (
            SELECT 1 FROM directores
            WHERE id = ? AND estado = 'Activo'
        )
        AND EXISTS (
            SELECT 1 FROM productoras
            WHERE id = ? AND estado = 'Activo'
        )
        AND EXISTS (
            SELECT 1 FROM tipos
            WHERE id = ?
        )
    `;

    db.query(
        sql,
        [
            serial,
            titulo,
            sinopsis,
            url,
            imagen,
            anio_estreno,
            genero_id,
            director_id,
            productora_id,
            tipo_id,
            genero_id,
            director_id,
            productora_id,
            tipo_id
        ],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al crear la media'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(400).json({
                    error: 'Los datos relacionados no son válidos o no están activos'
                });
            }

            res.status(201).json({
                mensaje: 'Media creada correctamente',
                id: resultado.insertId
            });
        }
    );
};

// Actualizar una media
const actualizarMedia = (req, res) => {
    const { id } = req.params;

    const {
        serial,
        titulo,
        sinopsis,
        url,
        imagen,
        anio_estreno,
        genero_id,
        director_id,
        productora_id,
        tipo_id
    } = req.body;

    const sql = `
        UPDATE media
        SET
            serial = ?,
            titulo = ?,
            sinopsis = ?,
            url = ?,
            imagen = ?,
            anio_estreno = ?,
            genero_id = ?,
            director_id = ?,
            productora_id = ?,
            tipo_id = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            serial,
            titulo,
            sinopsis,
            url,
            imagen,
            anio_estreno,
            genero_id,
            director_id,
            productora_id,
            tipo_id,
            id
        ],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al actualizar la media'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Media no encontrada'
                });
            }

            res.json({
                mensaje: 'Media actualizada correctamente'
            });
        }
    );
};

// Eliminar una media
const eliminarMedia = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM media WHERE id = ?';

    db.query(sql, [id], (error, resultado) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al eliminar la media'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Media no encontrada'
            });
        }

        res.json({
            mensaje: 'Media eliminada correctamente'
        });
    });
};

module.exports = {
    obtenerMedia,
    obtenerMediaPorId,
    crearMedia,
    actualizarMedia,
    eliminarMedia
};