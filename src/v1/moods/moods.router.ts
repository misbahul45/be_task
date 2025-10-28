import { Router } from "express";
import { MoodsHandler } from "./moods.handler";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { Validation } from "@/middlewares/validation.middleware";
import { CreateMoodSchema, UpdateMoodSchema } from "./moods.validation";

const router = Router();
const handler = new MoodsHandler();

router.use(authMiddleware);

router.get("/", authMiddleware, handler.findAll);
router.get("/summary", authMiddleware,handler.getSummary);
router.get("/similar", authMiddleware,handler.getMostSimilar);
router.get("/:id", authMiddleware,handler.findById);
router.post("/", authMiddleware,Validation(CreateMoodSchema),handler.create);
router.put("/:id", authMiddleware, Validation(UpdateMoodSchema),handler.update);
router.delete("/:id", authMiddleware,handler.delete);
router.post("/ask", authMiddleware,handler.askMoodAI);

export default router;
