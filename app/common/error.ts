export const ErrorCode = {
  SUCCESS: 0,
  USER_EXISTS: 2,
  USER_NOT_FOUND: 3,
  USERNAME_PASSWORD_ERROR: 4,
  ROLE_EXISTS: 5,
  ROLE_NOT_FOUND: 6,
  PERMISSION_EXISTS: 7,
  PERMISSION_NOT_FOUND: 8,
  MENU_EXISTS: 9,
  MENU_NOT_FOUND: 10,
  TOKEN_EXPIRED: 11,
  TOKEN_INVALID: 12,
  NO_PERMISSION: 13,
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
  [ErrorCode.USERNAME_PASSWORD_ERROR]: '用户名或密码错误',
  [ErrorCode.ROLE_EXISTS]: '角色已存在',
  [ErrorCode.ROLE_NOT_FOUND]: '角色不存在',
  [ErrorCode.PERMISSION_EXISTS]: '权限已存在',
  [ErrorCode.PERMISSION_NOT_FOUND]: '权限不存在',
  [ErrorCode.MENU_EXISTS]: '菜单已存在',
  [ErrorCode.MENU_NOT_FOUND]: '菜单不存在',
  [ErrorCode.TOKEN_EXPIRED]: 'Token已过期',
  [ErrorCode.TOKEN_INVALID]: 'Token无效',
  [ErrorCode.NO_PERMISSION]: '无权限访问',
  [ErrorCode.PARAM_ERROR]: '参数错误',
  [ErrorCode.UNAUTHORIZED]: '未授权',
  [ErrorCode.FORBIDDEN]: '禁止访问',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
};

export class BizError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message?: string) {
    super(message || ErrorMessage[code]);
    this.code = code;
    this.name = 'BizError';
  }
}