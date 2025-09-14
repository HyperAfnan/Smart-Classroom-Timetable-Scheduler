// make a simple express server with a single endpoint that returns "Hello, World!" when accessed via a web browser or curl command.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/error-handler.middlewares.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

// Routes
app.use("/api/auth", authRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

export { app };
