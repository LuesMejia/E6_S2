import { Productos } from "../models/productos.model.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";


 export const getProductosN = async (req, res) => {
  try {


    const productos = await Productos.find();

    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener Productos', error: error.message });
  }
}; 



export const getProductos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;


    const [productos, total] = await Promise.all([
      Productos.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Productos.countDocuments()
    ]);
  

    res.json({ data: productos, total });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener Productos', error: error.message });
  }
}

export const getProductosXId = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de Producto no válido' });
  }

  try {
    const Producto = await Productos.findById(id)

    if (!Producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(Producto);

  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el Producto', error: error.message });
  }
};

export const crearProducto = async (req, res) => {
  try {
    const { nombre, precio, estado, categoria } = req.body;
    const foto_producto = req.file ? req.file.filename : null;

    if (!nombre || !precio || !estado || !categoria) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
        error: "FALTAN_CAMPOS"
      });
    }




    const nuevoProducto = await Productos.create({
      foto_producto,
      nombre,
      precio,
      estado,
      categoria,
    });

    res.status(201).json({
      data: nuevoProducto,
      message: "Producto creado exitosamente"
    });

  } catch (error) {
    console.error("Error al crear Producto:", error);
if (error.code === 11000) {
  return res.status(400).json({ message: 'Ya existe un combo con ese nombre.' });
}

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: "SERVER_ERROR",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const actualizarProducto = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "ID de producto no válido",
      error: "ID_INVALIDO"
    });
  }

  try {
    const { nombre, precio, estado, categoria } = req.body;

    if (!nombre || !precio || !estado || !categoria) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
        error: "FALTAN_CAMPOS"
      });
    }

    // Validar que precio sea número positivo
    if (isNaN(precio) || precio < 0) {
      return res.status(400).json({
        success: false,
        message: "El precio debe ser un número positivo",
        error: "PRECIO_INVALIDO"
      });
    }

    // Buscar producto original
    const productoExistente = await Productos.findById(id);
    if (!productoExistente) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
        error: "NO_ENCONTRADO"
      });
    }

    // Verificar nombre duplicado en otro producto
    const productoDuplicado = await Productos.findOne({
      nombre,
      _id: { $ne: id }
    });
    
    if (productoDuplicado) {
      return res.status(400).json({
        success: false,
        message: `Ya existe otro producto con el nombre: "${nombre}"`,
        error: "PRODUCTO_DUPLICADO",
        duplicateKey: nombre
      });
    }

    let nuevaImagen = productoExistente.foto_producto;

    if (req.file) {
      // Eliminar imagen anterior si existe y no es imagen por defecto
      if (productoExistente.foto_producto && productoExistente.foto_producto !== "default-productoExistente.png") {
        const rutaAntigua = path.join("src/uploads", productoExistente.foto_producto);
        fs.unlink(rutaAntigua, (err) => {
          if (err) console.error("Error al eliminar imagen anterior:", err.message);
        });
      }
      nuevaImagen = req.file.filename;
    }

    const updateData = {
      foto_producto: nuevaImagen,
      nombre,
      precio,
      estado,
      categoria,
    };

    const productoActualizado = await Productos.findByIdAndUpdate(id, updateData, { new: true });

    if (!productoActualizado) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado después de actualización",
        error: "NO_ENCONTRADO"
      });
    } console.log(productoActualizado);

    return res.status(200).json({
      data: productoActualizado,
      message: "Producto actualizado exitosamente"
    });

   
    
  } catch (error) {
    console.error("Error al actualizar producto:", error);

    if (error.code === 11000) {
      const keyValue = error.keyValue?.nombre || 'el nombre proporcionado';
      return res.status(400).json({
        success: false,
        message: `Ya existe un producto con ${keyValue}`,
        error: "PRODUCTO_DUPLICADO",
        duplicateKey: error.keyValue?.nombre
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Error de validación: " + Object.values(error.errors).map(val => val.message).join(', '),
        error: "VALIDACION_FALLIDA"
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de producto no válido",
        error: "ID_INVALIDO"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al actualizar el producto",
      error: "SERVER_ERROR",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const eliminarProducto = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de Productos no válido" });
  }
  try {
   const Producto = await Productos.findById(id);
    if (!Producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }



    if (Producto.foto_producto && Producto.foto_producto !== "default-Producto.png") {
          const imagePath = path.join("src/uploads", Producto.foto_producto);
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error("No se pudo eliminar la imagen:", err.message);
            } else {
              console.log("Imagen eliminada:", imagePath);
            }
          });
        }


     await Productos.findByIdAndDelete(id);
 
     res.status(200).json({
       message: "Producto eliminado correctamente",
     })
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el Productos",
      error: error.message,
    });
  }
};