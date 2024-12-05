import mongoose from 'mongoose';

// Corrección del nombre del constructor Schema
const Schema = mongoose.Schema;

const OrdenSchema = new Schema({
    Dia: { type: Date, required: true },
    Pago: { type: Boolean, required: true },
    Hora: { type: String, required: true },
    Articulos: [{ type: Schema.Types.ObjectId, required: true }],
    Total: { type: Number, required: true }
});

const Orden = mongoose.model('Orden', OrdenSchema);

export default Orden;
