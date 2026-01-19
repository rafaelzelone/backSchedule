import { sequelize } from "../models";

export async function start(app: any) {
  try {
    await sequelize.authenticate();
    console.log("📦 Banco conectado");

    await sequelize.sync({ alter: true });
    console.log("🛠️ Tabelas sincronizadas");

    app.listen(3000, () => {
      console.log("🚀 Server rodando");
    });
  } catch (error) {
    console.error("Erro ao iniciar app:", error);
  }
}