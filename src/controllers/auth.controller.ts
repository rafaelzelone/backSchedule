import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Customer, User } from "../models";
import { createLog } from "../services/log.service";
import { TypeActivity } from "../enums/typeActivity";
import { Page } from "../enums/page";


export class AuthController {

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email e senha são obrigatórios",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        message: "Email ou senha inválidos",
      });
    }
    createLog({
      typeActivity: TypeActivity.LOGIN,
      page: Page.MYACCOUNT,
      userId: user.id
    })
    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email ou senha inválidos",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );


    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        admin: user.admin,
      },
    });
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, firstName, lastName, password, admin } = req.body;

      const {
        CEP,
        street,
        number,
        complement,
        neighboor,
        city,
        state,
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email e senha são obrigatórios",
        });
      }

      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
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

      const customer = await Customer.create({
        CEP,
        street,
        number,
        complement,
        neighboor,
        city,
        state,
        userId: user.id,
      });

      createLog({
        typeActivity: TypeActivity.CREATEACCOUNT,
        page: Page.MYACCOUNT,
        userId: user.id,
      });

      return res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        admin: user.admin,
        customer: {
          id: customer.id,
          CEP: customer.CEP,
          street: customer.street,
          number: customer.number,
          complement: customer.complement,
          neighboor: customer.neighboor,
          city: customer.city,
          state: customer.state,
        },
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro ao criar usuário e cliente",
      });
    }
  }




  static async logout(req: Request, res: Response) {
    return res.json({
      message: "Logout realizado com sucesso",
    });
  }
}
