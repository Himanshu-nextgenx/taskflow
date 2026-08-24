import { LoginUserDto, RegisterUserDto } from "../../../types/auth.type";
import { AuthService } from "../service/auth.service";

import { Request, Response, NextFunction } from "express";

export class AuthController {
  private authService = new AuthService();

  registerUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: RegisterUserDto = req.body;

      const register = await this.authService.registerUser(dto);
      res.status(201).json(register);
    } catch (error) {
      next(error);
    }
  }

    loginUser= async(req: Request, res: Response, next: NextFunction) =>{
    try {
      const dto: LoginUserDto = req.body;

      const login = await this.authService.loginUser(dto);

      res.cookie("refreshToken", login.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });
      res.status(200).json(login);
    } catch (error) {
      next(error);
    }
  }

   refresh = async (req: Request, res: Response, next: NextFunction) =>{
    try {
      const  refreshToken  = req.cookies.refreshToken;


      if (!refreshToken) {
        res.status(400).json({
          message: "invaild refresh token ",
        });
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });
      res.status(200).json({
        message: "Token refreshed successfully",
        data: result, 
      });
    } catch (err) {
      next(err);
    }
  }
logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken  = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new Error("Refresh token is required");
      }

      const result = await this.authService.logout(refreshToken);

        res.clearCookie("refreshToken");

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
