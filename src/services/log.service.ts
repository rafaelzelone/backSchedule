import { Log } from "../models";
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
    await Log.create({
      typeActivity,
      page,
      userId,
      createdAt: date,
    });
  } catch (error) {
    console.error("Erro ao criar log:", error);
  }
};
