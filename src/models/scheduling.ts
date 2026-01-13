import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import { Customer } from "./customer";
import { Room } from "./room";
import { Status } from "../enums/status";

export class Scheduling extends Model {
  public id!: string;
  public date!: Date;
  public status!: Status;
  public customerId!: string;
  public roomId!: string;
  public customer?: Customer;
  public room?: Room;
}

Scheduling.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(Status)),
      defaultValue: Status.PEDDING,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { sequelize, tableName: "schedules" }
);

Scheduling.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});

Scheduling.belongsTo(Room, {
  foreignKey: "roomId",
  as: "room",
});
