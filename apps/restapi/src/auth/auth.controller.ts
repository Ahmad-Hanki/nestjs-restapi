import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Prisma } from '@prisma/client';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() createAuthDto: Prisma.UserCreateInput) {
    return await this.authService.validateLocalUser(createAuthDto);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Request() req, @Res() res) {
    const userData = await this.authService.login(req.user);
    res.redirect(
      `http://localhost:3000/api/auth/google/success?accessToken=${userData.accessToken}&role=${userData.role}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  verifyUser() {
    return 'ok';
  }
}
