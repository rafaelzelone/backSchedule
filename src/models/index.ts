import { sequelize } from "../config/database";

import { User } from "./user";
import { Room } from "./room";
import { Customer } from "./customer";
import { Scheduling } from "./scheduling";
import { Log } from "./log";
import { ScheduleTime } from "./ScheduleTime";

// ===================== User -> Customer =====================
User.hasMany(Customer, {
  foreignKey: "userId",
  as: "customers",
});
Customer.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ===================== Customer -> Scheduling =====================
Customer.hasMany(Scheduling, {
  foreignKey: "clientId",
  as: "schedules",
});
Scheduling.belongsTo(Customer, {
  foreignKey: "clientId",
  as: "customer",
});

// ===================== Room -> Scheduling =====================
Room.hasMany(Scheduling, {
  foreignKey: "roomId",
  as: "schedules",
});
Scheduling.belongsTo(Room, {
  foreignKey: "roomId",
  as: "room",
});

// ===================== Customer -> Log =====================
Customer.hasMany(Log, {
  foreignKey: "clientId",
  as: "logs",
});
Log.belongsTo(Customer, {
  foreignKey: "clientId",
  as: "logCustomer", // alias único
});

// Log -> User
Log.belongsTo(User, {
  foreignKey: "userId",
  as: "logUser", // ⚠️ mudamos de "user" para "logUser"
});
User.hasMany(Log, {
  foreignKey: "userId",
  as: "logsCreated", // esse já estava ok
});

// ScheduleTime -> User
ScheduleTime.belongsTo(User, {
  foreignKey: "userId",
  as: "scheduleUser", // ⚠️ mudou de "user" para "scheduleUser"
});
User.hasMany(ScheduleTime, {
  foreignKey: "userId",
  as: "scheduleTimes", // ok
});

// ===================== Room -> ScheduleTime =====================
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
