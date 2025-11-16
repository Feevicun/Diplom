// express.d.ts
import type { JwtUserPayload } from "./types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}


declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      email: string;
      role: string;
      name: string;
    };
  }
}
