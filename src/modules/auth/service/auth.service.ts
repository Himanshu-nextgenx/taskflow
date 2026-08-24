import bcrypt from "bcryptjs";
import prisma from "../../../config/prisma";
import {
  LoginResponseDto,
  LoginUserDto,
  RegisterResponseDto,
  RegisterUserDto,
} from "../../../types/auth.type";
import {
  accessTokenGenerator,
  refreshTokenGenerator,
  verifyRefreshToken,
} from "../../../utils/tokens";
import { UserRole } from "../../../../generated/prisma/enums";

export class AuthService {
  public async registerUser(
    dto: RegisterUserDto,
  ): Promise<RegisterResponseDto> {
    const { name, email, password, organizationName } = dto;

    const isUserExists = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (isUserExists) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: passwordHash,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      await tx.orgMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: UserRole.org_admin,
        },
      });

      return {
        user,
        organization,
      };
    });

    return {
      message: "User registered successfully",
      data: {
        userId: result.user.id,
        organizationId: result.organization.id,
        organizationName: result.organization.name,
        name: result.user.name,
        email: result.user.email,
      },
    };
  }

  public async loginUser(dto: LoginUserDto): Promise<LoginResponseDto> {
    const { email, password } = dto;

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
    if (!user) {
      throw new Error("Invalid email or password");
    }

const membership = await prisma.orgMember.findFirst({
  where: {
    userId: user.id,
  },
   include: {
    organization: true,
  },
});

if (!membership) {
  throw new Error("User is not a member of any organization");
}

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const accessToken = accessTokenGenerator({
      userId: user.id,
      name: user.name,
      email: user.email,
      organizationId: membership?.organizationId,
      role: membership?.role,
    });

    const newRecord = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: "",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const refreshToken = refreshTokenGenerator({
      userId: user.id,
      tokenId: newRecord.id,

    });

    await prisma.refreshToken.update({
      where: { id: newRecord.id },
      data: { tokenHash: await bcrypt.hash(refreshToken, 12) },
    });

  return {
  message: "Login successful",
  data: {
    userId: user.id,
    name: user.name,
    email: user.email,
    organizationId: membership.organizationId,
    organizationName: membership.organization.name,
    role: membership.role,
  },
  accessToken,
  refreshToken,
};
  }

  public async refreshToken(
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new Error("Invalid or expired refresh token");
    }

    const record = await prisma.refreshToken.findFirst({
      where: { id: payload.tokenId, userId: payload.userId },
      include: { user: true },
    });

    if (!record || record.revoked || new Date() > record.expiresAt) {
      throw new Error("Invalid, expired, or revoked refresh token");
    }

    const isValidToken = await bcrypt.compare(
      rawRefreshToken,
      record.tokenHash,
    );
    if (!isValidToken) {
      throw new Error("Invalid refresh token");
    }
    const membership = await prisma.orgMember.findFirst({
  where: {
    userId: record.user.id,
  },
   include: {
    organization: true,
  },
});

if (!membership) {
  throw new Error("User is not a member of any organization");
}

    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revoked: true },
    });

    const accessToken = accessTokenGenerator({
      userId: record.user.id,
      name: record.user.name,
      email: record.user.email,
      organizationId: membership?.organizationId,
      role: membership?.role,

    });

    const newRecord = await prisma.refreshToken.create({
      data: {
        userId: record.user.id,
        tokenHash: "",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const newRefreshToken = refreshTokenGenerator({
      userId: record.user.id,
      tokenId: newRecord.id,
    });

    await prisma.refreshToken.update({
      where: { id: newRecord.id },
      data: { tokenHash: await bcrypt.hash(newRefreshToken, 12) },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  public async logout(rawRefreshToken: string): Promise<{ message: string }> {
    try {
      const payload = verifyRefreshToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { id: payload.tokenId },
        data: { revoked: true },
      });
    } catch {}

    return { message: "Logged out successfully" };
  }
}
