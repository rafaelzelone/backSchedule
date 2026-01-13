import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Log, Customer } from "../models";

export class LogController {

  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.admin) {
        return res.status(403).json({
          message: "Apenas administradores podem visualizar logs",
        });
      }

      const logs = await Log.findAll({
        include: [
          {
            model: Customer,
            as: "customer",
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.json(logs);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar logs",
      });
    }
  }
}
