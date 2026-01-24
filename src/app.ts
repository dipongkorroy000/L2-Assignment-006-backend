import express, {Request, Response} from "express";
import {routes} from "./routes";
import cors from "cors";
import {envVars} from "./config/env";
import {globalErrorHandler} from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import cookieParser from "cookie-parser";
import expressSession from "express-session";

const app = express();
app.use(expressSession({secret: envVars.EXPRESS_SESSION_SECRET, resave: false, saveUninitialized: false}));

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors({origin: envVars.FRONT_URL, credentials: true}));
app.use(cookieParser());

app.use("/api/v1", routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use(notFound);

app.use(globalErrorHandler);

export default app;
