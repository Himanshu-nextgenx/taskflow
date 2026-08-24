
import { Request, Response, NextFunction } from "express";

import { createTaskSchema, updateTaskSchema } from "../../../validations/task.validator";
import { TaskService } from "../services/task.service";

export class TaskController {
  private taskService = new TaskService();


  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const dto = createTaskSchema.parse(req.body);

      const result = await this.taskService.createTask(organizationId, dto);

      res.status(201).json({
        message: "Task created successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  
  getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters = {
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        assigneeId: req.query.assigneeId as string | undefined,
        dueDateFrom: req.query.dueDateFrom as string | undefined,
        dueDateTo: req.query.dueDateTo as string | undefined,
      };

      const result = await this.taskService.getTasks(organizationId, filters, page, limit);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      const taskId = req.params.id as string;

      if (!organizationId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const task = await this.taskService.getTaskById(organizationId, taskId);

      res.status(200).json({ data: task });
    } catch (err) {
      next(err);
    }
  };

 
  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      const taskId = req.params.id as string;

      if (!organizationId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const dto = updateTaskSchema.parse(req.body);

      const result = await this.taskService.updateTask(organizationId, taskId, dto);

      res.status(200).json({
        message: "Task updated successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  
  deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      const taskId = req.params.id as string;

      if (!organizationId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await this.taskService.deleteTask(organizationId, taskId);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  
  assignTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      const taskId = req.params.id as string;
      const { userId } = req.body; // jisko assign karna hai

      if (!organizationId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const result = await this.taskService.assignTask(organizationId, taskId, userId);

      res.status(201).json({
        message: "Task assigned successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  
  unassignTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      const taskId = req.params.id as string;
      const { userId } = req.body;

      if (!organizationId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const result = await this.taskService.unassignTask(organizationId, taskId, userId);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}