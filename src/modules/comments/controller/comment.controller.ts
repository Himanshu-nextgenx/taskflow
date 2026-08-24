
import { Request, Response, NextFunction } from "express";
import { CommentService } from "../service/comment.service";
import { createCommentSchema } from "../../../validations/comment.validator";

export class CommentController {
  private commentService = new CommentService();

  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      const userId = req.user?.userId;
      const taskId = req.params.taskId as string;

      if (!organizationId || !userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const dto = createCommentSchema.parse(req.body);

      const result = await this.commentService.createComment(organizationId, userId, taskId, dto);

      res.status(201).json({ message: "Comment added successfully", data: result });
    } catch (err) {
      next(err);
    }
  };

  getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user?.organizationId;
      const taskId = req.params.taskId as string;

      if (!organizationId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await this.commentService.getComments(organizationId, taskId);

      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  };
}