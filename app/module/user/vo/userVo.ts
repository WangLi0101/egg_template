import { Expose } from "class-transformer";

export class UserCreateVO {
  @Expose()
  id: number;

  @Expose()
  username: string;
}
