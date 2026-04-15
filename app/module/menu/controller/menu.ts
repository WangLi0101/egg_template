import {
  HTTPController,
  HTTPMethod,
  HTTPMethodEnum,
  Inject,
  HTTPContext,
  type Context,
} from "egg";
import { MenuService } from "../service/menu.ts";
import { BizError, ErrorCode } from "../../../common/error.ts";

@HTTPController({
  path: "/menu",
})
export class MenuController {
  @Inject()
  menuService: MenuService;

  @HTTPMethod({
    method: HTTPMethodEnum.POST,
    path: "/",
  })
  async create(@HTTPContext() ctx: Context) {
    ctx.validate(
      {
        name: { type: "string", required: true, max: 50 },
        code: { type: "string", required: true, max: 100 },
        type: { type: "string", required: true },
        parentId: { type: "number", required: false },
        path: { type: "string", required: false },
        icon: { type: "string", required: false },
        component: { type: "string", required: false },
        sort: { type: "number", required: false },
      },
      ctx.request.body,
    );
    const { name, code, type, parentId, path, icon, component, sort } = ctx.request.body as {
      name: string;
      code: string;
      type: string;
      parentId?: number;
      path?: string;
      icon?: string;
      component?: string;
      sort?: number;
    };
    return this.menuService.create(name, code, type, parentId, path, icon, component, sort);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.PUT,
    path: "/:id",
  })
  async update(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    ctx.validate(
      {
        name: { type: "string", required: false, max: 50 },
        type: { type: "string", required: false },
        parentId: { type: "number", required: false },
        path: { type: "string", required: false },
        icon: { type: "string", required: false },
        component: { type: "string", required: false },
        status: { type: "number", required: false },
        sort: { type: "number", required: false },
      },
      ctx.request.body,
    );
    const { name, type, parentId, path, icon, component, status, sort } = ctx.request.body as {
      name?: string;
      type?: string;
      parentId?: number;
      path?: string;
      icon?: string;
      component?: string;
      status?: number;
      sort?: number;
    };
    return this.menuService.update(id, name, type, parentId, path, icon, component, status, sort);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.DELETE,
    path: "/:id",
  })
  async delete(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    await this.menuService.delete(id);
    return null;
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/:id",
  })
  async getById(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    return this.menuService.getById(id);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/",
  })
  async list(@HTTPContext() ctx: Context) {
    const { page, pageSize, name, code, type, status } = ctx.query as {
      page?: string;
      pageSize?: string;
      name?: string;
      code?: string;
      type?: string;
      status?: string;
    };
    return this.menuService.list(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10,
      name,
      code,
      type,
      status !== undefined ? parseInt(status, 10) : undefined,
    );
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/tree",
  })
  async getTree() {
    return this.menuService.getTree();
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/user",
  })
  async getUserMenus(@HTTPContext() ctx: Context) {
    const userId = ctx.state?.userId;
    if (!userId) {
      ctx.status = 401;
      throw new BizError(ErrorCode.UNAUTHORIZED);
    }
    return this.menuService.getUserMenus(userId);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/all",
  })
  async getAll() {
    return this.menuService.getAll();
  }
}