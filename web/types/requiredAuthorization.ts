import { Profile_Role_Enum } from "../generated/graphql";

export enum AuthenticationStatus {
  LoggedIn,
  EmailVerified,
}

export type RequiredAuthorization = AuthenticationStatus | Profile_Role_Enum;
