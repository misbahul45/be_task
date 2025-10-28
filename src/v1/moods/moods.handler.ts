import { Request, Response } from "express";
import { errorHandler } from "@/utils/util";
import { Responder } from "@/utils/response";
import { MoodsService } from "./moods.service";
import { CreateMoodInput, UpdateMoodInput } from "./moods.validation";
import { getEmbedding } from "@/utils/ai";
import { ChatService } from "./chat.service";

export class MoodsHandler {
  private readonly moodsService = new MoodsService();
  private readonly chatService = new ChatService();

  findAll = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const userId = req.user?.id!;
      const query = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: req.query.search as string,
      };
      const { data, meta } = await this.moodsService.findAll(userId, query);
      return Responder.success(res, "Successfully fetched moods", data, meta);
    });
  };

  findById = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { id } = req.params;
      const data = await this.moodsService.findById(id);
      return Responder.success(res, "Successfully fetched mood", data);
    });
  };

  create = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const userId = req.user?.id!;
      const body = req.body as CreateMoodInput;
      const data = await this.moodsService.create(userId, body);
      return Responder.success(res, "Mood created successfully", data);
    });
  };

  update = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { id } = req.params;
      const body = req.body as UpdateMoodInput;
      const data = await this.moodsService.update(id, body);
      return Responder.success(res, "Mood updated successfully", data);
    });
  };

  delete = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { id } = req.params;
      const data = await this.moodsService.delete(id);
      return Responder.success(res, "Mood deleted successfully", data);
    });
  };

  getSummary = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const userId = req.user?.id!;
      const period = req.query.period as "week" | "month" | "year";
      const data = await this.moodsService.getSummary(userId, period);
      return Responder.success(res, "Mood summary fetched successfully", data);
    });
  };

  getMostSimilar = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const userId = req.user?.id!;
      const q = req.query.q;
      const embedding = (await getEmbedding(q as string)) as number[];
      const data = await this.moodsService.getMostSimilarMood(userId, embedding);
      return Responder.success(res, "Most similar moods fetched successfully", data);
    });
  };

  askMoodAI = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const userId = req.user?.id!;
      const q = req.query.q as string;
      if (!q) return Responder.error(res, "Query 'q' is required");
      const aiResponse = await this.chatService.analyzeUserMoodHistory(userId, q);
      return Responder.success(res, "AI mood insight generated successfully", {
        question: q,
        response: aiResponse,
      });
    });
  };
}
