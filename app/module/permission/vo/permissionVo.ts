import { Expose } from "class-transformer";

export class PermissionVO {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  type: string;

  @Expose()
  parentId?: number;

  @Expose()
  path?: string;

  @Expose()
  method?: string;

  @Expose()
  description?: string;

  @Expose()
  status: number;

  @Expose()
  sort: number;

  @Expose()
  createdAt: Date;
}

export class PermissionTreeVO {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  type: string;

  @Expose()
  parentId?: number;

  @Expose()
  path?: string;

  @Expose()
  method?: string;

  @Expose()
  description?: string;

  @Expose()
  status: number;

  @Expose()
  sort: number;

  @Expose()
  children: PermissionTreeVO[];
}

export class PermissionListVO {
  @Expose()
  list: PermissionVO[];

  @Expose()
  total: number;
}