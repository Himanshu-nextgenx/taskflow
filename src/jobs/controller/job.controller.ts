import { Request, Response, NextFunction } from "express";
import { emailQueue } from "../queues/email.queue";
import { AppError } from "../../utils/appError";

export class JobController {
  getJobStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        throw new AppError("Invalid job ID", 400, "INVALID_JOB_ID");
      }

      const job = await emailQueue.getJob(id);

      if (!job) {
        throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
      }

      const state = await job.getState();

      return res.status(200).json({
        data: {
          jobId: job.id,
          status: state,
          data: job.data,
          attemptsMade: job.attemptsMade,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
