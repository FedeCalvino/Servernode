import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Carga las variables de entorno

const app = express();

const port = 3034;
const API_KEY = 'AIzaSyBM0sHfeIbIpxU9GIngLxl0x86zNCAXdWk';

app.use(cors());

const User = "Conecction";
const Pass = "12345";
const Url = `mongodb+srv://${User}:${Pass}@pakerika.wamla.mongodb.net/Empanada?retryWrites=true&w=majority&appName=PakeRika`;

app.use(express.json());

async function connectAndListCollections() {
    try {
        await mongoose.connect(Url);
        console.log('Conectada a la base de datos correctamente');
    } catch (error) {
        console.error('Error en la conexión a la base de datos o al obtener colecciones:', error);
    }
}

connectAndListCollections();

const Articulo = mongoose.model('Articulo', new mongoose.Schema({
    Nombre: { type: String },
    Categoria: { type: String },
    Precio: { type: String },
    StockColonia: { type: Number },
    StockRivera: { type: Number }
}), 'Articulos');

const Orden = mongoose.model('Orden', new mongoose.Schema({
    Dia: { type: Date },
    Pago: { type: String },
    Hora: { type: String },
    Articulos: [{
        Nombre: { type: String },
        Categoria: { type: String },
        Precio: { type: String },
        cantidad: { type: Number }
    }],
    Total: { type: Number },
    Local: { type: String }
}), 'Ordenes');

app.get('/articulosAll', async (req, res) => {
    try {
        const articulos = await Articulo.find();
        console.log("Articulos desde el backend:", articulos);  // Agrega este log
        res.json(articulos);
    } catch (error) {
        console.error('Error al obtener articulos:', error);  // Agrega un log de errores
        res.status(500).json({ message: error.message });
    }
});

app.put('/ordenes/addlocales', async (req, res) => {
    try {

        const resultado = await Orden.updateMany(
            {},
            { $set: { Local: "Colonia" } },
            { strict: false }
        );

        res.json({
            message: '',
            modifiedCount: resultado.modifiedCount
        });
    } catch (error) {
        console.error('', error);
        res.status(500).json({ message: error.message });
    }
});

app.put('/productos/updateStock/:id', async (req, res) => {
    try {
        const { id } = req.params; // Obtener el id del producto desde la URL
        const { stockRivera, stockColonia } = req.body; // Obtener los nuevos valores de stock desde el cuerpo de la solicitud

        // Validación de los valores de stock
        if (typeof stockRivera !== 'number' || typeof stockColonia !== 'number') {
            return res.status(400).json({ message: 'Los valores de stock deben ser números' });
        }

        // Verificar que los valores de stock no sean nulos o indefinidos
        if (stockRivera === undefined || stockColonia === undefined) {
            return res.status(400).json({ message: 'Los valores de stock son obligatorios' });
        }

        const productoActualizado = await Articulo.findByIdAndUpdate(
            id,
            {
                $set: {
                    StockRivera: stockRivera,
                    StockColonia: stockColonia,
                },
            },
            { new: true }
        );

        if (!productoActualizado) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({
            message: 'Stock actualizado correctamente',
            producto: productoActualizado,
        });
    } catch (error) {
        console.error('Error al actualizar stock:', error);
        res.status(500).json({ message: error.message });
    }
});


app.get('/ordenesAll', async (req, res) => {
    try {
        const articulos = await Orden.find();
        console.log("serverr")
        res.json(articulos);
    } catch (error) {
        console.error('Error al obtener articulos:', error);  // Agrega un log de errores
        res.status(500).json({ message: error.message });
    }
});
const UpdateStock = async (orden, res) => {
    try {
        let stockField = "";
        if (orden.Local === "Colonia") {
            stockField = "StockColonia";
        } else if (orden.Local === "Rivera") {
            stockField = "StockRivera";
        }

        const actualizaciones = await Promise.all(
            orden.Articulos.map(async (art) => {
                return await Articulo.findByIdAndUpdate(
                    art._id,
                    {
                        $inc: {
                            [stockField]: -art.cantidad,
                        },
                    },
                    { new: true }
                );
            })
        );
    } catch (error) {
 
    }
};


app.post('/SaveOrder', async (req, res) => {
    console.log("Request body:", req.body);
    try {
        const { Dia, Pago, Hora, Articulos, Total, Local } = req.body;

        // Validación básica
        if (!Dia || !Pago || !Hora || !Articulos || !Total || !Local) {
            return res.status(400).json({ message: "Faltan datos necesarios para guardar la orden" });
        }

        // Crear nueva orden
        const nuevaOrden = new Orden({
            Dia,
            Pago,
            Hora,
            Articulos,
            Total,
            Local,
        });

        console.log("Nueva orden creada:", nuevaOrden);

        const ordenGuardada = await nuevaOrden.save();
        console.log("Orden guardada en la base de datos:", ordenGuardada);

        try {
            await UpdateStock(ordenGuardada);
        } catch (errorStock) {
            console.error("Error al actualizar el stock:", errorStock);
            return res.status(500).json({ 
                message: "La orden fue guardada, pero hubo un error al actualizar el stock",
                orden: ordenGuardada,
                error: errorStock.message,
            });
        }

        res.status(201).json({
            message: "Orden guardada y stock actualizado correctamente",
            orden: ordenGuardada,
        });
    } catch (error) {
        console.error("Error al guardar la orden:", error); // Log de error
        res.status(500).json({ message: "Error al guardar la orden", error: error.message });
    }
});


app.post('/SaveEmp', async (req, res) => {
    try {
        const { Nombre, Precio, Categoria,StockRivera,StockColonia } = req.body;  // Extraer datos del cuerpo de la solicitud

        // Validar que todos los campos estén presentes
        if (!Nombre || !Precio || !Categoria) {
            return res.status(400).send('Todos los campos son obligatorios');
        }

        // Crear un nuevo artículo usando el modelo
        const nuevoArticulo = new Articulo({
            Nombre,
            Precio,
            Categoria,
            StockRivera,
            StockColonia
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




app.listen(port, () => {
    console.log(`Servidor funcionando en el puerto ${port}`);
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});
