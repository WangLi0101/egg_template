import {
  HTTPController,
  HTTPMethod,
  HTTPMethodEnum,
  Inject,
  HTTPContext,
  type Context,
} from "egg";
import { RoleService } from "../service/role.ts";

@HTTPController({
  path: "/role",
})
export class RoleController {
  @Inject()
  roleService: RoleService;

  @HTTPMethod({
    method: HTTPMethodEnum.POST,
    path: "/",
  })
  async create(@HTTPContext() ctx: Context) {
    ctx.validate(
      {
        name: { type: "string", required: true, max: 50 },
        code: { type: "string", required: true, max: 50 },
        description: { type: "string", required: false },
        sort: { type: "number", required: false },
        permissionIds: { type: "array", required: false, itemType: "number" },
        menuIds: { type: "array", required: false, itemType: "number" },
      },
      ctx.request.body,
    );
    const { name, code, description, sort, permissionIds, menuIds } = ctx.request.body as {
      name: string;
      code: string;
      description?: string;
      sort?: number;
      permissionIds?: number[];
      menuIds?: number[];
    };
    return this.roleService.create(name, code, description, sort, permissionIds, menuIds);
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
        description: { type: "string", required: false },
        status: { type: "number", required: false },
        sort: { type: "number", required: false },
        permissionIds: { type: "array", required: false, itemType: "number" },
        menuIds: { type: "array", required: false, itemType: "number" },
      },
      ctx.request.body,
    );
    const { name, description, status, sort, permissionIds, menuIds } = ctx.request.body as {
      name?: string;
      description?: string;
      status?: number;
      sort?: number;
      permissionIds?: number[];
      menuIds?: number[];
    };
    return this.roleService.update(id, name, description, status, sort, permissionIds, menuIds);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.DELETE,
    path: "/:id",
  })
  async delete(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    await this.roleService.delete(id);
    return null;
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/:id",
  })
  async getById(@HTTPContext() ctx: Context) {
    const id = parseInt(ctx.params!.id, 10);
    return this.roleService.getById(id);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/",
  })
  async list(@HTTPContext() ctx: Context) {
    const { page, pageSize, name, code, status } = ctx.query as {
      page?: string;
      pageSize?: string;
      name?: string;
      code?: string;
      status?: string;
    };
    return this.roleService.list(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10,
      name,
      code,
      status !== undefined ? parseInt(status, 10) : undefined,
    );
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: "/all",
  })
  async getAll() {
    return this.roleService.getAll();
  }
}