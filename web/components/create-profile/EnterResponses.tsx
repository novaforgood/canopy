import React from "react";

import { useSetState } from "@mantine/hooks";

import { Text } from "../../components/atomic";
import { SimpleRichTextInput } from "../../components/inputs/SimpleRichTextInput";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";

import { StageDisplayWrapper } from "./StageDisplayWrapper";

interface EnterResponsesProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function EnterResponses(props: EnterResponsesProps) {
  const { onComplete, onSkip } = props;

  const { currentSpace } = useCurrentSpace();

  // const [{ data: listingResponseData }, refetchListingResponse] =
  //   useListingResponseByQuestionIdQuery({
  //     variables: { question_id: question.id },
  //   });
  const [responses, setResponses] = useSetState<Record<string, string>>({});

  return (
    <StageDisplayWrapper
      title="Responses"
      onPrimaryAction={onComplete}
      onSecondaryAction={onSkip}
    >
      <div className="h-16"></div>
      <div className="flex flex-col items-start">
        {currentSpace?.space_listing_questions.map((question) => {
          const response = responses[question.id] ?? "";

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
                content={response}
                characterLimit={question.char_count}
                onUpdate={({ editor }) => {
                  setResponses({
                    [question.id]: editor.getHTML(),
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    </StageDisplayWrapper>
  );
}
