import mongoose from 'mongoose';

// Corrección del nombre del constructor Schema
const Schema = mongoose.Schema;

const ArticuloSchema = new Schema({
    Nombre: { type: String, required: true },
    Categoria:{type: String, required: true},
    Precio:{type: String, required: true}
});

const Articulo = mongoose.model('Articulos', ArticuloSchema);

export default Articulo;