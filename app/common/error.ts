export const ErrorCode = {
  SUCCESS: 0,
  USER_EXISTS: 2,
  USER_NOT_FOUND: 3,
  PARAM_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.SUCCESS]: 'success',
  [ErrorCode.USER_EXISTS]: '用户已存在',
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.PARAM_ERROR]: '参数错误',
  [ErrorCode.UNAUTHORIZED]: '未授权',
  [ErrorCode.FORBIDDEN]: '禁止访问',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
}

export class BizError extends Error {
  code: ErrorCode;
  
  constructor(code: ErrorCode, message?: string) {
    super(message || ErrorMessage[code]);
    this.code = code;
    this.name = 'BizError';
  }
}