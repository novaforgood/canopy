import { atom } from "recoil";

type Session = {
  jwt: string;
  userId: string;
} | null; // null means user is logged out

export const sessionAtom = atom<Session | undefined>({
  key: "userJwt", // unique ID (with respect to other atoms/selectors)
  default: undefined, // default value (aka initial value)
});
