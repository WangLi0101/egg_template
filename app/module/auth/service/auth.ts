import { SingletonProto, AccessLevel, Inject } from "egg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../common/prisma.ts";
import { BizError, ErrorCode } from "../../../common/error.ts";
import { RegisterVO, LoginVO, UserInfoVO } from "../vo/authVo.ts";
import { toResponseVO } from "../../../common/transformer.ts";

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class AuthService {
  @Inject()
  config: any;

  async register(
    username: string,
    password: string,
    email?: string,
    phone?: string,
    nickname?: string,
  ): Promise<RegisterVO> {
    const existUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existUser) {
      throw new BizError(ErrorCode.USER_EXISTS);
    }

    if (email) {
      const existEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existEmail) {
        throw new BizError(ErrorCode.USER_EXISTS, "邮箱已被使用");
      }
    }

    if (phone) {
      const existPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existPhone) {
        throw new BizError(ErrorCode.USER_EXISTS, "手机号已被使用");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        phone,
        nickname: nickname || username,
      },
    });

    const defaultRole = await prisma.role.findUnique({
      where: { code: "user" },
    });
    if (defaultRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id,
        },
      });
    }

    return toResponseVO(RegisterVO, user);
  }

  async login(username: string, password: string): Promise<LoginVO> {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new BizError(ErrorCode.USERNAME_PASSWORD_ERROR);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new BizError(ErrorCode.USERNAME_PASSWORD_ERROR);
    }

    if (user.status !== 1) {
      throw new BizError(ErrorCode.FORBIDDEN, "用户已被禁用");
    }

    const jwtConfig = this.config.jwt;
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    );

    const roles = user.roles.map((ur) => ur.role.code);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname || undefined,
        avatar: user.avatar || undefined,
        roles,
      },
    };
  }

  async getUserInfo(userId: number): Promise<UserInfoVO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      ...toResponseVO(UserInfoVO, user),
      roles,
    };
  }

  verifyToken(token: string): { userId: number; username: string } {
    try {
      const jwtConfig = this.config.jwt;
      return jwt.verify(token, jwtConfig.secret) as {
        userId: number;
        username: string;
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BizError(ErrorCode.TOKEN_EXPIRED);
      }
      throw new BizError(ErrorCode.TOKEN_INVALID);
    }
  }
}