import jwt from 'jsonwebtoken';
import { UserRole } from '../../generated/prisma/enums';
import { UserPayload } from '../types/auth.type';


export function accessTokenGenerator(payload: object): string {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: '15m',
  });
  return accessToken;
}

export function refreshTokenGenerator(payload: object): string {
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: '7d',
  });
  return refreshToken;
} 
export function verifyAccessToken(token: string): { userId: string; name: string; email: string ; organizationId: string ;
      role: UserRole ;} {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as UserPayload
}


export function verifyRefreshToken(token: string): { userId: string; tokenId: string } {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as {
    userId: string;
    tokenId: string;
  };
}
