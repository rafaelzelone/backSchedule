import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ScheduleTime } from "../models/ScheduleTime";
import { Room } from "../models/room";

export class ScheduleTimeController {
  // ================= CREATE =================
  static async create(req: AuthRequest, res: Response) {
    try {
      const { roomId, startTime, endTime, blockMinutes } = req.body;

      if (!roomId || !startTime || !endTime || !blockMinutes) {
        return res.status(400).json({
          message: "Sala, horário inicial, final e bloco são obrigatórios",
        });
      }

      // valida horário
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(startHour, startMinute, 0, 0);
      const endDate = new Date();
      endDate.setHours(endHour, endMinute, 0, 0);

      if (endDate <= startDate) {
        return res.status(400).json({
          message: "O horário final deve ser maior que o inicial",
        });
      }

      // verifica conflito por sala
      const conflict = await ScheduleTime.findOne({
        where: {
          roomId,
          [Op.or]: [
            { startTime: { [Op.between]: [startTime, endTime] } },
            { endTime: { [Op.between]: [startTime, endTime] } },
            { startTime: { [Op.lte]: startTime }, endTime: { [Op.gte]: endTime } },
          ],
        },
      });

      if (conflict) {
        return res.status(409).json({
          message: "Existe conflito com outro horário nesta sala",
        });
      }

      const scheduleTime = await ScheduleTime.create({
        userId: req.user!.id,
        roomId,
        startTime,
        endTime,
        blockMinutes,
      });

      // retorna incluindo os dados da sala
      const scheduleWithRoom = await ScheduleTime.findOne({
        where: { id: scheduleTime.id },
        include: [{ model: Room, as: "room" }],
      });

      return res.status(201).json(scheduleWithRoom);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro ao criar horário",
      });
    }
  }

  // ================= UPDATE =================
  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { startTime, endTime, blockMinutes } = req.body;

      if (!startTime || !endTime || !blockMinutes) {
        return res.status(400).json({
          message: "Horário inicial, final e bloco são obrigatórios",
        });
      }

      const schedule = await ScheduleTime.findOne({
        where: { id, userId: req.user!.id },
      });

      if (!schedule) {
        return res.status(404).json({ message: "Horário não encontrado" });
      }

      // valida horário
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(startHour, startMinute, 0, 0);
      const endDate = new Date();
      endDate.setHours(endHour, endMinute, 0, 0);

      if (endDate <= startDate) {
        return res.status(400).json({
          message: "O horário final deve ser maior que o inicial",
        });
      }

      // verifica conflito ignorando o próprio registro
      const conflict = await ScheduleTime.findOne({
        where: {
          roomId: schedule.roomId,
          id: { [Op.ne]: id },
          [Op.or]: [
            { startTime: { [Op.between]: [startTime, endTime] } },
            { endTime: { [Op.between]: [startTime, endTime] } },
            { startTime: { [Op.lte]: startTime }, endTime: { [Op.gte]: endTime } },
          ],
        },
      });

      if (conflict) {
        return res.status(409).json({
          message: "Existe conflito com outro horário nesta sala",
        });
      }

      await schedule.update({ startTime, endTime, blockMinutes });

      // retorna incluindo os dados da sala
      const updatedSchedule = await ScheduleTime.findOne({
        where: { id },
        include: [{ model: Room, as: "room" }],
      });

      return res.json(updatedSchedule);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro ao atualizar horário",
      });
    }
  }

  // ================= LIST =================
  static async list(req: AuthRequest, res: Response) {
    try {
      const { roomId } = req.query;

      const where: any = {};

      if (roomId) where.roomId = roomId;

      // se não for admin, só retorna horários do próprio usuário
      if (!req.user?.admin) {
        where.userId = req.user!.id;
      }

      const schedules = await ScheduleTime.findAll({
        where,
        order: [["startTime", "ASC"]],
        include: [{ model: Room, as: "room" }],
      });

      return res.json(schedules);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro ao listar horários",
      });
    }
  }

  // ================= GET BY ID =================
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const schedule = await ScheduleTime.findOne({
        where: { id },
        include: [{ model: Room, as: "room" }],
      });

      if (!schedule) return res.status(404).json({ message: "Horário não encontrado" });

      return res.json({
        id: schedule.id,
        room: schedule.roomId,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        blockMinutes: schedule.blockMinutes,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar horário" });
    }
  }

  // ================= DELETE =================
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const schedule = await ScheduleTime.findOne({
        where: {
          id,
          userId: req.user!.id,
        },
      });

      if (!schedule) {
        return res.status(404).json({ message: "Horário não encontrado" });
      }

      await schedule.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro ao remover horário",
      });
    }
  }
}
