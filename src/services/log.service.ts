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
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Customer,
            as: "customers",
            attributes: ["id"],
          },
        ],
      });

      if (user && user.customers && user.customers.length > 0) {
        clientId = user.customers[0].id;
      }
    }

    await Log.create({
      typeActivity,
      page,
      userId,
      clientId,
      createdAt: date,
    });
  } catch (error) {
    console.error("Erro ao criar log:", error);
  }
};
