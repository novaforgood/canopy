import React, { useState } from "react";

import toast from "react-hot-toast";

import {
  Profile_Listing_Constraint,
  Profile_Listing_Update_Column,
  Space_Listing_Question,
  useListingResponseByQuestionIdQuery,
  useUpsertListingResponsesMutation,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { Text } from "../atomic";
import { EditButton } from "../EditButton";
import { HtmlDisplay } from "../HtmlDisplay";
import { SimpleRichTextInput } from "../inputs/SimpleRichTextInput";
import { ActionModal } from "../modals/ActionModal";

type Question = Omit<Space_Listing_Question, "space">;
type EditResponseProps = {
  question: Question;
};

export function EditResponse(props: EditResponseProps) {
  const { question } = props;

  const { currentProfile } = useCurrentProfile();
  const [{ data: listingResponseData }, refetchListingResponse] =
    useListingResponseByQuestionIdQuery({
      variables: {
        question_ids: [question.id],
        profile_listing_id: currentProfile?.profile_listing?.id ?? "",
      },
    });
  const [_, upsertListingResponses] = useUpsertListingResponsesMutation();

  const initResponse = listingResponseData?.profile_listing_response[0];

  const [responseHtmlInput, setResponseHtmlInput] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setResponseHtmlInput(initResponse?.response_html ?? "");
    setIsOpen(true);
  };

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        actionText="Save"
        onAction={async () => {
          await upsertListingResponses({
            objects: [
              {
                response_html: responseHtmlInput,
                space_listing_question_id: question.id,
                profile_listing: {
                  data: {
                    profile_id: currentProfile?.id,
                  },
                  on_conflict: {
                    constraint:
                      Profile_Listing_Constraint.ProfileListingProfileIdKey,
                    update_columns: [Profile_Listing_Update_Column.ProfileId],
                  },
                },
              },
            ],
          })
            .then((res) => {
              if (res.error) {
                throw new Error(res.error.message);
              } else {
                toast.success("Saved response");
                refetchListingResponse();
                setIsOpen(false);
              }
            })
            .catch((e) => {
              toast.error(e.message);
            });
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {
          setIsOpen(false);
        }}
      >
        <div className="flex w-96 flex-col p-8 py-16">
          <Text variant="heading4">{question.title}</Text>
          {question.description ? (
            <Text variant="body2" className="text-gray-700">
              {question.description}
            </Text>
          ) : null}
          <div className="h-4"></div>
          <SimpleRichTextInput
            characterLimit={question.char_count}
            initContent={initResponse?.response_html ?? ""}
            onUpdate={({ editor }) => {
              setResponseHtmlInput(editor.getHTML());
            }}
          />
        </div>
      </ActionModal>
      <div className="flex flex-col items-start">
        <Text variant="subheading1">
          {question.title}
          <EditButton onClick={openModal} className="mb-1 ml-1" />
        </Text>

        <div className="h-2"></div>

        <HtmlDisplay html={initResponse?.response_html ?? ""} />

        <div className="h-2"></div>
      </div>
    </>
  );
}
