import React, { useEffect, useState } from "react";

import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Space_Listing_Question_Insert_Input } from "../../generated/graphql";
import { NewListingQuestion, NewTagCategory } from "../../lib/types";
import { Input, Text, Textarea } from "../atomic";
import { DeleteButton } from "../common/DeleteButton";
import { DragHandle } from "../common/DragHandle";
import { EditButton } from "../common/EditButton";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";

const LOREM_IPSUM_PREFIX =
  "Your community members will write their responses here. ";
const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non tellus orci ac auctor augue mauris augue neque gravida. Quis blandit turpis cursus in hac habitasse platea. Aliquet lectus proin nibh nisl condimentum. Iaculis at erat pellentesque adipiscing commodo elit at imperdiet. Lectus mauris ultrices eros in cursus turpis massa. Dui id ornare arcu odio ut sem nulla. Egestas diam in arcu cursus euismod quis viverra nibh. Sit amet cursus sit amet dictum sit amet justo donec. In eu mi bibendum neque egestas congue quisque. Fermentum dui faucibus in ornare quam viverra orci sagittis. Orci a scelerisque purus semper eget duis at tellus at. Adipiscing enim eu turpis egestas pretium aenean. Tempus quam pellentesque nec nam aliquam sem. Pretium lectus quam id leo in vitae. Sed faucibus turpis in eu mi bibendum. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae. ";
const LOREM_IPSUM_REPEATED = LOREM_IPSUM.repeat(10);

type EditQuestionProps = {
  question: NewListingQuestion;
  onSave?: (question: NewListingQuestion) => void;
  onDelete?: () => void;
};

export function EditQuestion(props: EditQuestionProps) {
  const { question, onSave = () => {}, onDelete = () => {} } = props;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.question.id,
    });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(question.title ?? "");
      setCharCount(question.char_count ?? 0);
    }
  }, [isOpen, question.char_count, question.title]);

  const [title, setTitle] = useState(question.title ?? "");
  const [description, setDescription] = useState(question.description ?? "");
  const [charCount, setCharCount] = useState(question.char_count ?? 0);

  const onClose = () => {
    setIsOpen(false);
    onSave({
      ...question,
      title,
      description: description == "" ? null : description,
      char_count: charCount,
    });
  };

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={onClose}
        actionText="Done editing"
        onAction={onClose}
      >
        <div className="flex w-96 flex-col p-8 py-16">
          <Text variant="heading4" className="text-center">
            Edit question
          </Text>
          <div className="h-8"></div>
          <TextInput
            label="Question Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="mb-4"
          />
          <div className="h-4"></div>
          <label className="block text-sm font-bold">Help Text</label>
          <Text variant="body2" className="mb-2 text-gray-700">
            Users will be able to see this help text for guidance when filling
            out the question.
          </Text>
          <Textarea
            label="Question Help Text"
            value={description}
            onValueChange={(val) => setDescription(val)}
            placeholder="Description"
            className="mb-4"
          />
          <TextInput
            label="Character Limit"
            value={charCount?.toString()}
            type="number"
            onChange={(e) => setCharCount(parseInt(e.target.value))}
            placeholder="Character Count"
            className="mb-4"
          />
        </div>
      </ActionModal>
      <div
        className="flex cursor-auto flex-col"
        ref={setNodeRef}
        style={style}
        {...attributes}
      >
        <Text variant="subheading1">
          {question.title}
          <EditButton
            className="ml-1"
            onClick={() => {
              setIsOpen(true);
            }}
          />
          <DragHandle className="ml-1" {...listeners} />
          <DeleteButton className="ml-1" onClick={onDelete} />
        </Text>
        <div className="h-1"></div>
        <Text variant="body2" className="text-gray-600">
          {LOREM_IPSUM_PREFIX}
          <Text variant="body2" className="text-gray-200">
            {LOREM_IPSUM_REPEATED.substring(
              0,
              question.char_count
                ? Math.max(0, question.char_count - LOREM_IPSUM_PREFIX.length)
                : 0
            )}
          </Text>
        </Text>
        <Text variant="body2" className="mt-2">
          Character limit: {question.char_count}
        </Text>
      </div>
    </>
  );
}
