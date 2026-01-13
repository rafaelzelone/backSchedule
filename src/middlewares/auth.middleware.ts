import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models";

interface JwtPayload {
  id: string;
  admin: boolean;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    admin: boolean;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token não informado",
    });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({
      message: "Token mal formatado",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Usuário não encontrado",
      });
    }

    req.user = {
      id: decoded.id,
      admin: decoded.admin,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
};
