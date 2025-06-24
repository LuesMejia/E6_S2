import { Schema, model } from 'mongoose';

const productosSchema = new Schema({
  foto_producto: {
      type: String,
      default: "default-producto.png",
      match: [/\.(png|jpg|jpeg|webp)$/i, "Solo imágenes con extensión válida"],
       required: true,
    },
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    unique: true
  },
  precio: {
    type: Number,

    min: [0, 'El precio no puede ser negativo'],
    get: (value) => parseFloat(value.toFixed(2)),
    required: [true, 'El precio del producto es obligatorio'],
  },
  estado: {
    type: String,
    required: [true, 'El estado del producto es obligatorio'],
    enum: {
      values: ['Activo', 'Inactivo', 'Agotado'],
      message: 'Estado no válido. Usa: Activo, Inactivo o Agotado'
    },
    default: 'Activo'
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: {
      values: ['Pizza', 'Bebida', 'Postre', 'Entrada', 'Complemento','Hamburgesa','Principal'],
      message: 'Categoría no válida'
    },
    index: true
  },

}, {
  timestamps: true,
  toJSON: { getters: true }
});


export const Productos = model('Productos', productosSchema); 