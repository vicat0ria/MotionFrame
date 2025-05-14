import "express-session";

declare module "express-session" {
  interface SessionData {
    csrfToken?: string;
    lastActive?: Date;
  }
}
