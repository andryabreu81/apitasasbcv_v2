import { Router } from "express";

//importamos las funciones o metodos desde el controlador
import {
  getValoresBCV,
} from "../controllers/tasas.controllers.js";

const router = Router();

// grupo de rutas que invocan las funciones en el controlador

// obtener tipos de reclamos
router.get("/apitasasbcv/getValoresBCV", getValoresBCV);


// exporta las rutas
export default router;