import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Prisma } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() createAuthDto: Prisma.UserCreateInput) {
    return await this.authService.validateLocalUser(createAuthDto);
  }
}
