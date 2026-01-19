import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Scheduling, Customer, Room, ScheduleTime, User } from "../models";
import { Status } from "../enums/status";
import { TypeActivity } from "../enums/typeActivity";
import { Page } from "../enums/page";
import { createLog } from "../services/log.service";

export class SchedulingController {

  static async create(req: AuthRequest, res: Response) {
    try {
      const { date, roomId, time } = req.body;


      if (!date) {
        return res.status(400).json({
          message: "Data são obrigatório",
        });
      }

      if (!req.user || !req.user.id) {
        return res.status(400).json({
          message: "Cliente são obrigatório",
        });
      }

      if (!roomId) {
        return res.status(400).json({
          message: "sala são obrigatório",
        });
      }
      if (!time) {
        return res.status(400).json({
          message: "Horário é obrigatório",
        });
      }

      const scheduleTime = `${time}:00`;
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

      const validScheduleTime = await ScheduleTime.findOne({
        where: {
          roomId,
          startTime: { [Op.lte]: scheduleTime },
          endTime: { [Op.gte]: scheduleTime },
        },
      });

      if (!validScheduleTime) {
        return res.status(400).json({
          message: "A sala não possui horário disponível para este agendamento",
        });
      }
      const startDateTime = new Date(`${date}T${time}:00`);
      const blockMinutes = validScheduleTime.blockMinutes;
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + blockMinutes);
      const sameDayStart = new Date(startDateTime);
      sameDayStart.setHours(0, 0, 0, 0);

      const sameDayEnd = new Date(startDateTime);
      sameDayEnd.setHours(23, 59, 59, 999);

      const schedules = await Scheduling.findAll({
        where: {
          roomId,
          status: { [Op.not]: Status.CANCELED },
          date: {
            [Op.between]: [sameDayStart, sameDayEnd],
          },
        },
      });
      const hasConflict = schedules.some((s) => {
        const existingStart = new Date(s.date);
        const existingEnd = new Date(existingStart);
        existingEnd.setMinutes(existingEnd.getMinutes() + blockMinutes);

        return (
          existingStart < endDateTime &&
          existingEnd > startDateTime
        );
      });

      if (hasConflict) {
        return res.status(409).json({
          message: "Já existe um agendamento para esta sala nesse horário",
        });
      }


      const scheduling = await Scheduling.create({
        date: startDateTime,
        customerId: client.id,
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
      const { customerName, date } = req.query;

      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const offset = (page - 1) * pageSize;

      const isAdmin = req.user!.admin;

      const client = await Customer.findOne({
        where: { userId: req.user!.id },
      });

      if (!isAdmin && !client) {
        return res.status(400).json({
          message: "Cliente não encontrado para o usuário",
        });
      }

      const whereScheduling: any = {};
      if (date) whereScheduling.date = date;
      if (!isAdmin) whereScheduling.customerId = client!.id;
      const customerInclude: any = {
        model: Customer,
        as: "customer",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email", "firstName", "lastName"],
          },
        ],
      };

      if (customerName) {
        customerInclude.where = {
          name: { [Op.iLike]: `%${customerName}%` },
        };
      }

      const { rows, count } = await Scheduling.findAndCountAll({
        where: whereScheduling,
        include: [
          customerInclude,
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
      console.error(error);
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
