import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Log, User, Customer } from "../models";

export class LogController {

  static async list(req: AuthRequest, res: Response) {
    try {
      // Apenas admins podem acessar
      if (!req.user?.admin) {
        return res.status(403).json({
          message: "Apenas administradores podem visualizar logs",
        });
      }

      // Paginação
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      // Busca logs com usuário e cliente usando os aliases corretos
      const { rows: logs, count: total } = await Log.findAndCountAll({
        include: [
          {
            model: User,
            as: "logUser",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: Customer,
            as: "logCustomer",
            attributes: ["id", "CEP", "street", "number", "city", "state"],
          },
        ],
        order: [["createdAt", "DESC"]],
        offset,
        limit,
      });


      // Retorno
      return res.json({
        data: logs,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro ao listar logs",
      });
    }
  }

}
