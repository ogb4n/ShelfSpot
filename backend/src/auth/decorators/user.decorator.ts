import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../interfaces/auth.interface';

// Interface pour typer la requête avec user - compatible frontend
interface RequestWithUser extends Request {
  user: UserPayload;
}

export const CurrentUser = createParamDecorator(
  <T extends keyof UserPayload>(
    data: T | undefined,
    ctx: ExecutionContext,
  ): UserPayload | UserPayload[T] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user: UserPayload = request.user;

    return data ? user[data] : user;
  },
);

export const AdminRequired = () => {
  return () => {
    // Ce décorateur peut être utilisé avec le AdminGuard
    // pour documenter les endpoints qui nécessitent des droits admin
  };
};
