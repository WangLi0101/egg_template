import { SingletonProto, AccessLevel } from "egg";
import { UserCreateVO } from "../vo/userVo.ts";
import { toResponseVO } from "../../../common/transformer.ts";
import prisma from "../../../common/prisma.ts";

@SingletonProto({
  // 如果需要在上层使用，需要把 accessLevel 显示声明为 public
  accessLevel: AccessLevel.PUBLIC,
})
export class UserService {
  // 封装业务
  async hello(): Promise<string> {
    return `hello,egg`;
  }

  async create(username: string, password: string): Promise<UserCreateVO> {
    const user = await prisma.user.create({
      data: { username, password },
    });
    return toResponseVO(UserCreateVO, user);
  }
}
