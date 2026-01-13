import { Request, Response } from "express";
import { Room } from "../models";
import { AuthRequest } from "../middlewares/auth.middleware";

export class RoomController {

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.admin) {
        return res.status(403).json({
          message: "Apenas administradores podem criar salas",
        });
      }

      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          message: "Nome da sala é obrigatório",
        });
      }

      const roomExists = await Room.findOne({ where: { name } });

      if (roomExists) {
        return res.status(409).json({
          message: "Sala já cadastrada",
        });
      }

      const room = await Room.create({ name });

      return res.status(201).json(room);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao criar sala",
      });
    }
  }


  static async list(req: Request, res: Response) {
    try {
      const rooms = await Room.findAll({
        order: [["name", "ASC"]],
      });

      return res.json(rooms);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar salas",
      });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const room = await Room.findByPk(id);

      if (!room) {
        return res.status(404).json({
          message: "Sala não encontrada",
        });
      }

      return res.json(room);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar sala",
      });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.admin) {
        return res.status(403).json({
          message: "Apenas administradores podem editar salas",
        });
      }

      const { id } = req.params;
      const { name } = req.body;

      const room = await Room.findByPk(id);

      if (!room) {
        return res.status(404).json({
          message: "Sala não encontrada",
        });
      }

      await room.update({ name });

      return res.json(room);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao atualizar sala",
      });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.admin) {
        return res.status(403).json({
          message: "Apenas administradores podem deletar salas",
        });
      }

      const { id } = req.params;

      const room = await Room.findByPk(id);

      if (!room) {
        return res.status(404).json({
          message: "Sala não encontrada",
        });
      }

      await room.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao deletar sala",
      });
    }
  }
}
