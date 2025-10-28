import { prisma } from "@/config/prisma";
import { ISession } from "@/types/auth.type";
import { errorHandler } from "@/utils/util";
export class SessionRepo {
  private readonly prisma = prisma;

  async getAllByUserId(userId: string): Promise<ISession[] | null> {
    return errorHandler(async () => {
      return this.prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
    });
  }

  async getById(id: string): Promise<ISession | null> {
    return errorHandler(async () => {
      return this.prisma.session.findUnique({
        where: { id },
      });
    });
  }

  async getByrefreshToken(token:string){
    return errorHandler(async()=>{
      return this.prisma.session.findUnique({
        where: { refreshToken:token },
      });
    })
  }

  async getByUserId(userId: string): Promise<ISession | null> {
    return errorHandler(async () => {
      return this.prisma.session.findFirst({
        where: { userId },
      });
    });
  }

  async create(data: { userId: string; expiredAt: Date }): Promise<ISession | null> {
    return errorHandler(async () => {
      return this.prisma.session.create({ data });
    });
  }

  async update(id: string, data: Partial<{ refreshToken: string; expiredAt: Date }>): Promise<ISession | null> {
    return errorHandler(async () => {
      return this.prisma.session.update({
        where: { id },
        data,
      });
    });
  }
}
