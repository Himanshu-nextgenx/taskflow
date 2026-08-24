
import prisma from "../../../config/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../../../utils/appError"; 
import { UserRole } from "../../../../generated/prisma/enums";
export class OrganizationService {

  public async createMemberByAdmin(
    adminUserId: string,
    organizationId: string,
    dto: { name: string; email: string; password: string , role?: "org_admin" | "member"}
  ) {

    
    const adminMembership = await prisma.orgMember.findFirst({
      where: { userId: adminUserId, organizationId },
    });

    if (!adminMembership || adminMembership.role !== UserRole.org_admin) {
      throw new AppError("Only org admins can create members", 403,"ADMIN_ONLY");
    }

   
    const existingUser = await prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existingUser) {
      throw new AppError("User with this email already exists", 409 , "USER_EXISTS");
    }

   
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: passwordHash,
        memberships: {
          create: {
            organizationId: organizationId,
            role: dto.role ||"member",
          },
        },
      },
    });

    return {
      message: "Member created and added to organization successfully",
      data: { userId: newUser.id, name: newUser.name, email: newUser.email, role: "member" },
    };
  }
}