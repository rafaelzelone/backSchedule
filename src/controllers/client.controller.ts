import { Request, Response } from "express";
import { Customer, User } from "../models";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createLog } from "../services/log.service";
import { Page } from "../enums/page";
import { TypeActivity } from "../enums/typeActivity";

export class ClientController {

  static async create(req: AuthRequest, res: Response) {
    try {
      const {
        CEP,
        street,
        number,
        complement,
        neighboor,
        city,
        state,
      } = req.body;

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
      return res.status(500).json({
        message: "Erro ao criar cliente",
      });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const clients = await Customer.findAll({
        where: { userId: req.user!.id },
        order: [["createdAt", "DESC"]],
      });

      return res.json(clients);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar clientes",
      });
    }
  }

  static async findById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Customer.findOne({
        where: {
          id,
          userId: req.user!.id,
        },
      });

      if (!client) {
        return res.status(404).json({
          message: "Cliente não encontrado",
        });
      }

      return res.json(client);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar cliente",
      });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Customer.findOne({
        where: {
          id,
          userId: req.user!.id,
        },
      });

      if (!client) {
        return res.status(404).json({
          message: "Cliente não encontrado",
        });
      }
      const user = await User.findByPk(req.user!.id);


      const {
        CEP,
        street,
        number,
        complement,
        neighboor,
        city,
        state,
        email,
      } = req.body;

      if (!user) {
        return res.status(404).json({
          message: "Usuário não encontrado",
        });
      }

      const emailChanged = email && email !== user.email;

      const addressFieldsChanged =
        (CEP && CEP !== client.CEP) ||
        (street && street !== client.street) ||
        (number && number !== client.number) ||
        (complement && complement !== client.complement) ||
        (neighboor && neighboor !== client.neighboor) ||
        (city && city !== client.city) ||
        (state && state !== client.state);


      let typeActivity: TypeActivity | null = null;

      if (emailChanged) {
        typeActivity = TypeActivity.UPDATEEMAIL;
      } else if (addressFieldsChanged) {
        typeActivity = TypeActivity.UPDATEEMAIL;
      }

      if (addressFieldsChanged) {
        await client.update({
          CEP,
          street,
          number,
          complement,
          neighboor,
          city,
          state,
        });
      }

      if (emailChanged) {
        await user.update({ email });
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
      return res.status(500).json({
        message: "Erro ao atualizar cliente",
      });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await Customer.findOne({
        where: {
          id,
          userId: req.user!.id,
        },
      });

      if (!client) {
        return res.status(404).json({
          message: "Cliente não encontrado",
        });
      }

      await client.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao deletar cliente",
      });
    }
  }
}
