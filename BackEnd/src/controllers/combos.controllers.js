import { Combos } from "../models/combos.model.js";
import { Productos } from "../models/productos.model.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";







export const getCombos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // valor por defecto
    const skip = (page - 1) * limit;

    const [combos, total] = await Promise.all([
      Combos.find()
        .populate("productos", "nombre")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Combos.countDocuments()
    ]);

    const combosFormateados = combos.map((combo) => ({
      ...combo.toObject(),
      productos: combo.productos.map((producto) => producto.nombre),
    }));

    res.status(200).json({
      data: combosFormateados,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener combos",
      error: error.message
    });
  }
};


export const getComboXId = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de combo no válido" });
  }

  try {
    // const combo = await Combos.findById(id).populate("productos", "nombre");

    // if (!combo) {
    //   return res.status(404).json({ message: "Combo no encontrado" });
    // }

    // const comboFormateado = {
    //   ...combo.toObject(),
    //   productos: combo.productos.map((p) => p.nombre),
    //   foto_combo: combo.foto_combo ? `${url}/${combo.foto_combo}` : null,
    // };

    // res.status(200).json(comboFormateado);
const Combo = await Combos.findById(id)

    if (!Combo) {
      return res.status(404).json({ message: 'Combo no encontrado' });
    }
console.log(Combo);

    res.status(200).json(Combo);

    
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al buscar el combo", error: error.message });
  }
};


export const crearCombo = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      productos: productosIds = [],
      estado,
      dias_disponible,
      restricciones,
      popularidad,
      descuento,
    } = req.body;


    const foto_combo = req.file ? req.file.filename : null;


    if (!productosIds || !Array.isArray(productosIds)) {
      return res.status(400).json({
        message: "El campo productos debe ser un array de IDs válidos",
      });
    }


    if (productosIds.length === 0) {
      return res.status(400).json({
        message: "Debe incluir al menos un producto",
      });
    }

  
    const productos = await Productos.find({
      _id: { $in: productosIds },
    });

 

    const precio_completo = productos.reduce(
      (total, producto) => total + (producto.precio || 0),
      0
    );
    const precio_final = (precio_completo * (1 - descuento / 100)).toFixed(2);


    const nuevoCombo = await Combos.create({
      nombre,
      descripcion,
      productos: productosIds,
      foto_combo,
      estado,
      dias_disponible,
      restricciones,
      popularidad,
      precio_completo,
      precio_final,
      descuento,
    });

    res.status(201).json({
      data: nuevoCombo,
    });

  } catch (error) {
  console.error("Error al crear combo:", error);

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: `Ya existe un combo con el nombre: "${error.keyValue?.nombre}"`,
      error: "COMBO_DUPLICADO",
      duplicateKey: error.keyValue?.nombre
    });
  }

  return res.status(500).json({
    message: "Error del servidor al crear el combo",
    error: error.message,
  });
}

};


export const actualizarCombo = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de combo no válido" });
  }

  try {
    const combo = await Combos.findById(id);
    if (!combo) {
      return res.status(404).json({ message: "Combo no encontrado" });
    }

    const {
      nombre,
      descripcion,
      productos = [],
      estado,
      dias_disponible,
      restricciones,
      popularidad,
      descuento,
    } = req.body;

    let productosIds = productos;
    if (typeof productos === "string") {
      productosIds = productos.split(",");
    }

    const productosEncontrados = await Productos.find({ _id: { $in: productosIds } });
    if (productosIds.length !== productosEncontrados.length) {
      return res.status(400).json({
        message: "Algunos productos no existen",
      });
    }

    const precio_completo = productosEncontrados.reduce(
      (total, p) => total + (p.precio || 0),
      0
    );


    const precio_final = (precio_completo * (1 - descuento / 100)).toFixed(2);

 
    let nuevaImagen = combo.foto_combo;
    if (req.file) {

      if (combo.foto_combo && combo.foto_combo !== "default-combo.png") {
        const rutaAntigua = path.join("src/uploads", combo.foto_combo);
        fs.unlink(rutaAntigua, (err) => {
          if (err) console.error("Error al eliminar imagen anterior:", err.message);
        });
      }
      nuevaImagen = req.file.filename;
    }

 
    const updateData = {
      nombre: nombre || combo.nombre,
      descripcion: descripcion || combo.descripcion,
      productos: productosIds,
      estado: estado || combo.estado,
      dias_disponible:dias_disponible||combo.dias_disponible,
      restricciones:restricciones||combo.restricciones,
      popularidad: popularidad || combo.popularidad,
      foto_combo: nuevaImagen,
      precio_completo: precio_completo,
      precio_final: precio_final,
      descuento: descuento || combo.descuento,
    };

    const comboActualizado = await Combos.findByIdAndUpdate(id, updateData, {  new: true,});

    return res.status(200).json({
      message: "Combo actualizado correctamente",
      data: comboActualizado,
    });

  } catch (error) {
    console.error("Error al actualizar combo:", error);
    res.status(500).json({
      message: "Error al actualizar el combo",
      error: error.message,
    });
  }
};


export const eliminarCombo = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de combo no válido" });
  }

  try {

    const combo = await Combos.findById(id);
    if (!combo) {
      return res.status(404).json({ message: "Combo no encontrado" });
    }

    if (combo.foto_combo && combo.foto_combo !== "default-combo.png") {
      const imagePath = path.join("src/uploads", combo.foto_combo);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("No se pudo eliminar la imagen:", err.message);
        } else {
          console.log("Imagen eliminada:", imagePath);
        }
      });
    }

    await Combos.findByIdAndDelete(id);

    res.status(200).json({
      message: "Combo eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el combo",
      error: error.message,
    });
  }
};