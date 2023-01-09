import { atom } from "jotai";

export const updatingAtom = atom<boolean>(false);

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
export const selectedTagIdsAtom = atom<Set<string>>(new Set<string>());
export const filteredProfileIdsAtom = atom<string[]>([]);

export const showNavDrawerAtom = atom<boolean>(false);
