import { UserRole } from "../../generated/prisma/enums";

interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

interface LoginUserDto {
  email: string;
  password: string;
}

interface RegisterResponseDto {
  message: string;
  data: {
    userId: string;
    name: string;
    email: string;
    organizationId:string,
      organizationName:string
  };
}

interface LoginResponseDto {
  message: string;
  data: {
    userId: string;
    name: string;
    email: string;
     organizationId: string,
    organizationName: string,
    role: UserRole,
  };
  accessToken: string;
  refreshToken: string;
}

interface UserPayload {
  userId: string;
  name: string;
  email: string;
 organizationId: string;
  role: UserRole;
}

export {
  RegisterUserDto,
  LoginUserDto,
  RegisterResponseDto,
  LoginResponseDto,
  UserPayload,
};
