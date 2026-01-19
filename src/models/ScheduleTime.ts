import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class ScheduleTime extends Model {
  public id!: string;
  public roomId!: string;
  public userId!: string;
  public startTime!: string;       // "08:00"
  public endTime!: string;         // "18:00"
  public blockMinutes!: number;    // 30 ou 60
}

ScheduleTime.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // formato HH:mm
      },
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // formato HH:mm
      },
    },
    blockMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: 1,
      },
    },
  },
  {
    sequelize,
    tableName: "schedule_times",
  }
);
