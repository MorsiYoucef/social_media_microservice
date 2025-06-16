// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      user?: {
        userId: string;
      };
      FileReq?: {
        originalname?: string;
        mimetype?: string;
      };
    }
  }
}
