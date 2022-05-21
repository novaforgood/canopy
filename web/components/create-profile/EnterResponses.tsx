import React, { useEffect, useMemo, useState } from "react";

import { useSetState } from "@mantine/hooks";
import toast from "react-hot-toast";

import { Text } from "../../components/atomic";
import { SimpleRichTextInput } from "../../components/inputs/SimpleRichTextInput";
import {
  Profile_Listing_Constraint,
  Profile_Listing_Update_Column,
  useListingResponseByQuestionIdQuery,
  useUpsertListingResponsesMutation,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";

import { StageDisplayWrapper } from "./StageDisplayWrapper";

interface EnterResponsesProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function EnterResponses(props: EnterResponsesProps) {
  const { onComplete, onSkip } = props;

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const spaceListingQuestions = useMemo(() => {
    return currentSpace?.space_listing_questions ?? [];
  }, [currentSpace]);

  const questionIdsVariables = useMemo(() => {
    return {
      variables: {
        question_ids: spaceListingQuestions.map((q) => q.id),
      },
    };
  }, [spaceListingQuestions]);

  const [{ data: listingResponseData }, refetchListingResponse] =
    useListingResponseByQuestionIdQuery(questionIdsVariables);

  const [_, upsertListingResponses] = useUpsertListingResponsesMutation();

  const [responses, setResponses] = useState<Record<string, string>>({});

  const initResponses = useMemo(() => {
    const init: Record<string, string> = {};
    const res =
      listingResponseData?.profile_listing_response.reduce((acc, curr) => {
        acc[curr.space_listing_question_id] = curr.response_html;
        return acc;
      }, init) ?? {};
    return res;
  }, [listingResponseData]);

  const handlePrimaryAction = async () => {
    if (!currentProfile) {
      toast.error("No currentProfile");
      return;
    }
    await upsertListingResponses({
      objects: Object.entries(responses).map(([questionId, responseHtml]) => {
        return {
          response_html: responseHtml,
          space_listing_question_id: questionId,
          profile_listing: {
            data: {
              profile_id: currentProfile?.id,
            },
            on_conflict: {
              constraint: Profile_Listing_Constraint.ProfileListingProfileIdKey,
              update_columns: [Profile_Listing_Update_Column.ProfileId],
            },
          },
        };
      }),
    });
    onComplete();
  };

  return (
    <StageDisplayWrapper
      title="Responses"
      onPrimaryAction={handlePrimaryAction}
      onSecondaryAction={onSkip}
    >
      <div className="h-16"></div>
      <div className="flex flex-col items-start">
        {spaceListingQuestions.map((question) => {
          return (
            <div
              className="flex flex-col items-start mt-4 w-160"
              key={question.id}
            >
              <Text variant="subheading2" className="text-gray-600 font-bold">
                {question.title}
              </Text>
              <div className="h-4"></div>
              <SimpleRichTextInput
                initContent={initResponses[question.id]}
                characterLimit={question.char_count}
                onUpdate={({ editor }) => {
                  setResponses((prev) => ({
                    ...prev,
                    [question.id]: editor.getHTML(),
                  }));
                }}
              />
            </div>
          );
        })}
      </div>
    </StageDisplayWrapper>
  );
}
