import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './guards/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule, // ✅ Make ConfigService available in this module
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
