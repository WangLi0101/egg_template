import { Context, Application } from "egg";
import prisma from "../common/prisma.ts";
import { BizError, ErrorCode } from "../common/error.ts";

export default (options: any, _app: Application) => {
  return async (ctx: Context, next: any) => {
    const userId = ctx.state.userId;
    if (!userId) {
      ctx.status = 401;
      throw new BizError(ErrorCode.UNAUTHORIZED);
    }

    const requiredPermission = options.permission;
    if (!requiredPermission) {
      await next();
      return;
    }

    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();
    userRoles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permissions.add(rp.permission.code);
      });
    });

    if (!permissions.has(requiredPermission)) {
      ctx.status = 403;
      throw new BizError(ErrorCode.NO_PERMISSION);
    }

    await next();
  };
};