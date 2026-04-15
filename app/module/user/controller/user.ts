import {
  HTTPController,
  HTTPMethod,
  HTTPMethodEnum,
  Inject,
  HTTPContext,
  type Context,
} from "egg";
import { UserService } from "../service/user.ts";

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
    path: "/:id",
  })
  async getById(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    return this.userService.getById(id);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/list",
  })
  async list(@HTTPContext() ctx: Context) {
    const { page, pageSize, username, email, phone, status } = ctx.query as {
      page?: string;
      pageSize?: string;
      username?: string;
      email?: string;
      phone?: string;
      status?: string;
    };
    return this.userService.list(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10,
      username,
      email,
      phone,
      status !== undefined ? parseInt(status, 10) : undefined,
    );
  }

  @HTTPMethod({
    method: HTTPMethodEnum.PUT,
    path: "/:id",
  })
  async update(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    ctx.validate(
      {
        email: { type: "email", required: false },
        phone: { type: "string", required: false },
        nickname: { type: "string", required: false, max: 50 },
        avatar: { type: "string", required: false },
        status: { type: "number", required: false },
        roleIds: { type: "array", required: false, itemType: "number" },
      },
      ctx.request.body,
    );
    const { email, phone, nickname, avatar, status, roleIds } = ctx.request.body as {
      email?: string;
      phone?: string;
      nickname?: string;
      avatar?: string;
      status?: number;
      roleIds?: number[];
    };
    return this.userService.update(id, email, phone, nickname, avatar, status, roleIds);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.PUT,
    path: "/:id/password",
  })
  async updatePassword(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    ctx.validate(
      {
        oldPassword: { type: "string", required: true, min: 6 },
        newPassword: { type: "string", required: true, min: 6 },
      },
      ctx.request.body,
    );
    const { oldPassword, newPassword } = ctx.request.body as {
      oldPassword: string;
      newPassword: string;
    };
    await this.userService.updatePassword(id, oldPassword, newPassword);
    return null;
  }

  @HTTPMethod({
    method: HTTPMethodEnum.DELETE,
    path: "/:id",
  })
  async delete(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    await this.userService.delete(id);
    return null;
  }

  @HTTPMethod({
    method: HTTPMethodEnum.POST,
    path: "/:id/roles",
  })
  async assignRoles(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    ctx.validate(
      {
        roleIds: { type: "array", required: true, itemType: "number" },
      },
      ctx.request.body,
    );
    const { roleIds } = ctx.request.body as { roleIds: number[] };
    return this.userService.assignRoles(id, roleIds);
  }
}