import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

// Hello World route
router.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

// Health check endpoint
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
