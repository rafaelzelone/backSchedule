import express from "express";
import routes from "./routes";
import cors from "cors";
import { start } from "./services/start.service";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(express.json());
app.use(routes);

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      message: "JSON inválido no corpo da requisição",
    });
  }

  next(err);
});


if (process.env.ENV === 'dev') {
  start(app);
}


export default app;
