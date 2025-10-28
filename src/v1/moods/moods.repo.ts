import { prisma } from "@/config/prisma";
import { errorHandler } from "@/utils/util";
import { CreateMoodInput, UpdateMoodInput } from "./moods.validation";
import { MoodLabel } from "@prisma/client";
import { getEmbedding, cosineSimilarity } from "@/utils/ai";
import { randomUUID } from "crypto";

export class MoodsRepo {
  private readonly prisma = prisma;

  async findAll(userId: string, q: { page?: number; limit?: number; search?: string }) {
    return errorHandler(async () => {
      const limit = q.limit ?? 10;
      const page = q.page ?? 1;
      const offset = (page - 1) * limit;

      const params: any[] = [userId];
      let whereSQL = `WHERE "userId" = $1`;

      if (q.search) {
        params.push(`%${q.search}%`);
        whereSQL += ` AND "notes" ILIKE $${params.length}`;
      }

      const data = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          "id", "userId", "date", "moodScore", "moodLabel", "notes", "createdAt", embedding::text AS embedding
        FROM "Mood"
        ${whereSQL}
        ORDER BY "date" DESC
        LIMIT ${limit} OFFSET ${offset};
      `, ...params);

      const totalResult = await this.prisma.$queryRawUnsafe<{ count: number }[]>(`
        SELECT COUNT(*)::int AS count
        FROM "Mood"
        ${whereSQL};
      `, ...params);

      const total = totalResult[0]?.count || 0;

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async findById(id: string) {
    return errorHandler(async () => {
      const result = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          "id", "userId", "date", "moodScore", "moodLabel", "notes", "createdAt", embedding::text AS embedding
        FROM "Mood"
        WHERE "id" = $1
        LIMIT 1;
      `, id);
      return result[0] || null;
    });
  }

  async create(userId: string, data: CreateMoodInput) {
    return errorHandler(async () => {
      const embedding = await getEmbedding(data.notes ?? "");
      const vectorLiteral = `[${embedding.join(",")}]`;
      const dateIso = new Date(data.date).toISOString();
      const id = randomUUID();

      const result = await this.prisma.$queryRawUnsafe<any[]>(`
        INSERT INTO "Mood" 
          ("id", "userId", "date", "moodScore", "moodLabel", "notes", "embedding", "createdAt")
        VALUES (
          $1, $2, $3::timestamp, $4, $5::"MoodLabel", $6, $7::vector, NOW()
        )
        RETURNING 
          "id", "userId", "date", "moodScore", "moodLabel", "notes", "createdAt", embedding::text AS embedding;
      `, id, userId, dateIso, data.moodScore, data.moodLabel, data.notes ?? "", vectorLiteral);

      return result[0];
    });
  }

  async update(id: string, data: UpdateMoodInput) {
    return errorHandler(async () => {
      const embedding = data.notes ? await getEmbedding(data.notes) : undefined;
      const vectorLiteral = embedding ? `[${embedding.join(",")}]` : undefined;

      const result = await this.prisma.$queryRawUnsafe<any[]>(`
        UPDATE "Mood"
        SET 
          "date" = COALESCE($1::timestamp, "date"),
          "moodScore" = COALESCE($2, "moodScore"),
          "moodLabel" = COALESCE($3::"MoodLabel", "moodLabel"),
          "notes" = COALESCE($4, "notes"),
          "embedding" = COALESCE($5::vector, "embedding"),
          "updatedAt" = NOW()
        WHERE "id" = $6
        RETURNING 
          "id", "userId", "date", "moodScore", "moodLabel", "notes", "createdAt", "updatedAt", embedding::text AS embedding;
      `, 
        data.date ? new Date(data.date).toISOString() : null,
        data.moodScore ?? null,
        data.moodLabel ?? null,
        data.notes ?? null,
        vectorLiteral ?? null,
        id
      );

      return result[0];
    });
  }

  async delete(id: string) {
    return errorHandler(async () => {
      const result = await this.prisma.$queryRawUnsafe<any[]>(`
        DELETE FROM "Mood"
        WHERE "id" = $1
        RETURNING 
          "id", "userId", "date", "moodScore", "moodLabel", "notes", "createdAt";
      `, id);
      return result[0];
    });
  }

  async getCosineSimilar(userId: string, embedding: number[], top = 5) {
    return errorHandler(async () => {
      const moods: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT "id", "notes", embedding::text AS embedding, "date"
        FROM "Mood"
        WHERE "userId" = $1;
      `, userId);

      const similarities = moods.map((m) => {
        const emb = m.embedding
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((v: string) => parseFloat(v.trim()));

        return { ...m, similarity: cosineSimilarity(embedding, emb) };
      });

      similarities.sort((a, b) => b.similarity - a.similarity);
      return similarities.slice(0, top);
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
  return errorHandler(async () => {
    const period = options?.period || "month";

    const params: any[] = [userId];
    let whereSQL = `WHERE "userId" = $1`;

    if (options?.moodLabel) {
      params.push(options.moodLabel);
      whereSQL += ` AND "moodLabel" = $${params.length}`;
    }

    if (options?.startDate) {
      params.push(new Date(options.startDate).toISOString());
      whereSQL += ` AND "date" >= $${params.length}::timestamp`;
    }

    if (options?.endDate) {
      params.push(new Date(options.endDate).toISOString());
      whereSQL += ` AND "date" <= $${params.length}::timestamp`;
    }

    const raw = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        date_trunc('${period}', "date") AS period,
        AVG("moodScore") AS avgMood,
        COUNT(*)::int AS count,
        MIN("moodScore") AS minMood,
        MAX("moodScore") AS maxMood
      FROM "Mood"
      ${whereSQL}
      GROUP BY period
      ORDER BY period DESC;
    `, ...params);

    const result = raw.map((r) => ({
      period: new Date(r.period).toISOString(),
      avgMood: Number(r.avgmood ?? r.avgMood),
      minMood: Number(r.minmood ?? r.minMood),
      maxMood: Number(r.maxmood ?? r.maxMood),
      count: Number(r.count),
    }));

    return { period, summary: result };
  });
}


}
