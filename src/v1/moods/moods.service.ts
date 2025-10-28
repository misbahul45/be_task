import { MoodsRepo } from "./moods.repo";
import { CreateMoodInput, UpdateMoodInput } from "./moods.validation";
import { errorHandler } from "@/utils/util";
import { AppError, AppErrorCode } from "@/utils/error";
import { cosineSimilarity } from "@/utils/ai";
import { ChatService } from "./chat.service";
import { ServiceResponse } from "@/types/app.type";
import { MoodLabel } from "@prisma/client";

export class MoodsService {
  private readonly moodsRepo = new MoodsRepo();
  private readonly chatService = new ChatService();

  async findAll(userId: string, query: { page?: number; limit?: number; search?: string }) {
    return errorHandler<ServiceResponse>(async () => {
      const result = await this.moodsRepo.findAll(userId, query);
      return {
        message: "Moods fetched successfully",
        data: result.data,
        meta: result.meta,
      };
    });
  }

  async findById(id: string) {
    return errorHandler<ServiceResponse>(async () => {
      const mood = await this.moodsRepo.findById(id);
      if (!mood) throw new AppError("Mood not found", 404, AppErrorCode.NOT_FOUND);

      return {
        message: "Mood fetched successfully",
        data: mood,
      };
    });
  }

  async create(userId: string, body: CreateMoodInput) {
    return errorHandler<ServiceResponse>(async () => {
      const newMood = await this.moodsRepo.create(userId, body);
      return {
        message: "Mood created successfully",
        data: newMood,
      };
    });
  }

  async update(id: string, body: UpdateMoodInput) {
    return errorHandler<ServiceResponse>(async () => {
      const existingMood = await this.moodsRepo.findById(id);
      if (!existingMood) throw new AppError("Mood not found", 404, AppErrorCode.NOT_FOUND);

      const updatedMood = await this.moodsRepo.update(id, body);
      return {
        message: "Mood updated successfully",
        data: updatedMood,
      };
    });
  }

  async delete(id: string) {
    return errorHandler<ServiceResponse>(async () => {
      const existingMood = await this.moodsRepo.findById(id);
      if (!existingMood) throw new AppError("Mood not found", 404, AppErrorCode.NOT_FOUND);

      await this.moodsRepo.delete(id);
      return {
        message: "Mood deleted successfully",
      };
    });
  }


  async getSummary(
    userId: string,
    options?: {
      period?: "day" | "week" | "month" | "year";
      startDate?: string | Date;
      endDate?: string | Date;
      moodLabel?: MoodLabel;
    }
  ) {
    return errorHandler<ServiceResponse>(async () => {
      const summary = await this.moodsRepo.getSummary(userId, options);

      const context = JSON.stringify(summary, null, 2);

      const period = options?.period || "month";
      const labelInfo = options?.moodLabel ? ` untuk mood ${options.moodLabel}` : "";

      const question = `Buat ringkasan yang menggambarkan kondisi emosi pengguna${labelInfo} berdasarkan data berikut selama periode ${period}.
Berikan insight reflektif, empatik, dan mudah dimengerti dalam Bahasa Indonesia.`;

      const aiResponse = await this.chatService.chat(
        userId,
        `${question}\n\nContext:\n${context}`
      );

      // Pastikan hasilnya selalu string (kadang bisa array dari ChatGroq)
      const aiMessage = Array.isArray(aiResponse)
        ? aiResponse.map((x: any) => (typeof x === "string" ? x : x.text || "")).join(" ")
        : String(aiResponse);

      return {
        message: aiMessage,
        data: summary,
      };
    });
  }

  async getMostSimilarMood(userId: string, embedding: number[]) {
    return errorHandler<ServiceResponse>(async () => {
      const moods = await this.moodsRepo.findAll(userId, { limit: 1000 });
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

      return {
        message: "Most similar mood found successfully",
        data: mostSimilar.mood,
        meta: { similarityScore: mostSimilar.score },
      };
    });
  }
}
