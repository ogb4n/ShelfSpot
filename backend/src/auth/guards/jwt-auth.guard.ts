import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard: canActivate called');
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log('JwtAuthGuard: Authorization header:', authHeader);
    
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('JwtAuthGuard: handleRequest called');
    console.log('JwtAuthGuard: err:', err);
    console.log('JwtAuthGuard: user:', user);
    console.log('JwtAuthGuard: info:', info);
    
    if (err || !user) {
      console.log('JwtAuthGuard: Throwing UnauthorizedException');
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}
