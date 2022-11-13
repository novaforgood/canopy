import { atom } from "jotai";

type Session = {
  jwt: string;
  userId: string;
} | null; // null means user is logged out

export const sessionAtom = atom<Session | undefined>(undefined);

type Space = {
  slug: string;
  name: string;
};
export const currentSpaceAtom = atom<Space | undefined>(undefined);

export const searchQueryAtom = atom<string>("");
