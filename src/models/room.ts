import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database"

export class Room extends Model {}

Room.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: DataTypes.STRING,
  },
  { sequelize, tableName: "rooms" }
);
