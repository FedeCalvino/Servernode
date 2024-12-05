import express from 'express';
import Articulo from '../models/Articulo.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const arrayArticulosDb = await Articulo.find();
        console.log("server");
        console.log(arrayArticulosDb);
        res.json(arrayArticulosDb); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Ruta POST para agregar un nuevo artículo
router.post('/', async (req, res) => {
    try {
        const { nombre, Precio, Categoria } = req.body;  // Extraer datos del cuerpo de la solicitud

        // Validar que todos los campos estén presentes
        if (!nombre || !numero || !ingredientes) {
            return res.status(400).send('Todos los campos son obligatorios');
        }

        // Crear un nuevo artículo usando el modelo
        const nuevoArticulo = new Articulo({
            nombre,
            numero,
            ingredientes,
            Categoria,
            Precio
        });

        // Guardar el nuevo artículo en la base de datos
        const articuloGuardado = await nuevoArticulo.save();

        // Devolver el artículo guardado como respuesta
        res.status(201).json(articuloGuardado); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;  
        const { nombre, numero, ingredientes } = req.body;

        // Validar que todos los campos estén presentes
        if (!nombre || !numero || !ingredientes) {
            return res.status(400).send('Todos los campos son obligatorios');
        }

        // Buscar y actualizar el artículo
        const articuloActualizado = await Articulo.findByIdAndUpdate(
            id,  // El ID del documento que queremos actualizar
            { nombre, numero, ingredientes },  // Los nuevos datos
            { new: true }  // Esta opción devuelve el documento actualizado
        );

        // Si no se encuentra el artículo
        if (!articuloActualizado) {
            return res.status(404).send('Artículo no encontrado');
        }

        // Responder con el artículo actualizado
        res.status(200).json(articuloActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error del servidor');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;  // Obtener el ID del documento de los parámetros de la URL

        // Buscar y eliminar el artículo
        const articuloEliminado = await Articulo.findByIdAndDelete(id);

        // Si no se encuentra el artículo
        if (!articuloEliminado) {
            return res.status(404).send('Artículo no encontrado');
        }

        // Responder con un mensaje de éxito
        res.status(200).send('Artículo eliminado con éxito');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error del servidor');
    }
});

export default router; // Exporta el enrutador
