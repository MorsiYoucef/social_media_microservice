import express from "express";
import AuthController from "../controllers/identity.controller";
import { validateToken } from "../middlewares/auth.middleware";
const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login); // Assuming LoginUser is also handled by RegisterUser for simplicity
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.get("/users",validateToken , AuthController.getAllUsers)

export default router;
