import { Fragment, useRef, useState } from "react";

import { Combobox, Transition } from "@headlessui/react";
import classNames from "classnames";

import {
  SearchProfilesInSpaceQuery,
  useSearchProfilesInSpaceQuery,
} from "../../generated/graphql";
import { BxX } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { getFullNameOfUser } from "../../lib/user";
import { Text } from "../atomic";
import { ProfileImage } from "../common/ProfileImage";
import { Tag } from "../common/Tag";

function mapQueryToSelectedProfile(
  profile: SearchProfilesInSpaceQuery["profile"][number]
): SelectedProfile {
  return {
    profileId: profile.id,
    name: getFullNameOfUser(profile.user),
    profilePicUrl:
      profile.profile_listing?.profile_listing_image?.image.url ?? "",
  };
}
export interface SelectedProfile {
  profileId: string;
  name: string;
  profilePicUrl?: string;
}
export interface ProfileMultiSelectProps {
  selectedProfiles: SelectedProfile[];
  onChange: (newProfiles: SelectedProfile[]) => void;
}

export function ProfileMultiSelect(props: ProfileMultiSelectProps) {
  const { selectedProfiles, onChange } = props;

  const { currentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  // This component allows users to select multiple profiles to chat with. Users can start typing a name, and a list of profiles will appear. Upon selection, a token will appear in the input field. Users can select multiple profiles, and the tokens will appear in the input field. Users can also remove tokens by clicking on them.
  const [search, setSearch] = useState("");
  const [{ data }] = useSearchProfilesInSpaceQuery({
    variables: {
      search: `%${search}%`,
      space_id: currentSpace?.id ?? "",
      my_profile_id: currentProfile?.id ?? "",
      selected_profile_ids: selectedProfiles.map((p) => p.profileId),
      limit: 10,
    },
    pause: !search || !currentProfile || !currentSpace,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const profiles = data?.profile ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-1">
        <div className="flex items-center gap-1">
          {selectedProfiles.map((profile) => {
            return (
              <Tag
                variant="olive"
                onDeleteClick={() => {
                  onChange(
                    selectedProfiles.filter(
                      (p) => p.profileId !== profile.profileId
                    )
                  );
                }}
                key={profile.profileId}
                text={profile.name}
              />
            );
          })}
        </div>

        <Combobox
          className="relative"
          as="div"
          value={null as SelectedProfile | null}
          onChange={(newVal: SelectedProfile | null) => {
            if (!newVal) return;

            onChange([...selectedProfiles, newVal]);
            setSearch("");
            inputRef.current?.focus();
          }}
        >
          <Combobox.Input
            autoFocus
            className="flex-1 border-none bg-transparent text-body2 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onKeyDown={(e: any) => {
              if (e.key === "Backspace" && !search) {
                onChange([...selectedProfiles.slice(0, -1)]);
              }
            }}
          />
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute left-0 top-full z-10 flex flex-col rounded-md bg-white shadow-md">
              {search &&
                profiles.map((profile) => {
                  if (
                    selectedProfiles.find((p) => p.profileId === profile.id)
                  ) {
                    return null;
                  }
                  const formattedProfile = mapQueryToSelectedProfile(profile);
                  return (
                    <Combobox.Option
                      value={formattedProfile}
                      key={formattedProfile.profileId}
                      onClick={() => {
                        onChange([...selectedProfiles, formattedProfile]);
                        setSearch("");
                      }}
                    >
                      {({ selected, active }) => {
                        const styles = classNames({
                          "w-full flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-olive-50":
                            true,
                          "bg-olive-50": active,
                        });
                        return (
                          <button className={styles}>
                            <ProfileImage
                              src={formattedProfile.profilePicUrl}
                              className="h-5 w-5"
                            />
                            <Text variant="body2" className="whitespace-nowrap">
                              {formattedProfile.name}
                            </Text>
                          </button>
                        );
                      }}
                    </Combobox.Option>
                  );
                })}
            </Combobox.Options>
          </Transition>
        </Combobox>
        {/* <div className="relative">
              <input
                className="flex-1 rounded-md outline-none"
                ref={inputRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  } else if (e.key === "Backspace" && !search) {
                    onChange(selectedProfiles.slice(0, -1));
                  }
                }}
              />
              <div className="absolute left-0 top-full z-10 flex flex-col gap-2 rounded-md bg-white shadow-md"></div>
            </div> */}
      </div>
    </div>
  );
}
