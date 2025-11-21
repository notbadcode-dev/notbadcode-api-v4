export enum LinkLastStatusCode {
  PENDING = 0,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  UNKNOWN_ERROR = 520,
}

export function getValidLinkLastStatusCode(value: number): LinkLastStatusCode {
  const values = Object.values(LinkLastStatusCode).filter((v) => typeof v === 'number') as number[];
  if (values.includes(value)) {
    return value as LinkLastStatusCode;
  }
  return LinkLastStatusCode.UNKNOWN_ERROR;
}
