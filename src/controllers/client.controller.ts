import { Response } from "express";
import { Customer, User } from "../models";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createLog } from "../services/log.service";
import { Page } from "../enums/page";
import { TypeActivity } from "../enums/typeActivity";

export class ClientController {

  static async create(req: AuthRequest, res: Response) {
    try {
      const { CEP, street, number, complement, neighboor, city, state } = req.body;

      if (!CEP || !street || !number || !city || !state) {
        return res.status(400).json({
          message: "Campos obrigatórios não informados",
        });
      }

      const client = await Customer.create({
        CEP,
        street,
        number,
        complement,
        neighboor,
        city,
        state,
        userId: req.user!.id,
      });

      return res.status(201).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro ao criar cliente",
      });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      const { rows: clients, count: total } = await Customer.findAndCountAll({
        where: { userId: req.user!.id },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email", "firstName", "lastName", "active"],
          },
        ],
        order: [["createdAt", "DESC"]],
        offset,
        limit,
      });

      return res.json({
        data: clients,
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
        message: "Erro ao listar clientes",
      });
    }
  }

  static async getClientByUserId(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const client = await Customer.findOne({
        where: { userId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email", "firstName", "lastName", "active"],
          },
        ],
      });

      if (!client) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      return res.json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar cliente por usuário" });
    }
  }


  static async findById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Customer.findOne({
        where: { id, userId: req.user!.id },
      });

      if (!client) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      return res.json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar cliente" });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Customer.findOne({
        where: { id, userId: req.user!.id },
        include: [{ model: User, as: "user" }],
      });

      if (!client) return res.status(404).json({ message: "Cliente não encontrado" });

      const { CEP, street, number, complement, neighboor, city, state, email, active } = req.body;

      let typeActivity: TypeActivity | null = null;

      const addressFieldsChanged =
        (CEP && CEP !== client.CEP) ||
        (street && street !== client.street) ||
        (number && number !== client.number) ||
        (complement && complement !== client.complement) ||
        (neighboor && neighboor !== client.neighboor) ||
        (city && city !== client.city) ||
        (state && state !== client.state);

      if (addressFieldsChanged) {
        await client.update({ CEP, street, number, complement, neighboor, city, state });
        typeActivity = TypeActivity.UPDATEADRESS;
      }

      if (email && email !== client.user!.email) {
        await client.user!.update({ email });
        typeActivity = TypeActivity.UPDATEEMAIL;
      }

      if (typeActivity) {
        await createLog({
          typeActivity,
          page: Page.MYACCOUNT,
          userId: req.user!.id,
        });
      }

      return res.json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar cliente" });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Customer.findOne({ where: { id, userId: req.user!.id } });
      if (!client) return res.status(404).json({ message: "Cliente não encontrado" });

      await client.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao deletar cliente" });
    }
  }
}
