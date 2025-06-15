import express from "express";
import {
  handleRefreshToken,
  LoginUser,
  LogoutUser,
  RegisterUser,
} from "../controllers/identity.controller";

const router = express.Router();

router.post("/register", RegisterUser);
router.post("/login", LoginUser); // Assuming LoginUser is also handled by RegisterUser for simplicity
router.post("/refresh-token", handleRefreshToken);
router.post("/logout", LogoutUser);

export default router;
