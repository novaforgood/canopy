/* eslint @typescript-eslint/no-explicit-any: 0 */

import {
  Variables,
  Resolver,
  NullArray,
  UpdateResolver,
  OptimisticMutationResolver,
} from "@urql/exchange-graphcache";
import { nanoid } from "nanoid";

import {
  MESSAGES_PER_FETCH,
  DEFAULT_ID_CAP,
} from "../components/chats/constants";
import { Chat_Message, MessagesDocument } from "../generated/graphql";

// TODO: Comment this code x)

function insertionSort(arr: any[], compare: (a: any, b: any) => number) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && compare(arr[j], key) > 0) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}

function insertionSortById(arr: any[]) {
  return insertionSort(arr, (a, b) => {
    if (typeof a.id === "string" && typeof b.id === "string") {
      return 0;
    }
    if (typeof a.id === "string") {
      return -1;
    }
    if (typeof b.id === "string") {
      return 1;
    }
    return b.id - a.id;
  });
}

const deepGet = (
  obj: Record<string, any>,
  path: string,
  defaultValue = undefined
) => {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res, key) => (res !== null && res !== undefined ? res[key] : res),
        obj
      );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

const keyify = (obj: Record<string, any>, prefix = ""): string[] =>
  Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) {
      return res;
    } else if (typeof obj[el] === "object" && obj[el] !== null) {
      return [...res, ...keyify(obj[el], prefix + el + ".")];
    }
    return [...res, prefix + el];
  }, [] as string[]);

// Return true if args are the same (except for certain fields)
const compareArgs = (
  fieldArgs: Variables,
  connectionArgs: Variables
): boolean => {
  // Get all keys including those of nested fields
  const fieldArgsKeys = new Set(keyify(fieldArgs));
  const connectionArgsKeys = new Set(keyify(connectionArgs));

  if (fieldArgsKeys.size !== connectionArgsKeys.size) {
    return false;
  }

  const fieldsThatCanBeDifferent = ["limit", "where.id._lt"];

  for (const key in fieldArgsKeys) {
    if (fieldsThatCanBeDifferent.includes(key)) {
      continue;
    }
    if (deepGet(fieldArgs, key) !== deepGet(connectionArgs, key)) {
      return false;
    }
  }

  return true;
};

const removeLastEquivPlaceholder = (
  messages: Chat_Message[],
  newMessage: Chat_Message
) => {
  if (messages.find((message) => message.id === newMessage.id)) {
    return;
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (typeof message.id === "string" && message.text === newMessage.text) {
      messages.splice(i, 1);
      return;
    }
  }
};

export const chatMessageResolver: Resolver = (
  _parent,
  fieldArgs,
  cache,
  info
) => {
  const { parentKey: entityKey, fieldName } = info;

  const allFields = cache.inspectFields(entityKey);

  const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

  const size = fieldInfos.length;
  if (size === 0) {
    return undefined;
  }

  const visited = new Set();
  let result: NullArray<string> = [];
  const prevOffset: number | null = null;

  for (let i = 0; i < size; i++) {
    const { fieldKey, arguments: args } = fieldInfos[i];

    if (args === null || !compareArgs(fieldArgs, args)) {
      continue;
    }

    const links = cache.resolve(entityKey, fieldKey) as string[];

    const tempResult: NullArray<string> = [];

    for (let j = 0; j < links.length; j++) {
      const link = links[j];
      if (visited.has(link)) continue;
      tempResult.push(link);
      visited.add(link);
    }

    result = [...result, ...tempResult];
  }

  const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
  if (hasCurrentPage) {
    return result;
  } else if (!(info as any).store.schema) {
    return undefined;
  } else {
    info.partial = true;
    return insertionSortById(result);
  }
};

export const insertChatMessageUpdater: UpdateResolver = (
  result,
  args,
  cache,
  info
) => {
  const chatRoomId = (args as any)?.object?.chat_room_id;

  cache.updateQuery(
    {
      query: MessagesDocument,
      variables: {
        chat_room_id: chatRoomId,
        limit: MESSAGES_PER_FETCH,
        id_cap: DEFAULT_ID_CAP,
      },
    },
    (data) => {
      if (!data) return data;
      const messages = data.chat_message as Chat_Message[];
      const newMessage = result.insert_chat_message_one as any;
      removeLastEquivPlaceholder(messages, newMessage);

      const combined = [newMessage, ...messages];
      // const unique = combined.filter(
      //   (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      // );

      return {
        ...data,
        chat_message: insertionSortById(combined),
      };
    }
  );
};

export const chatMessageStreamUpdater: UpdateResolver = (
  result,
  args,
  cache,
  info
) => {
  if (typeof args.where !== "object") {
    return;
  }

  const chatRoomId = (args as any)?.where?.chat_room_id?._eq;

  cache.updateQuery(
    {
      query: MessagesDocument,
      variables: {
        chat_room_id: chatRoomId,
        limit: MESSAGES_PER_FETCH,
        id_cap: DEFAULT_ID_CAP,
      },
    },
    (data) => {
      if (!data) return data;

      const messages = data.chat_message as Chat_Message[];
      const newMessages = result.chat_message_stream as any;
      for (const newMessage of newMessages) {
        removeLastEquivPlaceholder(messages, newMessage);
      }

      const combined = [...newMessages, ...messages];

      return {
        ...data,
        chat_message: insertionSortById(combined),
      };
    }
  );
};

export const optimisticInsertChatMessageResolver: OptimisticMutationResolver = (
  args,
  cache,
  info
) => {
  return {
    __typename: "chat_message",
    id: nanoid(),
    created_at: new Date().toISOString(),
    sender_profile_id: (args as any).object.sender_profile_id,
    chat_room_id: (args as any).object.chat_room_id,
    text: (args as any).object.text,
    deleted: false,
  };
};
