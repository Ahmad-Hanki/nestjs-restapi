import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { verify, hash } from 'argon2';
import { AuthJwtPayload } from 'shared/types';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async validateLocalUser(createAuthDto: Prisma.UserCreateInput) {
    const { email, password } = createAuthDto;
    console.log('AuthService.validateLocalUser called2 ');

    if (!email || !password) {
      throw new HttpException(
        {
          message: 'Email and password are required',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException(
        {
          message: 'Invalid email or password',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const isPasswordValid = await verify(user?.password ?? '', password);
      if (!isPasswordValid) {
        throw new HttpException(
          {
            message: 'Invalid email or password',
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (err) {
      throw new HttpException(
        {
          message: 'Error verifying password',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return await this.login(user);
  }

  async login(user: User) {
    const tokens = await this.generateTokens(user.id);
    return { ...user, ...tokens };
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { userId: userId };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: await hash(refreshToken) },
    });

    return { accessToken, refreshToken };
  }

  async validateJwtUser(userId: number) {
    // Passport JWT validate callback
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        {
          message: 'User not found',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { refreshToken, password, ...rest } = user;
    return rest;
  }

  async refreshToken(oldAccessToken: string) {
    try {
      // 1. Decode old access token (we only need userId)
      const payload = this.jwtService.decode(
        oldAccessToken,
      ) as AuthJwtPayload | null;
      if (!payload?.userId) {
        throw new HttpException(
          {
            message: 'Invalid token payload',
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 2. Get user and check refresh token
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.refreshToken) {
        throw new HttpException(
          {
            message: 'No refresh token found',
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 3. (Optional) You can verify that stored refresh token hasn’t expired
      // But since JWT handles expiry internally, this is usually enough.

      // 4. Generate new tokens
      const { accessToken, refreshToken } = await this.generateTokens(user.id);

      return { accessToken, refreshToken };
    } catch {
      throw new HttpException(
        {
          message: 'Could not refresh token',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async validateGoogleUser(googleUser: Prisma.UserCreateInput) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user) {
      const { password, refreshToken, ...rest } = user;
      return rest;
    } else {
      const newUser = await this.prisma.user.create({
        data: {
          ...googleUser,
        },
      });
      const { password, refreshToken, ...rest } = newUser;
      return rest;
    }
  }
}
