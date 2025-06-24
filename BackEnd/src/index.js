import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import CombosRouters from "./routes/combos.routes.js";
import ProductosRouters from "./routes/productos.routes.js";
import UsuariosRouters from "./routes/usuarios.routes.js";

configDotenv();
const app = express();
const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use(CombosRouters);
app.use(ProductosRouters);
app.use(UsuariosRouters);
app.use("/uploads", express.static("src/uploads"));

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, clientOptions);
    console.log("🟢 Conectado a MongoDB");
  } catch (error) {
    console.error("🔴 Error al conectar a MongoDB", error);
    process.exit(1);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
