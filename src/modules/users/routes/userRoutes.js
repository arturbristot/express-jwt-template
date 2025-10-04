import express from "express";
import { authenticateToken, authorizeRoles } from "../../../shared/middleware/authMiddlewares.js";
import UserController from "../controllers/userController.js";

const router = express.Router();
const userController = new UserController();

/* POST - Criar usuário (público) */
router.post("/", userController.createUser);

/* GET - Listar todos (apenas admin) */
/* router.get("/all", 
    authenticateToken, 
    authorizeRoles('admin'), 
    userController.getAllUsers
); */

/* GET - Buscar por ID (autenticado) */
router.get("/:id", authenticateToken, userController.getUserById);

/* PUT - Atualizar (autenticado) */
router.put("/:id", authenticateToken, userController.updateUser);

export default router;