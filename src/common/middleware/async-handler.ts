import { Request, Response, NextFunction } from "express";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const asyncHandlerWithThis = <T>(
  context: T,
  fn: (this: T, req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn.call(context, req, res, next)).catch(next);
  };
};
