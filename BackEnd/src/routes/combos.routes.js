import express from "express";
const router = express.Router();
import {
  getCombos,
  getComboXId,
  crearCombo,
  actualizarCombo,
  eliminarCombo,
} from "../controllers/combos.controllers.js";
import { upload } from "../middlewares/upload.js";
import { verificarAdmin } from "../middlewares/Autenticar.js";

router.get("/Combos", getCombos);
router.get("/Combos/:id", getComboXId);
router.post("/Combos", verificarAdmin, upload.single("foto_combo"), crearCombo);
router.put("/Combos/:id", verificarAdmin,upload.single("foto_combo"), actualizarCombo);
router.delete("/Combos/:id",verificarAdmin,  eliminarCombo);

export default router;
