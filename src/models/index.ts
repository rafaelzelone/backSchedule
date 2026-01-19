import { sequelize } from "../config/database";

import { User } from "./user";
import { Room } from "./room";
import { Customer } from "./customer";
import { Scheduling } from "./scheduling";
import { Log } from "./log";
import { ScheduleTime } from "./ScheduleTime";

User.hasMany(Customer, {
  foreignKey: "userId",
  as: "customers",
});
Customer.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Customer.hasMany(Scheduling, {
  foreignKey: "customerId",
  as: "schedules",
});
Scheduling.belongsTo(Customer, {
  foreignKey: "customerId",
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
  foreignKey: "customerId",
  as: "logs",
});
Log.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "logCustomer", 
});

Log.belongsTo(User, {
  foreignKey: "userId",
  as: "logUser", 
});
User.hasMany(Log, {
  foreignKey: "userId",
  as: "logsCreated",
});

ScheduleTime.belongsTo(User, {
  foreignKey: "userId",
  as: "scheduleUser",
});
User.hasMany(ScheduleTime, {
  foreignKey: "userId",
  as: "scheduleTimes",
});

Room.hasMany(ScheduleTime, {
  foreignKey: "roomId",
  as: "scheduleTimes",
});
ScheduleTime.belongsTo(Room, {
  foreignKey: "roomId",
  as: "room",
});


export {
  sequelize,
  User,
  Room,
  Customer,
  Scheduling,
  Log,
  ScheduleTime,
};
