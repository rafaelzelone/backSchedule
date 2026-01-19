import app from "./app";
import { sequelize } from "./config/database";

sequelize.sync().then(() => {
  app.listen(21103, () => {
    console.log("🚀 Server running on port 3000");
  });
});
