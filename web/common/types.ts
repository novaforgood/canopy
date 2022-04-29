/**
 * Response from the server
 */

export enum ApiResponseType {
  Success = "success",
  Error = "error",
  Fail = "fail",
}

export type ApiResponseSuccess<TData> = {
  type: ApiResponseType.Success;
  code: number;
  data: TData;
};

export type ApiResponseFail = {
  type: ApiResponseType.Fail;
  code: number;
  message: string;
};

export type ApiResponseError = {
  type: ApiResponseType.Error;
  code: number;
  message: string;
};

export type ApiResponse<TData> =
  | ApiResponseSuccess<TData>
  | ApiResponseFail
  | ApiResponseError;
