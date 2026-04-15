import { SingletonProto, AccessLevel } from "egg";
import prisma from "../../../common/prisma.ts";
import { BizError, ErrorCode } from "../../../common/error.ts";
import { PermissionVO, PermissionTreeVO, PermissionListVO } from "../vo/permissionVo.ts";
import { toResponseVO } from "../../../common/transformer.ts";

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class PermissionService {
  async create(
    name: string,
    code: string,
    type: string,
    parentId?: number,
    path?: string,
    method?: string,
    description?: string,
    sort?: number,
  ): Promise<PermissionVO> {
    const existPermission = await prisma.permission.findUnique({
      where: { code },
    });
    if (existPermission) {
      throw new BizError(ErrorCode.PERMISSION_EXISTS);
    }

    if (parentId) {
      const parent = await prisma.permission.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BizError(ErrorCode.PERMISSION_NOT_FOUND, "父权限不存在");
      }
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        code,
        type,
        parentId,
        path,
        method,
        description,
        sort: sort || 0,
      },
    });

    return toResponseVO(PermissionVO, permission);
  }

  async update(
    id: number,
    name?: string,
    type?: string,
    parentId?: number,
    path?: string,
    method?: string,
    description?: string,
    status?: number,
    sort?: number,
  ): Promise<PermissionVO> {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new BizError(ErrorCode.PERMISSION_NOT_FOUND);
    }

    if (parentId) {
      if (parentId === id) {
        throw new BizError(ErrorCode.PARAM_ERROR, "父权限不能是自己");
      }
      const parent = await prisma.permission.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BizError(ErrorCode.PERMISSION_NOT_FOUND, "父权限不存在");
      }
    }

    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: {
        name,
        type,
        parentId,
        path,
        method,
        description,
        status,
        sort,
      },
    });

    return toResponseVO(PermissionVO, updatedPermission);
  }

  async delete(id: number): Promise<void> {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new BizError(ErrorCode.PERMISSION_NOT_FOUND);
    }

    const children = await prisma.permission.findMany({
      where: { parentId: id },
    });
    if (children.length > 0) {
      throw new BizError(ErrorCode.PARAM_ERROR, "存在子权限，无法删除");
    }

    await prisma.permission.delete({
      where: { id },
    });
  }

  async getById(id: number): Promise<PermissionVO> {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new BizError(ErrorCode.PERMISSION_NOT_FOUND);
    }
    return toResponseVO(PermissionVO, permission);
  }

  async list(
    page: number = 1,
    pageSize: number = 10,
    name?: string,
    code?: string,
    type?: string,
    status?: number,
  ): Promise<PermissionListVO> {
    const where: any = {};
    if (name) {
      where.name = { contains: name };
    }
    if (code) {
      where.code = { contains: code };
    }
    if (type) {
      where.type = type;
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
      }),
      prisma.permission.count({ where }),
    ]);

    return {
      list: permissions.map((permission) => toResponseVO(PermissionVO, permission)),
      total,
    };
  }

  async getTree(): Promise<PermissionTreeVO[]> {
    const permissions = await prisma.permission.findMany({
      where: { status: 1 },
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    });

    const buildTree = (parentId: number | null): PermissionTreeVO[] => {
      return permissions
        .filter((p) => p.parentId === parentId)
        .map((p) => ({
          ...toResponseVO(PermissionTreeVO, p),
          children: buildTree(p.id),
        }));
    };

    return buildTree(null);
  }

  async getAll(): Promise<PermissionVO[]> {
    const permissions = await prisma.permission.findMany({
      where: { status: 1 },
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    });
    return permissions.map((permission) => toResponseVO(PermissionVO, permission));
  }
}