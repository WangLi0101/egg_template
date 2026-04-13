import { Context, Application } from "egg";
import { BizError, ErrorMessage, ErrorCode } from "../common/error.ts";

interface ResponseWrapperOptions {}

export default function responseWrapper(
  _options: ResponseWrapperOptions,
  _app: Application,
) {
  return async (ctx: Context, next: () => Promise<void>) => {
    try {
      await next();

      if (
        ctx.body !== undefined &&
        !ctx.status.toString().startsWith("4") &&
        !ctx.status.toString().startsWith("5")
      ) {
        ctx.body = {
          code: 0,
          message: "success",
          data: ctx.body,
        };
      }
    } catch (error: any) {
      if (error instanceof BizError) {
        ctx.status = 200;
        ctx.body = {
          code: error.code,
          message: error.message,
          data: null,
        };
      } else if (error.status === 422 && error.code === "invalid_param") {
        const errorMessages =
          error.errors
            ?.map((e: any) => `${e.field}: ${e.message}`)
            .join("; ") || ErrorMessage[ErrorCode.PARAM_ERROR];
        ctx.status = 200;
        ctx.body = {
          code: ErrorCode.PARAM_ERROR,
          message: errorMessages,
          data: null,
        };
      } else {
        ctx.status = error.status || 500;
        ctx.body = {
          code: error.code || ErrorCode.INTERNAL_ERROR,
          message: error.message || ErrorMessage[ErrorCode.INTERNAL_ERROR],
          data: null,
        };
      }
    }
  };
}
