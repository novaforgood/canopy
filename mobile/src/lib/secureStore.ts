import * as SecureStoreLib from "expo-secure-store";

type JSONType = Record<string, unknown> | string | boolean | number;

export enum SecureStoreKey {
  CreateSpace = "CreateSpace",
  LastVisitedSpaceId = "LastVisitedSpaceId",
  SpaceHomepageBannerClosed = "SpaceHomepageBannerClosed",
  ProfileLastViewedCooldown = "ProfileLastViewedCooldown",
}

export const SecureStore = {
  set: async (key: SecureStoreKey, val: JSONType) => {
    return SecureStoreLib.setItemAsync(key, JSON.stringify(val));
  },
  get: async (key: SecureStoreKey): Promise<JSONType | null> => {
    const ret = await SecureStoreLib.getItemAsync(key);
    if (!ret) return null;
    return JSON.parse(ret);
  },
  delete: (key: SecureStoreKey) => {
    return SecureStoreLib.deleteItemAsync(key);
  },
};
