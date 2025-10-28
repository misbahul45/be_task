import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import V1Router from "./v1/v1.router";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { AppError, AppErrorCode } from "./utils/error";
import env from "./config/env";

const app = express();
const PORT = env.PORT || 3000;

app.use(cors({
  origin: [env.APP_URL, env.FE_URL],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api", V1Router);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running 🔥");
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError("Route not found", 404, AppErrorCode.NOT_FOUND));
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
