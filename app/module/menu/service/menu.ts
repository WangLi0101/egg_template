import { SingletonProto, AccessLevel } from "egg";
import prisma from "../../../common/prisma.ts";
import { BizError, ErrorCode } from "../../../common/error.ts";
import { MenuVO, MenuTreeVO, MenuListVO } from "../vo/menuVo.ts";
import { toResponseVO } from "../../../common/transformer.ts";

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class MenuService {
  async create(
    name: string,
    code: string,
    type: string,
    parentId?: number,
    path?: string,
    icon?: string,
    component?: string,
    sort?: number,
  ): Promise<MenuVO> {
    const existMenu = await prisma.menu.findUnique({
      where: { code },
    });
    if (existMenu) {
      throw new BizError(ErrorCode.MENU_EXISTS);
    }

    if (parentId) {
      const parent = await prisma.menu.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BizError(ErrorCode.MENU_NOT_FOUND, "父菜单不存在");
      }
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        code,
        type,
        parentId,
        path,
        icon,
        component,
        sort: sort || 0,
      },
    });

    return toResponseVO(MenuVO, menu);
  }

  async update(
    id: number,
    name?: string,
    type?: string,
    parentId?: number,
    path?: string,
    icon?: string,
    component?: string,
    status?: number,
    sort?: number,
  ): Promise<MenuVO> {
    const menu = await prisma.menu.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new BizError(ErrorCode.MENU_NOT_FOUND);
    }

    if (parentId) {
      if (parentId === id) {
        throw new BizError(ErrorCode.PARAM_ERROR, "父菜单不能是自己");
      }
      const parent = await prisma.menu.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BizError(ErrorCode.MENU_NOT_FOUND, "父菜单不存在");
      }
    }

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: {
        name,
        type,
        parentId,
        path,
        icon,
        component,
        status,
        sort,
      },
    });

    return toResponseVO(MenuVO, updatedMenu);
  }

  async delete(id: number): Promise<void> {
    const menu = await prisma.menu.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new BizError(ErrorCode.MENU_NOT_FOUND);
    }

    const children = await prisma.menu.findMany({
      where: { parentId: id },
    });
    if (children.length > 0) {
      throw new BizError(ErrorCode.PARAM_ERROR, "存在子菜单，无法删除");
    }

    await prisma.menu.delete({
      where: { id },
    });
  }

  async getById(id: number): Promise<MenuVO> {
    const menu = await prisma.menu.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new BizError(ErrorCode.MENU_NOT_FOUND);
    }
    return toResponseVO(MenuVO, menu);
  }

  async list(
    page: number = 1,
    pageSize: number = 10,
    name?: string,
    code?: string,
    type?: string,
    status?: number,
  ): Promise<MenuListVO> {
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

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
      }),
      prisma.menu.count({ where }),
    ]);

    return {
      list: menus.map((menu) => toResponseVO(MenuVO, menu)),
      total,
    };
  }

  async getTree(): Promise<MenuTreeVO[]> {
    const menus = await prisma.menu.findMany({
      where: { status: 1 },
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    });

    const buildTree = (parentId: number | null): MenuTreeVO[] => {
      return menus
        .filter((m) => m.parentId === parentId)
        .map((m) => ({
          ...toResponseVO(MenuTreeVO, m),
          children: buildTree(m.id),
        }));
    };

    return buildTree(null);
  }

  async getUserMenus(userId: number): Promise<MenuTreeVO[]> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            menus: {
              include: {
                menu: true,
              },
            },
          },
        },
      },
    });

    const menuIds = new Set<number>();
    userRoles.forEach((ur) => {
      ur.role.menus.forEach((rm) => {
        menuIds.add(rm.menuId);
      });
    });

    const menus = await prisma.menu.findMany({
      where: {
        id: { in: Array.from(menuIds) },
        status: 1,
      },
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    });

    const buildTree = (parentId: number | null): MenuTreeVO[] => {
      return menus
        .filter((m) => m.parentId === parentId)
        .map((m) => ({
          ...toResponseVO(MenuTreeVO, m),
          children: buildTree(m.id),
        }));
    };

    return buildTree(null);
  }

  async getAll(): Promise<MenuVO[]> {
    const menus = await prisma.menu.findMany({
      where: { status: 1 },
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    });
    return menus.map((menu) => toResponseVO(MenuVO, menu));
  }
}