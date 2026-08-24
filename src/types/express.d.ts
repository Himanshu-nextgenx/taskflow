
import { UserPayload } from "./auth.type";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}