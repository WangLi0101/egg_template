import { Expose } from "class-transformer";

export class MenuVO {
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
  icon?: string;

  @Expose()
  component?: string;

  @Expose()
  status: number;

  @Expose()
  sort: number;

  @Expose()
  createdAt: Date;
}

export class MenuTreeVO {
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
  icon?: string;

  @Expose()
  component?: string;

  @Expose()
  status: number;

  @Expose()
  sort: number;

  @Expose()
  children: MenuTreeVO[];
}

export class MenuListVO {
  @Expose()
  list: MenuVO[];

  @Expose()
  total: number;
}