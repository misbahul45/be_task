import { Router } from "express";
import authRouter from "./auth/auth.router";
import usersRouter from "./users/users.router";
import moodRouter from "./moods/moods.router";
import { versionedRoute } from "@/utils/util";

const V1Router = Router();

V1Router.use(versionedRoute("/auth"), authRouter);
V1Router.use(versionedRoute("/users"), usersRouter);
V1Router.use(versionedRoute("/moods"), moodRouter);

export default V1Router;
