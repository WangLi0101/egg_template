import { SingletonProto, AccessLevel } from "egg";
import prisma from "../../../common/prisma.ts";
import { BizError, ErrorCode } from "../../../common/error.ts";
import { RoleVO, RoleDetailVO, RoleListVO } from "../vo/roleVo.ts";
import { toResponseVO } from "../../../common/transformer.ts";

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class RoleService {
  async create(
    name: string,
    code: string,
    description?: string,
    sort?: number,
    permissionIds?: number[],
    menuIds?: number[],
  ): Promise<RoleDetailVO> {
    const existRole = await prisma.role.findUnique({
      where: { code },
    });
    if (existRole) {
      throw new BizError(ErrorCode.ROLE_EXISTS);
    }

    const role = await prisma.role.create({
      data: {
        name,
        code,
        description,
        sort: sort || 0,
      },
    });

    if (permissionIds && permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
      });
    }

    if (menuIds && menuIds.length > 0) {
      await prisma.roleMenu.createMany({
        data: menuIds.map((menuId) => ({
          roleId: role.id,
          menuId,
        })),
      });
    }

    return {
      ...toResponseVO(RoleVO, role),
      permissions: permissionIds || [],
      menus: menuIds || [],
    };
  }

  async update(
    id: number,
    name?: string,
    description?: string,
    status?: number,
    sort?: number,
    permissionIds?: number[],
    menuIds?: number[],
  ): Promise<RoleDetailVO> {
    const role = await prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new BizError(ErrorCode.ROLE_NOT_FOUND);
    }

    await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        status,
        sort,
      },
    });

    if (permissionIds !== undefined) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }
    }

    if (menuIds !== undefined) {
      await prisma.roleMenu.deleteMany({
        where: { roleId: id },
      });
      if (menuIds.length > 0) {
        await prisma.roleMenu.createMany({
          data: menuIds.map((menuId) => ({
            roleId: id,
            menuId,
          })),
        });
      }
    }

    const updatedRole = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        menus: true,
      },
    });

    return {
      ...toResponseVO(RoleVO, updatedRole!),
      permissions: updatedRole!.permissions.map((p) => p.permissionId),
      menus: updatedRole!.menus.map((m) => m.menuId),
    };
  }

  async delete(id: number): Promise<void> {
    const role = await prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new BizError(ErrorCode.ROLE_NOT_FOUND);
    }

    await prisma.role.delete({
      where: { id },
    });
  }

  async getById(id: number): Promise<RoleDetailVO> {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        menus: true,
      },
    });
    if (!role) {
      throw new BizError(ErrorCode.ROLE_NOT_FOUND);
    }

    return {
      ...toResponseVO(RoleVO, role),
      permissions: role.permissions.map((p) => p.permissionId),
      menus: role.menus.map((m) => m.menuId),
    };
  }

  async list(
    page: number = 1,
    pageSize: number = 10,
    name?: string,
    code?: string,
    status?: number,
  ): Promise<RoleListVO> {
    const where: any = {};
    if (name) {
      where.name = { contains: name };
    }
    if (code) {
      where.code = { contains: code };
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
      }),
      prisma.role.count({ where }),
    ]);

    return {
      list: roles.map((role) => toResponseVO(RoleVO, role)),
      total,
    };
  }

  async getAll(): Promise<RoleVO[]> {
    const roles = await prisma.role.findMany({
      where: { status: 1 },
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    });
    return roles.map((role) => toResponseVO(RoleVO, role));
  }
}