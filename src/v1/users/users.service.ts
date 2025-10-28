import { errorHandler } from "@/utils/util";
import { UsersRepo, PaginationQuery } from "./users.repo";
import { CreateUserInput, UpdateUserInput } from "./users.validation";
import { AppError, AppErrorCode } from "@/utils/error";
import { ServiceResponse } from "@/types/app.type";

export class UsersService {
  private readonly usersRepo = new UsersRepo();

  async findAll(query: PaginationQuery) {
    return errorHandler<ServiceResponse>(async () => {
      const result = await this.usersRepo.findAll(query);
      return {
        message: "Users fetched successfully",
        data: result.data,
        meta: result.meta,
      };
    });
  }

  async findById(id: string) {
    return errorHandler<ServiceResponse>(async () => {
      const user = await this.usersRepo.findById(id);
      if (!user) throw new AppError("User not found", 404, AppErrorCode.NOT_FOUND);

      const { password, ...safeUser } = user;
      return {
        message: "User fetched successfully",
        data: safeUser,
      };
    });
  }

  async create(body: CreateUserInput) {
    return errorHandler<ServiceResponse>(async () => {
      const existingUser = await this.usersRepo.findByEmail(body.email);
      if (existingUser) throw new AppError("User already exists", 400, AppErrorCode.USER_ALREADY_EXISTS);

      const newUser = await this.usersRepo.create(body);
      const { password, ...safeUser } = newUser;

      return {
        message: "User created successfully",
        data: safeUser,
      };
    });
  }

  async update(id: string, body: UpdateUserInput) {
    return errorHandler<ServiceResponse>(async () => {
      const existingUser = await this.usersRepo.findById(id);
      if (!existingUser) throw new AppError("User not found", 404, AppErrorCode.NOT_FOUND);

      const updatedUser = await this.usersRepo.update(id, body);
      const { password, ...safeUser } = updatedUser;

      return {
        message: "User updated successfully",
        data: safeUser,
      };
    });
  }

  async delete(id: string) {
    return errorHandler<ServiceResponse>(async () => {
      const existingUser = await this.usersRepo.findById(id);
      if (!existingUser) throw new AppError("User not found", 404, AppErrorCode.NOT_FOUND);

      await this.usersRepo.delete(id);
      return {
        message: "User deleted successfully",
      };
    });
  }
}
