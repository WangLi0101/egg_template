import { Expose } from "class-transformer";

export class RegisterVO {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email?: string;

  @Expose()
  phone?: string;

  @Expose()
  nickname?: string;

  @Expose()
  createdAt: Date;
}

export class LoginVO {
  @Expose()
  token: string;

  @Expose()
  user: {
    id: number;
    username: string;
    nickname?: string;
    avatar?: string;
    roles: string[];
  };
}

export class UserInfoVO {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email?: string;

  @Expose()
  phone?: string;

  @Expose()
  nickname?: string;

  @Expose()
  avatar?: string;

  @Expose()
  status: number;

  @Expose()
  createdAt: Date;

  @Expose()
  roles: string[];
}