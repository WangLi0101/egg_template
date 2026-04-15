import {
  HTTPController,
  HTTPMethod,
  HTTPMethodEnum,
  Inject,
  HTTPContext,
  type Context,
} from "egg";
import { AuthService } from "../service/auth.ts";
import { BizError, ErrorCode } from "../../../common/error.ts";

@HTTPController({
  path: "/auth",
})
export class AuthController {
  @Inject()
  authService: AuthService;

  @HTTPMethod({
    method: HTTPMethodEnum.POST,
    path: "/register",
  })
  async register(@HTTPContext() ctx: Context) {
    ctx.validate(
      {
        username: { type: "string", required: true, min: 2, max: 50 },
        password: { type: "string", required: true, min: 6 },
        email: { type: "email", required: false },
        phone: { type: "string", required: false },
        nickname: { type: "string", required: false, max: 50 },
      },
      ctx.request.body,
    );
    const { username, password, email, phone, nickname } = ctx.request.body as {
      username: string;
      password: string;
      email?: string;
      phone?: string;
      nickname?: string;
    };
    return this.authService.register(username, password, email, phone, nickname);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.POST,
    path: "/login",
  })
  async login(@HTTPContext() ctx: Context) {
    ctx.validate(
      {
        username: { type: "string", required: true },
        password: { type: "string", required: true },
      },
      ctx.request.body,
    );
    const { username, password } = ctx.request.body as {
      username: string;
      password: string;
    };
    return this.authService.login(username, password);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/userinfo",
  })
  async getUserInfo(@HTTPContext() ctx: Context) {
    const authorization = ctx.get("Authorization");
    if (!authorization) {
      ctx.status = 401;
      throw new BizError(ErrorCode.UNAUTHORIZED);
    }
    const authStr = Array.isArray(authorization) ? authorization[0] : authorization;
    const token = authStr.replace("Bearer ", "");
    const payload = this.authService.verifyToken(token);
    return this.authService.getUserInfo(payload.userId);
  }
}