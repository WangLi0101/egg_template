import { ClassConstructor, plainToClass } from "class-transformer";

export const toResponseVO = <T>(cls: ClassConstructor<T>, obj: object): T => {
  return plainToClass(cls, obj, {
    excludeExtraneousValues: true,
  });
};
