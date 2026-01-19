import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Scheduling, Customer, Room, Log } from "../models";
import { Status } from "../enums/status";
import { TypeActivity } from "../enums/typeActivity";
import { Page } from "../enums/page";
import { createLog } from "../services/log.service";

export class SchedulingController {

  static async create(req: AuthRequest, res: Response) {
    try {
      const { date, clientId, roomId } = req.body;

      if (!date || !clientId || !roomId) {
        return res.status(400).json({
          message: "Data, cliente e sala são obrigatórios",
        });
      }

      const client = await Customer.findOne({
        where: {
          id: clientId,
          userId: req.user!.id,
        },
      });

      if (!client) {
        return res.status(403).json({
          message: "Cliente não pertence ao usuário",
        });
      }

      const conflict = await Scheduling.findOne({
        where: {
          roomId,
          date,
          status: {
            [Op.not]: Status.CANCELED,
          },
        },
      });

      if (conflict) {
        return res.status(409).json({
          message: "Já existe um agendamento para esta sala nesse horário",
        });
      }

      const scheduling = await Scheduling.create({
        date,
        clientId,
        roomId,
        status: Status.PEDDING,
      });
      await createLog({
        typeActivity: TypeActivity.CREATESCHEDULE,
        page: Page.SCHEDULE,
        userId: req.user!.id,
      });

      return res.status(201).json(scheduling);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao criar agendamento",
      });
    }
  }


  static async list(req: AuthRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { rows: schedulings, count } = await Scheduling.findAndCountAll({
        include: [
          {
            model: Customer,
            as: "customer",
            where: { userId: req.user!.id },
          },
          {
            model: Room,
            as: "room",
          },
        ],
        order: [["date", "ASC"]],
        limit,
        offset,
      });

      return res.json({
        data: schedulings,
        meta: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar agendamentos",
      });
    }
  }


  static async confirm(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.admin) {
        return res.status(403).json({
          message: "Apenas administradores podem confirmar agendamentos",
        });
      }

      const { id } = req.params;

      const scheduling = await Scheduling.findByPk(id);

      if (!scheduling) {
        return res.status(404).json({
          message: "Agendamento não encontrado",
        });
      }

      if (scheduling.status !== Status.PEDDING) {
        return res.status(400).json({
          message: "Apenas agendamentos pendentes podem ser confirmados",
        });
      }

      await scheduling.update({ status: Status.CONFIRMED });


      await createLog({
        typeActivity: TypeActivity.CONFIRMSCHEDULE,
        page: Page.SCHEDULE,
        userId: req.user!.id,
      });

      return res.json(scheduling);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao confirmar agendamento",
      });
    }
  }

  static async cancel(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const scheduling = await Scheduling.findByPk(id, {
        include: [
          {
            model: Customer,
            as: "customer",
          },
        ],
      });

      if (!scheduling || !scheduling.customer) {
        return res.status(404).json({
          message: "Agendamento não encontrado",
        });
      }

      if (
        !req.user?.admin &&
        scheduling.customer.userId !== req.user!.id
      ) {
        return res.status(403).json({
          message: "Sem permissão para cancelar este agendamento",
        });
      }

      if (scheduling.status === Status.CANCELED) {
        return res.status(400).json({
          message: "Agendamento já cancelado",
        });
      }

      await scheduling.update({ status: Status.CANCELED });

      await createLog({
        typeActivity: TypeActivity.CANCELASCHEDULE,
        page: Page.SCHEDULE,
        userId: req.user!.id,
      });

      return res.json(scheduling);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao cancelar agendamento",
      });
    }
  }
}
