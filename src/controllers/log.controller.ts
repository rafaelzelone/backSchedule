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

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { rows: logs, count } = await Log.findAndCountAll({
        include: [
          {
            model: Customer,
            as: "customer",
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return res.json({
        data: logs,
        meta: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar logs",
      });
    }
  }

}
