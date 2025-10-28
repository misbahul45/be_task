import { MoodsRepo } from "./moods.repo";
import { CreateMoodInput, UpdateMoodInput } from "./moods.validation";
import { errorHandler } from "@/utils/util";
import { AppError, AppErrorCode } from "@/utils/error";
import { cosineSimilarity } from "@/utils/ai";

export class MoodsService {
  private readonly moodsRepo = new MoodsRepo();

  async findAll(userId: string, query: { page?: number; limit?: number; search?: string }) {
    return errorHandler(async () => {
      return this.moodsRepo.findAll(userId, query);
    });
  }

  async findById(id: string) {
    return errorHandler(async () => {
      const mood = await this.moodsRepo.findById(id);
      if (!mood) throw new AppError("Mood not found", 404, AppErrorCode.NOT_FOUND);
      return mood;
    });
  }

  async create(userId: string, body: CreateMoodInput) {
    return errorHandler(async () => {
      const mood = await this.moodsRepo.create(userId, body);
      return { message: "Mood created successfully", data: mood };
    });
  }

  async update(id: string, body: UpdateMoodInput) {
    return errorHandler(async () => {
      const mood = await this.moodsRepo.update(id, body);
      return { message: "Mood updated successfully", data: mood };
    });
  }

  async delete(id: string) {
    return errorHandler(async () => {
      const mood = await this.moodsRepo.delete(id);
      return { message: "Mood deleted successfully", data: mood };
    });
  }

  async getSummary(userId: string, period: "week" | "month" | "year") {
    return errorHandler(async () => {
      return this.moodsRepo.getSummary(userId, { period });
    });
  }

  async getMostSimilarMood(userId: string, embedding: number[]) {
    return errorHandler(async () => {
      const moods = await this.moodsRepo.findAll(userId, { limit: 10 });
      let mostSimilar: { mood: any; score: number } | null = null;

      for (const mood of moods.data) {
        if (mood?.embedding) {
          const score = cosineSimilarity(embedding, mood.embedding);
          if (!mostSimilar || score > mostSimilar.score) {
            mostSimilar = { mood, score };
          }
        }
      }

      if (!mostSimilar)
        throw new AppError("No mood with embeddings found", 404, AppErrorCode.NOT_FOUND);

      return mostSimilar;
    });
  }
}
