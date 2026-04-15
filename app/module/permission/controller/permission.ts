import {
  HTTPController,
  HTTPMethod,
  HTTPMethodEnum,
  Inject,
  HTTPContext,
  type Context,
} from "egg";
import { PermissionService } from "../service/permission.ts";

@HTTPController({
  path: "/permission",
})
export class PermissionController {
  @Inject()
  permissionService: PermissionService;

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
        method: { type: "string", required: false },
        description: { type: "string", required: false },
        sort: { type: "number", required: false },
      },
      ctx.request.body,
    );
    const { name, code, type, parentId, path, method, description, sort } = ctx.request.body as {
      name: string;
      code: string;
      type: string;
      parentId?: number;
      path?: string;
      method?: string;
      description?: string;
      sort?: number;
    };
    return this.permissionService.create(name, code, type, parentId, path, method, description, sort);
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
        method: { type: "string", required: false },
        description: { type: "string", required: false },
        status: { type: "number", required: false },
        sort: { type: "number", required: false },
      },
      ctx.request.body,
    );
    const { name, type, parentId, path, method, description, status, sort } = ctx.request.body as {
      name?: string;
      type?: string;
      parentId?: number;
      path?: string;
      method?: string;
      description?: string;
      status?: number;
      sort?: number;
    };
    return this.permissionService.update(id, name, type, parentId, path, method, description, status, sort);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.DELETE,
    path: "/:id",
  })
  async delete(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    await this.permissionService.delete(id);
    return null;
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/:id",
  })
  async getById(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    return this.permissionService.getById(id);
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
    return this.permissionService.list(
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
    return this.permissionService.getTree();
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/all",
  })
  async getAll() {
    return this.permissionService.getAll();
  }
}