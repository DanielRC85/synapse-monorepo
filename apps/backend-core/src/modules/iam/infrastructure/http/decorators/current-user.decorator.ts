import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TokenPayload } from '../../../domain/ports/token-service.port';

export const CurrentUser = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: TokenPayload = request.user;

    return data ? user?.[data] : user;
  },
);