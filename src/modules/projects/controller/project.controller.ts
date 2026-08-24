import { Request, Response, NextFunction } from "express";
import { ProjectService } from "../service/project.service";

export class ProjectController {
  private projectService = new ProjectService();

  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description } = req.body;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        throw new Error("unauthorized");
      }

      const project = await this.projectService.createProject(organizationId, {
        name,
        description,
      });
      return res.status(201).json({
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      const projectId = req.params.id as string;

      if (!organizationId) {
        throw new Error("unauthorized");
      }

      if (!projectId) {
        throw new Error("project not found");
      }

      const project = await this.projectService.getProjectById(
        organizationId,
        projectId,
      );

      return res.status(200).json({
        data: project,
      });
    } catch (err) {
      next(err);
    }
  };

  getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        throw new Error("unauthorized");
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.projectService.getAllProjects(
        organizationId,
        page,
        limit,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };


  updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
         const organizationId = req.user?.organizationId;
      const projectId = req.params.id as string;
      const {name, description}=req.body

      if (!organizationId) {
        throw new Error("unauthorized");
      }

      if (!projectId) {
        throw new Error("project not found");
      }
 const updated = await this.projectService.updateProject(organizationId,projectId,{name,description})
        
 res.status(200).json(updated);
    } catch (error) {
         next(error);
    }
  }

  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.user?.organizationId;
      const projectId = req.params.id as string;
    

      if (!organizationId) {
        throw new Error("unauthorized");
      }

      if (!projectId) {
        throw new Error("project not found");
      } 
      const deleted = await this.projectService.deleteProject(organizationId,projectId)
      res.status(200).json(deleted);
    } catch (error) {
        next(error)
    }
  }
  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user?.organizationId;
    const projectId = req.params.id as string;

    if (!organizationId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await this.projectService.getProjectDashboard(organizationId, projectId);

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};
}
