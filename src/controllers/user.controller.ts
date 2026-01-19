import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { User } from "../models";

export class UserController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const { email, firstName, lastName, password, admin } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email e senha são obrigatórios",
        });
      }

      const exists = await User.findOne({ where: { email } });

      if (exists) {
        return res.status(409).json({
          message: "Email já cadastrado",
        });
      }

      const user = await User.create({
        email,
        firstName,
        lastName,
        password,
        admin: admin ?? false,
      });

      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao criar usuário",
      });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.admin) {
        return res.status(403).json({
          message: "Apenas administradores podem listar usuários",
        });
      }

      const users = await User.findAll({
        attributes: { exclude: ["password"] },
        order: [["createdAt", "ASC"]],
      });

      return res.json(users);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar usuários",
      });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      const user = await User.findByPk(req.user!.id, {
        attributes: { exclude: ["password"] },
      });

      return res.json(user);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar usuário",
      });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user?.admin && req.user!.id !== id) {
        return res.status(403).json({
          message: "Sem permissão para editar este usuário",
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          message: "Usuário não encontrado",
        });
      }

      const { email, firstName, lastName, admin } = req.body;

      if (email) user.email = email;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;

      if (req.user && req.user.admin && typeof admin === "boolean") {
        user.admin = admin;
      }

      await user.save();

      return res.json(user);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao atualizar usuário",
      });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.admin) {
        return res.status(403).json({
          message: "Apenas administradores podem remover usuários",
        });
      }

      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          message: "Usuário não encontrado",
        });
      }

      await user.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao remover usuário",
      });
    }
  }
}
