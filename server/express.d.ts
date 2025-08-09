// express.d.ts
import type { JwtUserPayload } from "./types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
