// src/modules/comment/service/comment.service.ts
import prisma from "../../../config/prisma";
import { CreateCommentDto } from "../../../validations/comment.validator";

export class CommentService {


  public async createComment(organizationId: string, userId: string, taskId: string, dto: CreateCommentDto) {

   
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null, project: { organizationId } },
    });

    if (!task) {
      throw new Error("Task not found ")
    }

    const comment = await prisma.comment.create({
      data: {
        content: dto.content,
        taskId: taskId,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return comment;
  }

 
  public async getComments(organizationId: string, taskId: string) {

   
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null, project: { organizationId } },
    });

    if (!task) {
      throw new Error("Task not found ")
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },  
    });

    return comments;
  }
}