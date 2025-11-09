import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/jwt-auth-roles.guard';
import { Roles } from 'shared/decorators/roles.decorator';
import { CurrentUser } from 'shared/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from 'src/auth/guards/jwt-auth-optional.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.userService.create(createUserDto);
  }

  // @UseGuards(OptionalJwtAuthGuard)  // any user including unauthenticated
  // @CurrentUser() user; // inside the method

  // @UseGuards(JwtAuthGuard, RolesGuard) only admin
  // @Roles('ADMIN')

  // @UseGuards(JwtAuthGuard) // any logged in user

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(JwtAuthGuard) // any logged in user
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard) // any user including unauthenticated
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: Prisma.UserGetPayload<{}>,
  ) {
    // if (user.role !== 'ADMIN' && user.id !== Number(id)) {
    //   throw new ForbiddenException('Not allowed');
    //   only admin or owner if they are authenticated
    // }

    return this.userService.findOne(+id, user);
  }
}
