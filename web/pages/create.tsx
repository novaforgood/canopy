import React, { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import { Button } from "../components/atomic/Button";
import { Input } from "../components/atomic/Input";
import {
  Profile_Types_Enum,
  useCreateOwnerProfileInNewSpaceMutation,
} from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import { useRouter } from "next/router";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function slugifyAndAppendRandomString(name: string) {
  return `${slugify(name)}-${nanoid()}`;
}

function makeReadableError(message: string) {
  if (message.includes("check_name_length")) {
    return "THe name of the space must be between 1 and 50 characters";
  } else {
    return message;
  }
}

export default function CreatePage() {
  const [_, createOwnerProfile] = useCreateOwnerProfileInNewSpaceMutation();

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const { userData } = useUserData();
  const [name, setName] = useState("");

  return (
    <div className="p-4">
      <div className="text-xl">Create a space!</div>
      <div className="h-4"></div>
      <Input
        value={name}
        onValueChange={(value) => {
          setName(value);
          setError(null);
        }}
        placeholder="Name of your new space"
      />
      {error && <div className="text-red-500">{error}</div>}
      <div className="h-4"></div>
      <Button
        // disabled={!name}
        onClick={() => {
          if (!userData?.id) {
            return;
          }

          const generatedSlug = slugifyAndAppendRandomString(name);
          createOwnerProfile({
            space: {
              name,
              owner_id: userData.id,
              slug: generatedSlug,
            },
            user_id: userData.id,
            profile_type: Profile_Types_Enum.Admin,
            profile_listing_enabled: true,
          }).then((result) => {
            if (result.error) {
              const msg = makeReadableError(result.error.message);
              setError(msg);
            } else {
              router.push(`/space/${generatedSlug}`);
            }
          });
        }}
      >
        Create
      </Button>
    </div>
  );
}
