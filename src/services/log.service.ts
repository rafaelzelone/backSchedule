import { Log, User, Customer } from "../models";
import { TypeActivity } from "../enums/typeActivity";
import { Page } from "../enums/page";

interface CreateLogParams {
  typeActivity: TypeActivity;
  page: Page;
  userId?: string | null;
  date?: Date;
}

export const createLog = async ({
  typeActivity,
  page,
  userId = null,
  date = new Date(),
}: CreateLogParams): Promise<void> => {
  try {
    let clientId: string | null = null;

    if (userId) {
      // Busca o cliente associado ao usuário
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Customer,
            as: "customers", // ⚠️ use o alias correto que você definiu
            attributes: ["id"],
          },
        ],
      });

      // Se o usuário tiver algum cliente, pega o primeiro (ou ajuste conforme sua regra)
      if (user && user.customers && user.customers.length > 0) {
        clientId = user.customers[0].id;
      }
    }

    await Log.create({
      typeActivity,
      page,
      userId,
      clientId, // adiciona o clientId
      createdAt: date,
    });
  } catch (error) {
    console.error("Erro ao criar log:", error);
  }
};
