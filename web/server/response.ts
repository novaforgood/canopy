import {
  ApiResponseError,
  ApiResponseFail,
  ApiResponseSuccess,
  ApiResponseStatus,
} from "../common/types";

export function makeApiSuccess<TData>(
  data: TData,
  code?: number
): ApiResponseSuccess<TData> {
  return {
    status: ApiResponseStatus.Success,
    code: code ?? 200,
    data: data,
  };
}

export function makeApiFail(message: string, code?: number): ApiResponseFail {
  return {
    status: ApiResponseStatus.Fail,
    code: code ?? 400,
    message: message,
  };
}

export function makeApiError(message: string, code?: number): ApiResponseError {
  return {
    status: ApiResponseStatus.Error,
    code: code ?? 500,
    message: message,
  };
}
