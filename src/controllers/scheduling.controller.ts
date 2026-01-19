import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Scheduling, Customer, Room, Log, ScheduleTime } from "../models";
import { Status } from "../enums/status";
import { TypeActivity } from "../enums/typeActivity";
import { Page } from "../enums/page";
import { createLog } from "../services/log.service";

export class SchedulingController {

  static async create(req: AuthRequest, res: Response) {
    try {
      const { date, roomId } = req.body;


      if (!date || req.user!.id || !roomId) {
        return res.status(400).json({
          message: "Data, cliente e sala são obrigatórios",
        });
      }

      const client = await Customer.findOne({
        where: {
          userId: req.user!.id
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
          status: { [Op.not]: Status.CANCELED },
        },
      });

      if (conflict) {
        return res.status(409).json({
          message: "Já existe um agendamento para esta sala nesse horário",
        });
      }

      const scheduleDate = new Date(date);
      const dayOfWeek = scheduleDate.getDay(); 
      const time = scheduleDate.toTimeString().split(" ")[0];

      const validScheduleTime = await ScheduleTime.findOne({
        where: {
          roomId,
          dayOfWeek,
          startTime: { [Op.lte]: time },
          endTime: { [Op.gte]: time },
        },
      });

      if (!validScheduleTime) {
        return res.status(400).json({
          message: "A sala não possui horário disponível para este agendamento",
        });
      }
      // ========================================================

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
      console.error(error);
      return res.status(500).json({
        message: "Erro ao criar agendamento",
      });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const offset = (page - 1) * pageSize;

      const isAdmin = req.user!.admin;

      const { customerName, date } = req.query;

      // filtro do customer
      const whereCustomer: any = isAdmin ? {} : { userId: req.user!.id };
      if (customerName) {
        whereCustomer.name = { [Op.iLike]: `%${customerName}%` }; // filtro por nome (case-insensitive)
      }

      // filtro do scheduling
      const whereScheduling: any = {};
      if (date) {
        whereScheduling.date = date; // filtra pelo dia exato
      }

      const { rows, count } = await Scheduling.findAndCountAll({
        where: whereScheduling,
        include: [
          {
            model: Customer,
            as: "customer",
            where: whereCustomer,
          },
          {
            model: Room,
            as: "room",
          },
        ],
        order: [["date", "ASC"]],
        limit: pageSize,
        offset,
      });

      return res.json({
        data: rows,
        pagination: {
          page,
          pageSize,
          total: count,
          totalPages: Math.ceil(count / pageSize),
        },
        isAdmin,
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
