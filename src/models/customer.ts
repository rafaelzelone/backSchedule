import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database"
import { User } from "./user";

interface CustomerAttributes {
  id: string;
  CEP: string;
  street: string;
  number: number;
  complement?: string;
  neighboor?: string;
  city: string;
  state: string;
  userId: string;
}


interface CustomerCreationAttributes
  extends Optional<CustomerAttributes, "id"> {}

export class Customer
  extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes
{
  public id!: string;
  public CEP!: string;
  public street!: string;
  public number!: number;
  public complement?: string;
  public neighboor?: string;
  public city!: string;
  public state!: string;
  public userId!: string;
}


Customer.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    CEP: DataTypes.STRING,
    street: DataTypes.STRING,
    number: DataTypes.INTEGER,
    complement: DataTypes.STRING,
    neighboor: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { sequelize, tableName: "customers" }
);

Customer.belongsTo(User, { foreignKey: "userId" });
