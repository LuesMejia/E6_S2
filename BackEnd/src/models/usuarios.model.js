import { Schema, model } from "mongoose";

const UsuariosSchema = new Schema(
  {
    usuario: {
      type: String,
      required: true,
    },
    contrasenia: {
      type: String,
    },
    rol: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    estado: {
      type: String,
      required: [true, "El estado del usuario es obligatorio"],
      enum: {
        values: ["Activo", "Inactivo"],
        message: "Estado no válido. Usa: Activo o Inactivo ",
      },
      default: "Activo",
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);


export const Usuarios = model("Usuarios", UsuariosSchema);
