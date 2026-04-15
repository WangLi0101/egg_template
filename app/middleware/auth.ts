import { Context, Application } from "egg";
import jwt from "jsonwebtoken";
import { BizError, ErrorCode } from "../common/error.ts";

export default (_options: any, app: Application) => {
  return async (ctx: Context, next: any) => {
    const authorization = ctx.get("Authorization");
    if (!authorization) {
      ctx.status = 401;
      throw new BizError(ErrorCode.UNAUTHORIZED);
    }

    const authStr = Array.isArray(authorization) ? authorization[0] : authorization;
    const token = authStr.replace("Bearer ", "");
    if (!token) {
      ctx.status = 401;
      throw new BizError(ErrorCode.UNAUTHORIZED);
    }

    try {
      const jwtConfig = app.config.jwt;
      const payload = jwt.verify(token, jwtConfig.secret) as {
        userId: number;
        username: string;
      };
      ctx.state.userId = payload.userId;
      ctx.state.username = payload.username;
      await next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        ctx.status = 401;
        throw new BizError(ErrorCode.TOKEN_EXPIRED);
      }
      ctx.status = 401;
      throw new BizError(ErrorCode.TOKEN_INVALID);
    }
  };
};