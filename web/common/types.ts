/**
 * Response from the server
 */

export enum ApiResponseStatus {
  Success = "success",
  Error = "error",
  Fail = "fail",
}

export type ApiResponseSuccess<TData> = {
  status: ApiResponseStatus.Success;
  code: number;
  data: TData;
};

export type ApiResponseFail = {
  status: ApiResponseStatus.Fail;
  code: number;
  message: string;
};

export type ApiResponseError = {
  status: ApiResponseStatus.Error;
  code: number;
  message: string;
};

export type ApiResponse<TData> =
  | ApiResponseSuccess<TData>
  | ApiResponseFail
  | ApiResponseError;
