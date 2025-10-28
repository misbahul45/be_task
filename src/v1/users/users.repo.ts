import { errorHandler } from "@/utils/util";
import { prisma } from "@/config/prisma";
import { Prisma } from "@prisma/client";
import { CreateUserInput, UpdateUserInput } from "./users.validation";

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export class UsersRepo {
  private readonly prisma = prisma 

  async findAll(q: PaginationQuery = {}) {
    const limit = Number(q.limit) || 10; 
    const page = Number(q.page) || 1;   
    const skip = (page - 1) * limit;     

    const sortBy = q.sortBy ?? "createdAt";
    const order = q.order ?? "desc";

    return errorHandler(async () => {
      const where: Prisma.UserWhereInput | undefined = q.search
        ? {
            OR: [
              {
                name: {
                  contains: q.search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                email: {
                  contains: q.search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
            ],
          }
        : undefined;

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: order },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          search: q.search ?? null,
          sortBy,
          order,
        },
      };
    });
  }

  async findById(id: string) {
    return errorHandler(async () => {
      return this.prisma.user.findUnique({ where: { id } });
    });
  }

  async findByEmail(email:string){
    return errorHandler(()=>{
        return this.prisma.user.findUnique({ where:{ email } })
    })
  }

  async create(data: CreateUserInput) {
    return errorHandler(async () => {
      const { confirmPassword, ...dataUser }=data
      return this.prisma.user.create({ data:dataUser });
    });
  }

  async delete(id: string) {
    return errorHandler(async () => {
      return this.prisma.user.delete({ where: { id } });
    });
  }

  async update(id:string, data:UpdateUserInput){
    return errorHandler(async()=>{
      return await this.prisma.user.update({
        where:{
          id
        },
        data
      })
    })
  }
}
