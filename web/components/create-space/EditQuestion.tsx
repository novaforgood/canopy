import React, { useEffect, useState } from "react";
import { Input, Text } from "../atomic";
import { ActionModal } from "../modals/ActionModal";
import { Space_Listing_Question_Insert_Input } from "../../generated/graphql";

type EditQuestionProps = {
  question: Space_Listing_Question_Insert_Input;
  onSave?: (question: Space_Listing_Question_Insert_Input) => void;
};

export function EditQuestion(props: EditQuestionProps) {
  const { question, onSave = () => {} } = props;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(question.title ?? "");
      setCharCount(question.char_count ?? 0);
    }
  }, [isOpen, question.char_count, question.title]);

  const [title, setTitle] = useState(question.title ?? "");
  const [charCount, setCharCount] = useState(question.char_count ?? 0);

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        actionText="Save"
        onAction={() => {
          onSave({
            ...question,
            title,
            char_count: charCount,
          });
          setIsOpen(false);
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {
          setIsOpen(false);
        }}
      >
        <div className="p-8 py-16 w-96 flex flex-col">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="mb-4"
          />
          <Input
            value={charCount?.toString()}
            type="number"
            onChange={(e) => setCharCount(parseInt(e.target.value))}
            placeholder="Character Count"
            className="mb-4"
          />
        </div>
      </ActionModal>
      <div
        className="flex flex-col pb-16 hover:ring cursor-pointer"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Text variant="subheading1">
          {question.title} ({question.char_count} chars)
        </Text>
        <div className="h-2"></div>
        <Text variant="body1" className="text-gray-600">
          Your community members will write their responses here.
        </Text>
      </div>
    </>
  );
}
