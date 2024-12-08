import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'API Not Found!',
    error: '',
  });
};

export default notFound;
