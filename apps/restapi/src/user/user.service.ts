import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: Prisma.UserCreateInput) {
    const { name, email, password } = createUserDto;

    if (!name || !email || !password) {
      throw new HttpException(
        {
          message: 'Name, email, and password are required',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await hash(password);

    try {
      const user = await this.prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      return user; // will be wrapped by the global ResponseInterceptor
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' // Unique constraint failed
      ) {
        throw new HttpException(
          {
            message: 'User with this email already exists',
            error: 'Conflict',
          },
          HttpStatus.CONFLICT,
        );
      }

      // For all other errors, fallback to 500
      throw new HttpException(
        {
          message: 'Internal server error',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: number, user: Prisma.UserGetPayload<{}>) {
    return {
      user: user?.name ?? 'No User',
    };
  }
}
