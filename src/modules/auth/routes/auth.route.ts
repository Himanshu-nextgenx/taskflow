import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { authRateLimiter } from "../../../middlewares/ratelimiter";

const AuthRoute = Router()
const authController = new AuthController()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user and organization
 *     description: Creates a new user account along with an organization. The user becomes the owner/admin of the new organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, organizationName]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secret123
 *               organizationName:
 *                 type: string
 *                 example: Acme Corp
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
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
 *                     organizationName:
 *                       type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
AuthRoute.post('/register', authRateLimiter, authController.registerUser)

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     description: Authenticates a user and returns a JWT access token. A refresh token is also set as an httpOnly cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
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
 *                     organizationName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [ADMIN, MEMBER]
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token (also set as httpOnly cookie)
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
AuthRoute.post('/login', authRateLimiter, authController.loginUser)

/**
 * @swagger
 * /refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: Uses the refreshToken cookie to issue a new JWT access token and rotate the refresh token.
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Missing or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Refresh token expired or revoked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
AuthRoute.post('/refresh', authRateLimiter, authController.refresh)

/**
 * @swagger
 * /logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     description: Invalidates the refresh token and clears the refreshToken cookie.
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       400:
 *         description: No refresh token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
AuthRoute.post('/logout', authController.logout)

export default AuthRoute



