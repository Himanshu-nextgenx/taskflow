
import { Request, Response, NextFunction } from "express";
import { OrganizationService } from "../service/organization.service";

export class OrganizationController {
  private orgService = new OrganizationService();

  createMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminUserId = req.user?.userId;
      const organizationId = req.user?.organizationId;

      if (!adminUserId || !organizationId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { name, email, password } = req.body;

      const result = await this.orgService.createMemberByAdmin(adminUserId, organizationId, { name, email, password });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };
}