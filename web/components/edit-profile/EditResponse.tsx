import React, { useEffect, useState } from "react";

import {
  Profile_Listing_Constraint,
  Profile_Listing_Update_Column,
  Space_Listing_Question,
  useListingResponseByQuestionIdQuery,
  useUpsertListingResponsesMutation,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { Button, Input, Text } from "../atomic";
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
      variables: { question_id: question.id },
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
          });

          refetchListingResponse();
          setIsOpen(false);
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {
          setIsOpen(false);
        }}
      >
        <div className="p-8 py-16 w-96 flex flex-col">
          <Text variant="heading4">{question.title}</Text>
          <div className="h-4"></div>
          <SimpleRichTextInput
            characterLimit={question.char_count}
            content={initResponse?.response_html ?? ""}
            onUpdate={({ editor }) => {
              setResponseHtmlInput(editor.getHTML());
            }}
          />
        </div>
      </ActionModal>
      <div className="flex flex-col items-start pb-16">
        <Text variant="subheading1">
          {question.title} ({question.char_count} chars)
        </Text>
        <div className="h-2"></div>

        <HtmlDisplay html={initResponse?.response_html ?? ""} />
        <div className="h-4"></div>
        <Button variant="outline" rounded onClick={openModal}>
          Edit section
        </Button>

        <div className="h-2"></div>
      </div>
    </>
  );
}
