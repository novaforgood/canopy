import React, { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import { Button } from "../components/atomic/Button";
import { Input } from "../components/atomic/Input";
import { useCreateOwnerProfileInNewSpaceMutation } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";
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

export default function CreatePage() {
  const [res, createOwnerProfile] = useCreateOwnerProfileInNewSpaceMutation();

  const router = useRouter();
  const { userData } = useUserData();
  const [name, setName] = useState("");

  return (
    <div className="p-4">
      <div className="text-xl">Create a space!</div>
      <Input
        value={name}
        onValueChange={setName}
        placeholder="Name of your new space"
      />
      <Button
        onClick={() => {
          const generatedSlug = slugifyAndAppendRandomString(name);
          createOwnerProfile({
            space: {
              name,
              owner_id: userData?.id,
              slug: generatedSlug,
            },
            user_id: userData?.id ?? "",
          })
            .catch((error) => {
              console.log(error);
            })
            .then(() => {
              router.push(`/space/${generatedSlug}`);
            });
        }}
      >
        Create
      </Button>
    </div>
  );
}
