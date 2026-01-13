import { sequelize } from "../config/database";

import { User } from "./user";
import { Room } from "./room";
import { Customer } from "./customer";
import { Scheduling } from "./scheduling";
import { Log } from "./log";

User.hasMany(Customer, {
  foreignKey: "userId",
  as: "customers",
});
Customer.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Customer.hasMany(Scheduling, {
  foreignKey: "clientId",
  as: "schedules",
});
Scheduling.belongsTo(Customer, {
  foreignKey: "clientId",
  as: "customer",
});

Room.hasMany(Scheduling, {
  foreignKey: "roomId",
  as: "schedules",
});
Scheduling.belongsTo(Room, {
  foreignKey: "roomId",
  as: "room",
});

Customer.hasMany(Log, {
  foreignKey: "clientId",
  as: "logs",
});
Log.belongsTo(Customer, {
  foreignKey: "clientId",
  as: "customer",
});


export {
  sequelize,
  User,
  Room,
  Customer,
  Scheduling,
  Log,
};
