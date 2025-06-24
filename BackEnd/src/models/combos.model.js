import { Schema, model } from "mongoose";
import { Productos } from "../models/productos.model.js";

const comboSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del combo es obligatorio"],
      trim: true,
      unique: true,
    },
    descripcion: {
      type: String,
      required: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    productos: {
      type: [Schema.Types.ObjectId],
      ref: "Productos",
      validate: {
        validator: async function (ids) {
          const count = await Productos.countDocuments({ _id: { $in: ids } });
          return count === ids.length;
        },
        message: "Uno o más productos no existen en la base de datos",
      },
      required: true,
    },
    foto_combo: {
      type: String,
      default: "default-combo.png",
      match: [/\.(png|jpg|jpeg|webp)$/i, "Solo imágenes con extensión válida"],
       required: true,
    },
    estado: {
      type: String,
      required: true,
    },
    dias_disponible: {
      type: String,
      required: true,
    },

    restricciones: {
      type: String,
      default: "Ninguna",
    },

    popularidad: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    precio_completo: {
      type: Number,
      required: true,
      min: 0,
    },
    precio_final: {
      type: Number,
      validate: {
        validator: function (value) {
          return value <= this.precio_completo;
        },
        message: "El precio final no puede ser mayor al precio completo",
      },
    },
    descuento: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual para obtener el % de descuento calculado
comboSchema.virtual("descuento_porcentaje").get(function () {
  return (
    ((this.precio_completo - this.precio_final) / this.precio_completo) *
    100
  ).toFixed(2);
});

export const Combos = model("Combos", comboSchema);
