import {
  HTTPController,
  HTTPMethod,
  HTTPMethodEnum,
  Inject,
  HTTPContext,
  type Context,
} from "egg";
import { UserService } from "../service/user.ts";
import { BizError, ErrorCode } from "../../../common/error.ts";

@HTTPController({
  path: "/user",
})
export class UserController {
  @Inject()
  userService: UserService;
  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/",
  })
  async index() {
    return this.userService.hello();
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/error",
  })
  async error() {
    throw new BizError(ErrorCode.USER_NOT_FOUND);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.POST,
    path: "/create",
  })
  async create(@HTTPContext() ctx: Context) {
    ctx.validate(
      {
        username: { type: "string", required: true, min: 2, max: 20 },
        password: { type: "password", required: true, min: 6 },
      },
      ctx.request.body,
    );
    const { username, password } = ctx.request.body as {
      username: string;
      password: string;
    };
    return this.userService.create(username, password);
  }
}
