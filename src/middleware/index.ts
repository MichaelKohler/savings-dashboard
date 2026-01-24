import { sequence } from "astro:middleware";
import { onRequest as authMiddleware } from "./auth";

export const onRequest = sequence(authMiddleware);
