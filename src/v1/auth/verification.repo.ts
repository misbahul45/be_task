import { prisma } from "@/config/prisma";
import { errorHandler } from "@/utils/util";
import { VerificationType } from "@prisma/client";

export class VerificationRepo {
  private readonly prisma = prisma;

  async create(data: {
    userId: string;
    token: string;
    type: VerificationType;
    expiredAt: Date;
  }) {
    return errorHandler(async () => {
      return this.prisma.verification.create({ data });
    });
  }

  async findById(id: string) {
    return errorHandler(async () => {
      return this.prisma.verification.findUnique({
        where: { id },
        include: { user: true },
      });
    });
  }

  async findByEmail(email: string) {
    return errorHandler(async () => {
      return this.prisma.verification.findFirst({
        where: {
          user: { email },
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    });
  }

  async deleteById(id: string) {
    return errorHandler(async () => {
      return this.prisma.verification.delete({
        where: { id },
      });
    });
  }

  async deleteByUserId(userId: string) {
    return errorHandler(async () => {
      return this.prisma.verification.deleteMany({
        where: { userId },
      });
    });
  }
}
