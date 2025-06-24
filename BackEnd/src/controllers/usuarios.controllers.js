import { Usuarios } from "../models/usuarios.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from "mongoose";

export const getUsuarios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

       const [usuarios, total] = await Promise.all([
         Usuarios.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
         Usuarios.countDocuments()
       ]);
     
   
       res.json({ data: usuarios, total });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener usuario", error: error.message });
  }
};

export const getUsuarioXId = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID del Usuario no válido" });
  }

  try {
    const Usuario = await Usuarios.findById(id);

    if (!Usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(Usuario);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al buscar el Usuario", error: error.message });
  }
};

export const postUsuario = async (req, res) => {
    const { usuario, contrasenia, rol, estado } = req.body;

    try {
        // Validación de campos requeridos
        if (!usuario || !contrasenia || !rol || !estado) {
            return res.status(400).json({
                message: 'Todos los campos son requeridos: usuario, contrasenia, rol'
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuarios.findOne({ usuario });
        if (usuarioExistente) {
            return res.status(400).json({
                message: 'El nombre de usuario ya está en uso'
            });
        }

        // Hash de la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);

        // Crear nuevo usuario
        const nuevoUsuario = new Usuarios({
            usuario,
            estado,
            contrasenia: hashedPassword, // Guardamos la contraseña hasheada
            rol
        });

        // Guardar en la base de datos
        const usuarioGuardado = await nuevoUsuario.save();

        // Respondemos sin enviar la contraseña (ni siquiera hasheada)
        const usuarioResponse = usuarioGuardado.toObject();
        delete usuarioResponse.contrasenia;

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario: usuarioResponse
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            message: 'Error interno del servidor al crear usuario'
        });
    }
};



export const putUsuario = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "ID de usuario no válido",
      error: "ID_INVALIDO"
    });
  }

  try {
    const { usuario, rol, estado } = req.body;

    if (!usuario || !rol || !estado) {
      return res.status(400).json({
        message: 'Los campos usuario, rol y estado son requeridos'
      });
    }

    // Buscar usuario actual para obtener contraseña hasheada
    const usuarioActual = await Usuarios.findById(id);
    if (!usuarioActual) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el nombre de usuario ya está en uso por otro
    const usuarioExistente = await Usuarios.findOne({ usuario, _id: { $ne: id } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso por otro usuario' });
    }


    // Preparar datos a actualizar
    const updateData = {
      usuario,
  
      rol,
      estado
    };

    const usuarioActualizado = await Usuarios.findByIdAndUpdate(id, updateData, { new: true });

    const usuarioResponse = usuarioActualizado.toObject();
    delete usuarioResponse.contrasenia;

    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioResponse
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      message: 'Error interno del servidor al actualizar usuario'
    });
  }
};


export const deleteUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const usuarioEliminado = await Usuarios.findByIdAndDelete(id);

        if (!usuarioEliminado) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            message: 'Error interno del servidor al eliminar usuario'
        });
    }
};

export const loginUsuario = async (req, res) => {
  try {
    const { usuario, contrasenia } = req.body;

    // Validación de campos
    if (!usuario || !contrasenia) {
      return res.status(400).json({
        message: "Usuario y contraseña son obligatorios",
      });
    }

    // Buscar usuario en la base de datos
    const usuarioEncontrado = await Usuarios.findOne({ usuario });
    
    if (!usuarioEncontrado) {
      return res.status(401).json({
        message: "Credenciales inválidas", // Mensaje genérico por seguridad
      });
    }

    // Comparar contraseña hasheada
    const contraseniaValida = await bcrypt.compare(
      contrasenia, 
      usuarioEncontrado.contrasenia
    );

    if (!contraseniaValida) {
      return res.status(401).json({
        message: "Credenciales inválidas", // Mismo mensaje que arriba
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: usuarioEncontrado._id, 
        rol: usuarioEncontrado.rol 
      }, 
      process.env.JWT_SECRET || 'secreto_por_defecto',
      { expiresIn: '24h' }
    );

    // Respuesta exitosa (sin datos sensibles)
    res.json({
      message: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuarioEncontrado._id,
        nombre: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol,
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      message: "Error al iniciar sesión",
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};