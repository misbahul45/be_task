import { Request, Response } from "express";
import { errorHandler } from "@/utils/util";
import { Responder } from "@/utils/response";
import { UsersService } from "./users.service";
import { CreateUserInput, UpdateUserInput } from "./users.validation";

export class UsersHandler {
  private readonly usersService = new UsersService();

  findAll = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const query = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: req.query.search as string,
      };
      const { data, meta } = await this.usersService.findAll(query);
      return Responder.success(res, "Successfully fetched users", data, meta);
    });
  };

  findById = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { id } = req.params;
      const data = await this.usersService.findById(id);
      return Responder.success(res, "Successfully fetched user", data);
    });
  };

  create = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const body = req.body as CreateUserInput;
      const data = await this.usersService.create(body);
      return Responder.success(res, "User created successfully", data);
    });
  };

  update = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { id } = req.params;
      const body = req.body as UpdateUserInput;
      const data = await this.usersService.update(id, body);
      return Responder.success(res, "User updated successfully", data);
    });
  };

  delete = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { id } = req.params;
      const data = await this.usersService.delete(id);
      return Responder.success(res, "User deleted successfully", data);
    });
  };
}
