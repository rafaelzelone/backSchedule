import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Log, User, Customer } from "../models";

export class LogController {
  static async list(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      const search = (req.query.search as string)?.trim() || "";
      const date = req.query.date as string;

      const isAdmin = !!req.user?.admin;

      const where: any = {};
      const userWhere: any = {};
      const customerWhere: any = {};

      if (!isAdmin) {
        where.userId = req.user!.id;
      }

      if (search) {
        const searchPattern = `%${search}%`;

        where[Op.or] = [
          { typeActivity: { [Op.like]: searchPattern } },
          { page: { [Op.like]: searchPattern } },
        ];

        userWhere[Op.or] = [
          { firstName: { [Op.like]: searchPattern } },
          { lastName: { [Op.like]: searchPattern } },
          { email: { [Op.like]: searchPattern } },
        ];

        customerWhere[Op.or] = [
          { city: { [Op.like]: searchPattern } },
          { state: { [Op.like]: searchPattern } },
        ];
      }

      if (date) {
        where.createdAt = {
          [Op.between]: [
            new Date(`${date}T00:00:00.000Z`),
            new Date(`${date}T23:59:59.999Z`),
          ],
        };
      }

      const { rows: logs, count: total } = await Log.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "logUser",
            attributes: ["id", "firstName", "lastName", "email", "admin"],
            where: Object.keys(userWhere).length ? userWhere : undefined,
          },
          {
            model: Customer,
            as: "logCustomer",
            attributes: ["id", "CEP", "street", "number", "city", "state"],
            where: Object.keys(customerWhere).length ? customerWhere : undefined,
          },
        ],
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
        distinct: true,
      });


      const logsWithAdminFlag = logs.map(log => ({
        ...log.toJSON(),
        isAdmin,
      }));

      return res.json({
        data: logsWithAdminFlag,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
        isAdmin,
      });
    } catch (error) {
      console.error("Erro ao listar logs:", error);
      return res.status(500).json({
        message: "Erro ao listar logs",
        error: (error as any).message,
      });
    }
  }
}

