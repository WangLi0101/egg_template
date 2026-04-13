import "egg";

declare module "egg" {
  interface Context {
    validate(rules: Record<string, any>, data?: any): void;
  }
}
