 import dotenv from "dotenv";
 import cookieParser from "cookie-parser";
import express from 'express';
dotenv.config(); 

import AuthRoute from './modules/auth/routes/auth.route';
import projectRoute from "./modules/projects/routes/project.route";
import taskRouter from "./modules/tasks/routes/task.route";
import orgRouter from "./modules/organization/routes/organization.route";
import "./jobs/workers/email.worker"
import commentRouter from "./modules/comments/routes/comment.route";
import { jobrouter } from "./jobs/routes/job.route";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";





export const app = express();
app.use(cookieParser());
app.use(express.json());
 

// Swagger UI — accessible at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api',AuthRoute);
app.use('/api',projectRoute);
app.use('/api',taskRouter);
app.use('/api',orgRouter)
app.use('/api',commentRouter)
app.use('/api',jobrouter)
app.get('/', (req, res) => {
  res.send('taskflow  backend is running ');
});
