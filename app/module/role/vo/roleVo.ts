import { Expose } from "class-transformer";

export class RoleVO {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  description?: string;

  @Expose()
  status: number;

  @Expose()
  sort: number;

  @Expose()
  createdAt: Date;
}

export class RoleDetailVO {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  description?: string;

  @Expose()
  status: number;

  @Expose()
  sort: number;

  @Expose()
  createdAt: Date;

  @Expose()
  permissions: number[];

  @Expose()
  menus: number[];
}

export class RoleListVO {
  @Expose()
  list: RoleVO[];

  @Expose()
  total: number;
}