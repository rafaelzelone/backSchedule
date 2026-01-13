import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

import { Page } from "../enums/page";
import { TypeActivity } from "../enums/typeActivity";
import { User } from "./user";

export class Log extends Model {
  public id!: string;
  public typeActivity!: TypeActivity;
  public page!: Page;
  public userId!: string;
  public readonly createdAt!: Date;
}

Log.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    typeActivity: {
      type: DataTypes.ENUM(...Object.values(TypeActivity)),
      allowNull: false,
    },
    page: {
      type: DataTypes.ENUM(...Object.values(Page)),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "logs",
    timestamps: true,
    updatedAt: false,
  }
);

Log.belongsTo(User, { foreignKey: "userId", as: "user" });
