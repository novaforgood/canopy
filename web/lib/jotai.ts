import { atom } from "jotai";

type Session = {
  jwt: string;
  userId: string;
} | null; // null means user is logged out

export const sessionAtom = atom<Session | undefined>(undefined);

export const mustSaveAtom = atom<boolean>(false);

export type TagSelection = Record<string, Set<string>>;
export const selectedTagIdsAtom = atom<TagSelection>({});
export const searchQueryAtom = atom<string>("");
export const adminBypassAtom = atom<boolean>(false);

export const notificationsCountAtom = atom<number>(0);
