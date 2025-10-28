import { Router } from "express";
import { UsersHandler } from "./users.handler";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { Validation } from "@/middlewares/validation.middleware";
import { CreateUserSchema, UpdateUserSchema } from "./users.validation";

const router = Router();
const handler = new UsersHandler();

router.get("/", authMiddleware, handler.getAll);
router.get("/:id", authMiddleware, handler.getById);
router.post("/", authMiddleware, Validation(CreateUserSchema), handler.create);
router.put("/:id", authMiddleware, Validation(UpdateUserSchema), handler.update);
router.delete("/:id", authMiddleware, handler.delete);

export default router;
