import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { AuthJwtPayload } from 'shared/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  validate(payload: AuthJwtPayload) {
    const userid = payload.userId;
    return this.authService.validateJwtUser(userid);
  }
}

// req.user
