import { Request, Response, NextFunction } from "express";
import { UsersService } from "./users.service";

const usersService = new UsersService();

export class UsersHandler {
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.getAll(req.query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.getById(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.update(req.params.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.delete(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
