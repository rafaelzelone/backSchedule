import app from "./app";
import { sequelize } from "./config/database";

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
  });
});
