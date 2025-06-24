import express from "express";
const router = express.Router();
import {
  getProductos,
  getProductosN,
  getProductosXId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../controllers/productos.controllers.js";
import { verificarAdmin } from "../middlewares/Autenticar.js";
import { upload } from "../middlewares/upload.js";


router.get("/ProductosSelect", getProductosN);
router.get("/Productos", getProductos);
router.get("/Productos/:id", getProductosXId);

router.post("/Productos", verificarAdmin, upload.single("foto_producto"), crearProducto);
router.put("/Productos/:id", verificarAdmin, upload.single("foto_producto"), actualizarProducto);
router.delete("/Productos/:id", verificarAdmin,eliminarProducto);
export default router;
