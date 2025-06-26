import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';
import { JwtPayload, UserPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<UserPayload> {
    // Vérifier que l'utilisateur existe toujours dans la base de données
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(payload.sub) }, // Conversion string -> number pour Prisma
      select: {
        id: true,
        email: true,
        name: true,
        admin: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: String(user.id), // Conversion number -> string pour compatibilité frontend
      email: user.email,
      name: user.name || undefined, // null -> undefined pour compatibilité frontend
      admin: user.admin,
    };
  }
}
