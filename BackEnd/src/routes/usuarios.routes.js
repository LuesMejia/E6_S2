import express from "express";
const router = express.Router();
import {
  getUsuarios,
  getUsuarioXId,
  postUsuario,
  putUsuario,
  deleteUsuario,
  loginUsuario,
} from "../controllers/usuarios.controllers.js";
import { verificarAdmin } from "../middlewares/Autenticar.js";

router.get("/Usuarios", getUsuarios);
router.get("/Usuarios/:id", getUsuarioXId);
router.post("/Usuarios", verificarAdmin, postUsuario);
router.put("/Usuarios/:id", verificarAdmin, putUsuario);
router.delete("/Usuarios/:id", verificarAdmin, deleteUsuario);


router.post("/login", loginUsuario);

export default router;
