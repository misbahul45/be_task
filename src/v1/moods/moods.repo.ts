import { prisma } from "@/config/prisma";
import { errorHandler } from "@/utils/util";
import { CreateMoodInput, UpdateMoodInput } from "./moods.validation";
import { MoodLabel } from "@prisma/client";
import { getEmbedding, cosineSimilarity } from "@/utils/ai";

export class MoodsRepo {
  private readonly prisma = prisma;

    async findAll(
        userId: string,
        q: { page?: number; limit?: number; search?: string }
    ) {
        const limit = q.limit || 10;
        const page = q.page || 1;
        const offset = (page - 1) * limit;

        return errorHandler(async () => {
            const whereClauses: string[] = [`"userId"='${userId}'`];

            if (q.search) {
                const escapedSearch = q.search.replace(/'/g, "''");
                whereClauses.push(`"notes" ILIKE '%${escapedSearch}%'`);
            }

            const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

            const data = await this.prisma.$queryRawUnsafe<any[]>(`
                SELECT "id", "userId", "date", "moodScore", "moodLabel", "notes", "createdAt", "embedding"
                FROM "Mood"
                ${whereSQL}
                ORDER BY "date" DESC
                LIMIT ${limit} OFFSET ${offset}
            `);

            const totalResult = await this.prisma.$queryRawUnsafe<{ count: number }[]>(`
                SELECT COUNT(*)::int AS count
                FROM "Mood"
                ${whereSQL}
            `);

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
    return errorHandler(() => this.prisma.mood.findUnique({ where: { id } }));
  }

  async create(userId: string, data: CreateMoodInput) {
    return errorHandler(async () => {
      const embedding = await getEmbedding(data.notes ?? "");
      const result = await this.prisma.$queryRawUnsafe(`
        INSERT INTO "Mood" ("userId", "date", "moodScore", "moodLabel", "notes", "embedding", "createdAt")
        VALUES ('${userId}', '${new Date(data.date).toISOString()}', ${data.moodScore}, '${data.moodLabel}', '${data.notes ?? ""}', '${embedding}', NOW())
        RETURNING *
      `);
      return result;
    });
  }

  async update(id: string, data: UpdateMoodInput) {
    return errorHandler(async () => {
      const updateData: any = { ...data };
      if (data.date) updateData.date = new Date(data.date);
      if (data.moodLabel) updateData.moodLabel = data.moodLabel as MoodLabel;
      if (data.notes) updateData.embedding = await getEmbedding(data.notes);

      return this.prisma.mood.update({
        where: { id },
        data: updateData,
      });
    });
  }

  async delete(id: string) {
    return errorHandler(() => this.prisma.mood.delete({ where: { id } }));
  }

  async getCosineSimilar(userId: string, embedding: number[], top = 5) {
    return errorHandler(async () => {
      const moods: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT "id", "notes", "embedding", "date"
        FROM "Mood"
        WHERE "userId"='${userId}'
      `);

      const similarities = moods.map((m) => ({
        ...m,
        similarity: cosineSimilarity(embedding, m.embedding),
      }));

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
      const where: string[] = [`"userId"='${userId}'`];
      if (options?.moodLabel) where.push(`"moodLabel"='${options.moodLabel}'`);
      if (options?.startDate) where.push(`"date">='${new Date(options.startDate).toISOString()}'`);
      if (options?.endDate) where.push(`"date"<='${new Date(options.endDate).toISOString()}'`);
      const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

      const result = await this.prisma.$queryRawUnsafe(`
        SELECT date_trunc('${period}', "date") AS period,
               AVG("moodScore") AS avgMood,
               COUNT(*) AS count,
               MIN("moodScore") AS minMood,
               MAX("moodScore") AS maxMood
        FROM "Mood"
        ${whereSQL}
        GROUP BY period
        ORDER BY period DESC
      `);

      return result;
    });
  }
}
