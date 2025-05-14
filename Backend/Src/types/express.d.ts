import { IUser } from "./index.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] };
    }
  }
}
