import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../generated/prisma/enums";

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const admin = req.user?.role
  if(admin===UserRole.org_admin){
    return res.status(403).json({
      error: "Only organization admins can perform this action",
      message:"only admin access"
  });
  
}
next();
}