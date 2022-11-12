import { atom } from "jotai";

type Session = {
  jwt: string;
  userId: string;
} | null; // null means user is logged out

export const sessionAtom = atom<Session | undefined>(undefined);
export const currentSpaceSlugAtom = atom<string | undefined>(undefined);
export const searchQueryAtom = atom<string>("");
