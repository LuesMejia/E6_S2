import jwt from 'jsonwebtoken';
import { Usuarios } from '../models/usuarios.model.js';

export const verificarAdmin = async (req, res, next) => {
  try {
 
    const token = req.headers['authorization'];
    
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación. Inicie Sesión Primero' });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto');
    

    const usuario = await Usuarios.findById(decoded.id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

   
    if (usuario.rol !== 'Administrador') {
      return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }

   
    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(500).json({ message: 'Error de autenticación', error: error.message });
  }
};