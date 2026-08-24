
import { Router } from "express";
import { OrganizationController } from "../controller/organization.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const orgRouter = Router();
const orgController = new OrganizationController();

/**
 * @swagger
 * tags:
 *   name: Organization
 *   description: Organization management endpoints
 */

/**
 * @swagger
 * /organizations/members:
 *   post:
 *     tags: [Organization]
 *     summary: Create a new organization member
 *     description: Allows an admin to add a new member to their organization. The new member gets the MEMBER role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Smith
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@acmecorp.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: temporaryPass123
 *     responses:
 *       201:
 *         description: Member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Member created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     organizationId:
 *                       type: string
 *                       format: uuid
 *                     role:
 *                       type: string
 *                       example: MEMBER
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — only admins can create members
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
orgRouter.post("/organizations/members", authMiddleware, orgController.createMember);

export default orgRouter;