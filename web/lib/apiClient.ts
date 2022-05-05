import { ApiResponse, ApiResponseStatus } from "../common/types";
import { auth } from "./firebase";

class ApiClient {
  readonly baseUrl: string;
  readonly getSessionJwt?: () => Promise<string>;

  constructor(props: {
    baseUrl: string;
    sessionJwt?: string;
    getSessionJwt?: () => Promise<string>;
  }) {
    this.baseUrl = props.baseUrl;
    this.getSessionJwt = props.getSessionJwt;
  }

  async customRequest<
    TRequestBody extends object,
    TResponseBody extends object
  >(
    path: string,
    method: string,
    body: TRequestBody | null
  ): Promise<TResponseBody> {
    const sessionJwt = await this.getSessionJwt?.();
    return await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: sessionJwt ? `Bearer ${sessionJwt}` : "",
      },
      body: body ? JSON.stringify(body) : undefined,
    })
      .then(async (response) => {
        const ret: ApiResponse<TResponseBody> = await response.json();

        if (ret.status === ApiResponseStatus.Fail) {
          throw new Error(ret.message);
        }
        if (ret.status === ApiResponseStatus.Error) {
          throw new Error(ret.message);
        }
        if (!response.ok) {
          throw new Error(JSON.stringify(ret));
        }
        return ret.data;
      })
      .catch((error) => {
        throw error;
      });
  }

  post<TRequestBody extends object, TResponseBody extends object>(
    path: string,
    body: TRequestBody
  ): Promise<TResponseBody> {
    return this.customRequest<TRequestBody, TResponseBody>(path, "POST", body);
  }

  patch<TRequestBody extends object, TResponseBody extends object>(
    path: string,
    body: TRequestBody
  ): Promise<TResponseBody> {
    return this.customRequest<TRequestBody, TResponseBody>(path, "PATCH", body);
  }

  delete<TRequestBody extends object, TResponseBody extends object>(
    path: string,
    body: TRequestBody
  ): Promise<TResponseBody> {
    return this.customRequest<TRequestBody, TResponseBody>(
      path,
      "DELETE",
      body
    );
  }

  get<TResponseBody extends object>(path: string): Promise<TResponseBody> {
    return this.customRequest<{}, TResponseBody>(path, "GET", null);
  }
}

export const apiClient = new ApiClient({
  baseUrl: "",
  getSessionJwt: async () => auth.currentUser?.getIdToken() ?? "",
});
