import prisma from "../../../config/prisma";
import { ProjectResponse } from "../../../types/project.type";
import { AppError } from "../../../utils/appError";
import { CreateProjectDto, UpdateProjectDto } from "../../../validations/project.validator";

export class ProjectService {
  public async createProject(
    organizationId: string,
    dto: CreateProjectDto,
  ): Promise<ProjectResponse> {
    const project = await prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        organizationId: organizationId,
      },

       
    });
   return project 
  }

  public async getProjectById(organizationId: string, projectId: string){
     const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: organizationId,   
        deletedAt: null,
      },
    });
      if (!project) {
    throw new AppError(
      "Project not found",
      404,
      "PROJECT_NOT_FOUND"
    );
  }

  if (project.organizationId !== organizationId) {
    throw new AppError(
      "Forbidden",
      403,
      "FORBIDDEN"
    );
  }
    
    return project 
  }


  public async getAllProjects(organizationId: string, page: number, limit: number){
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where: { organizationId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({
        where: { organizationId, deletedAt: null },
      }),
    ]);

    return { data, total, page, limit };
  }

  public async updateProject(
  organizationId: string,
  projectId: string,
  dto: UpdateProjectDto
): Promise<ProjectResponse> {

    const existingProject = await prisma.project.findFirst({
    where: { id: projectId, organizationId, deletedAt: null },
  });

  if (!existingProject) {
  throw new AppError(
    "Project not found",
    404,
    "PROJECT_NOT_FOUND"
  );
}

if (existingProject.organizationId !== organizationId) {
  throw new AppError(
    "Forbidden",
    403,
    "FORBIDDEN"
  );}
    const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: dto.name,
      description: dto.description,
    },
  });

  return updatedProject;
}
public async deleteProject(organizationId: string, projectId: string) {

  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, organizationId, deletedAt: null },
  });

  if (!existingProject) {
  throw new AppError(
    "Project not found",
    404,
    "PROJECT_NOT_FOUND"
  );
}

if (existingProject.organizationId !== organizationId) {
  throw new AppError(
    "Forbidden",
    403,
    "FORBIDDEN"
  );}

  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },   
  });

  return { message: "Project deleted successfully" };
}
public async getProjectDashboard(organizationId: string, projectId: string) {

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId, deletedAt: null },
  });

  if (!project) {
  throw new AppError(
    "Project not found",
    404,
    "PROJECT_NOT_FOUND"
  );
}

if (project.organizationId !== organizationId) {
  throw new AppError(
    "Forbidden",
    403,
    "FORBIDDEN"
  );}

  const counts = await prisma.task.groupBy({
    by: ["status"],
    where: { projectId, deletedAt: null },
    _count: { status: true },
  });

  const result = { todo: 0, in_progress: 0, review: 0, done: 0 };
  counts.forEach((c) => {
    result[c.status as keyof typeof result] = c._count.status;
  });

  return result;
}
}
  


