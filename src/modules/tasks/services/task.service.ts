// src/modules/task/service/task.service.ts
import prisma from "../../../config/prisma";
import { emailQueue } from "../../../jobs/queues/email.queue";
import { AppError } from "../../../utils/appError";
import { CreateTaskDto, UpdateTaskDto } from "../../../validations/task.validator";

export class TaskService {


  public async createTask(organizationId: string, dto: CreateTaskDto) {
    const project = await prisma.project.findFirst({
      where: { id: dto.projectId, organizationId, deletedAt: null },
    });

    if (!project) {
       throw new Error("project not found ");
    }

    const task = await prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || "todo",
        priority: dto.priority || "medium",
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        projectId: dto.projectId,
      },
    });

    return task;
  }

  
  public async getTasks(
    organizationId: string,
    filters: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      dueDateFrom?: string;
      dueDateTo?: string;
    },
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;


    const where: any = {
      deletedAt: null,
      project: {
        organizationId: organizationId,  
      },
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assigneeId) {
      where.assignments = {
        some: { userId: filters.assigneeId },   
      };
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo);
    }

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return { data, total, page, limit };
  }

 
  public async getTaskById(organizationId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        project: { organizationId },  
      },
      include: {
        project:true,
        assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
        comments: true,
        
      },
    });

   if (!task) {
  throw new AppError(
    "Task not found",
    404,
    "TASK_NOT_FOUND"
  );
}

if (task.project.organizationId !== organizationId) {
  throw new AppError(
    "Forbidden",
    403,
    "FORBIDDEN"
  );
}

    return task;
  }

 
  public async updateTask(organizationId: string, taskId: string, dto: UpdateTaskDto) {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null, project: { organizationId } },
      include:{
        project:true
      }
    });

if (!existingTask) {
  throw new AppError(
    "Task not found",
    404,
    "TASK_NOT_FOUND"
  );
}

if (existingTask.project.organizationId !== organizationId) {
  throw new AppError(
    "Forbidden",
    403,
    "FORBIDDEN"
  );
}

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    return updatedTask;
  }


  public async deleteTask(organizationId: string, taskId: string) {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null, project: { organizationId } },
      include:{
        project:true
        }
      });

   if (!existingTask) {
  throw new AppError(
    "Task not found",
    404,
    "TASK_NOT_FOUND"
  );
}

if (existingTask.project.organizationId !== organizationId) {
  throw new AppError(
    "Forbidden",
    403,
    "FORBIDDEN"
  );
}

    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    return { message: "Task deleted successfully" };
  }


  public async assignTask(organizationId: string, taskId: string, assigneeUserId: string) {

  
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null, project: { organizationId } },
      include:{
        project:true
      }
    });
if (!task) {
  throw new AppError(
    "Task not found",
    404,
    "TASK_NOT_FOUND"
  );
}

if (task.project.organizationId !== organizationId) {
  throw new AppError(
    "Forbidden",
    403,
    "FORBIDDEN"
  );
}

    
    const assigneeMembership = await prisma.orgMember.findFirst({
      where: { userId: assigneeUserId, organizationId },
    });

    if (!assigneeMembership) {
        throw new AppError("Assigned user must belong to the same organization",400,"USER_NOT_IN_ORGANIZATION")
    
    }


    const existingAssignment = await prisma.taskAssignment.findFirst({
      where: { taskId, userId: assigneeUserId },
    });

    if (existingAssignment) {
        throw new AppError("User is already assigned to this task",409,"ALREADY_ASSIGNED")
    }

    
    const assignment = await prisma.taskAssignment.create({
      data: { taskId, userId: assigneeUserId },
    });
     const assignedUser = await prisma.user.findUnique({ where: { id: assigneeUserId } });

 const job = await emailQueue.add(
    "send-assignment-email",
    {
      to: assignedUser!.email,
      taskId: taskId,
      taskTitle: task.title,
    },
    {
      attempts: 3,                          
      backoff: { type: "exponential", delay: 1000 },  
    }
  );

    return {
        assignment,
        jobId: job.id, 
    };
  }

 
  public async unassignTask(organizationId: string, taskId: string, assigneeUserId: string) {

    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null, project: { organizationId } },
      include:{
        project:true
      }
    });

   if (!task) {
  throw new AppError(
    "Task not found",
    404,
    "TASK_NOT_FOUND"
  );
}

if (task.project.organizationId !== organizationId) {
  throw new AppError(
    "Forbidden",
    403,
    "FORBIDDEN"
  );
}

    const assignment = await prisma.taskAssignment.findFirst({
      where: { taskId, userId: assigneeUserId },
    });

    if (!assignment) {
     throw new Error("assignment not found ")
    }
const deletedAssignment = await prisma.taskAssignment.delete({
  where: { id: assignment.id },
});

console.log("DELETED:", deletedAssignment);

const checkAssignment = await prisma.taskAssignment.findUnique({
  where: { id: assignment.id },
});

console.log("AFTER DELETE:", checkAssignment);

return {
  message: "User unassigned from task successfully",
};
}
}