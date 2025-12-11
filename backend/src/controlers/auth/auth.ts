import { authService } from "#services/auth/index.js";
import asyncHandler from "#utils/asyncHandler.js";
import { logger } from "#utils/logger/index.js";
import { Request, Response } from "express";

interface LoginPayload {
   email: string;
   password: string;
}

interface REgisterPayload {
   email: string;
   password: string;
}
export const Login = asyncHandler(async (req: Request, res: Response) => {
   const payload = req.body as LoginPayload;
   const result = await authService.login(payload.email, payload.password);
   logger.debug(`User ${result.data?.session?.user?.id} logged Successfully`);

   return res.status(200).json(result);
});

export const Register = asyncHandler(async (req: Request, res: Response) => {
   const payload = req.body as REgisterPayload;
   const result = await authService.register(payload.email, payload.password);
   logger.debug(`User ${result.data?.session?.user?.id} registered Successfully`);

   return res.status(201).json(result);
});

export const Logout = asyncHandler(async (_req: Request, res: Response) => {
   const result = await authService.logout();
   logger.debug(`User logged out Successfully`);

   return res.status(200).json(result);
});

export const AuthStateChange = (req: Request, res: Response) => {
   const payload = req.body as { event: string; session: string | null };
   const result = authService.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      console.log("Session:", session);

      if (event === "SIGNED_IN") {
         console.log("User just signed in:", session?.user);
      }

      if (event === "SIGNED_OUT") {
         console.log("User signed out");
      }
   });
   logger.debug(`Auth state changed: ${payload.event}`);

   return res.status(200).json(result);
}
