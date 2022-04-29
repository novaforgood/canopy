import {
  ApiResponseError,
  ApiResponseFail,
  ApiResponseSuccess,
  ApiResponseType,
} from "../common/types";

export function makeApiSuccess<TData>(
  data: TData,
  code?: number
): ApiResponseSuccess<TData> {
  return {
    type: ApiResponseType.Success,
    code: code ?? 200,
    data: data,
  };
}

export function makeApiFail(message: string, code?: number): ApiResponseFail {
  return {
    type: ApiResponseType.Fail,
    code: code ?? 400,
    message: message,
  };
}

export function makeApiError(message: string, code?: number): ApiResponseError {
  return {
    type: ApiResponseType.Error,
    code: code ?? 500,
    message: message,
  };
}
