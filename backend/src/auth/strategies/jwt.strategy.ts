import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';
import { JwtPayload, UserPayload } from '../interfaces/auth.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserPayload> {
    // console.log(
    //   'JWT Strategy: Validating payload:',
    //   JSON.stringify(payload, null, 2),
    // );

    // Vérifier que l'utilisateur existe toujours dans la base de données
    const userId = parseInt(payload.sub);
    // console.log('JWT Strategy: Looking for user with ID:', userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        admin: true,
      },
    });

    if (!user) {
      console.log('JWT Strategy: User not found for ID:', userId);
      throw new UnauthorizedException('User not found');
    }

    // console.log('JWT Strategy: User found:', user);

    const userPayload = {
      id: String(user.id), // Conversion number -> string pour compatibilité frontend
      email: user.email,
      name: user.name || undefined,
      admin: user.admin,
    };

    // console.log('JWT Strategy: Returning user payload:', userPayload);
    return userPayload;
  }
}
