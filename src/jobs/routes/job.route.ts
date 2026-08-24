import { Router } from "express";
import { JobController } from "../controller/job.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const jobController=new JobController();

export const jobrouter =Router()

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Background job status endpoints
 */

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get background job status
 *     description: Returns the current state and result of a background job (e.g. email sending, report generation).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID returned when the job was queued
 *         example: "bull:email:42"
 *     responses:
 *       200:
 *         description: Job status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobId:
 *                   type: string
 *                   example: "42"
 *                 state:
 *                   type: string
 *                   enum: [waiting, active, completed, failed, delayed]
 *                   example: completed
 *                 result:
 *                   type: object
 *                   nullable: true
 *                   description: Job result payload (present when state is completed)
 *                 failedReason:
 *                   type: string
 *                   nullable: true
 *                   description: Error message (present when state is failed)
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
jobrouter.get("/jobs/:id", authMiddleware, jobController.getJobStatus);