import { SingletonProto, AccessLevel } from "egg";
import bcrypt from "bcryptjs";
import prisma from "../../../common/prisma.ts";
import { BizError, ErrorCode } from "../../../common/error.ts";
import { UserVO, UserDetailVO, UserListVO } from "../vo/userVo.ts";
import { toResponseVO } from "../../../common/transformer.ts";

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class UserService {
  async hello(): Promise<string> {
    return `hello,egg`;
  }

  async getById(id: number): Promise<UserDetailVO> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!user) {
      throw new BizError(ErrorCode.USER_NOT_FOUND);
    }
    const roles = user.roles.map((ur) => ur.role.code);
    return {
      ...toResponseVO(UserVO, user),
      roles,
    };
  }

  async list(
    page: number = 1,
    pageSize: number = 10,
    username?: string,
    email?: string,
    phone?: string,
    status?: number,
  ): Promise<UserListVO> {
    const where: any = {};
    if (username) {
      where.username = { contains: username };
    }
    if (email) {
      where.email = { contains: email };
    }
    if (phone) {
      where.phone = { contains: phone };
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      list: users.map((user) => toResponseVO(UserVO, user)),
      total,
    };
  }

  async update(
    id: number,
    email?: string,
    phone?: string,
    nickname?: string,
    avatar?: string,
    status?: number,
    roleIds?: number[],
  ): Promise<UserDetailVO> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new BizError(ErrorCode.USER_NOT_FOUND);
    }

    if (email) {
      const existEmail = await prisma.user.findFirst({
        where: { email, id: { not: id } },
      });
      if (existEmail) {
        throw new BizError(ErrorCode.USER_EXISTS, "邮箱已被使用");
      }
    }

    if (phone) {
      const existPhone = await prisma.user.findFirst({
        where: { phone, id: { not: id } },
      });
      if (existPhone) {
        throw new BizError(ErrorCode.USER_EXISTS, "手机号已被使用");
      }
    }

    await prisma.user.update({
      where: { id },
      data: {
        email,
        phone,
        nickname,
        avatar,
        status,
      },
    });

    if (roleIds !== undefined) {
      await prisma.userRole.deleteMany({
        where: { userId: id },
      });
      if (roleIds.length > 0) {
        await prisma.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId: id,
            roleId,
          })),
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const roles = updatedUser!.roles.map((ur) => ur.role.code);
    return {
      ...toResponseVO(UserVO, updatedUser!),
      roles,
    };
  }

  async updatePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new BizError(ErrorCode.USER_NOT_FOUND);
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new BizError(ErrorCode.USERNAME_PASSWORD_ERROR, "旧密码错误");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async delete(id: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new BizError(ErrorCode.USER_NOT_FOUND);
    }

    await prisma.user.delete({
      where: { id },
    });
  }

  async assignRoles(id: number, roleIds: number[]): Promise<UserDetailVO> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new BizError(ErrorCode.USER_NOT_FOUND);
    }

    await prisma.userRole.deleteMany({
      where: { userId: id },
    });

    if (roleIds.length > 0) {
      await prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId: id,
          roleId,
        })),
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const roles = updatedUser!.roles.map((ur) => ur.role.code);
    return {
      ...toResponseVO(UserVO, updatedUser!),
      roles,
    };
  }
}