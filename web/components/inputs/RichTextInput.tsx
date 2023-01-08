import { ButtonHTMLAttributes, useEffect, useState } from "react";

import { Editor } from "@tiptap/core";
import CharacterCount from "@tiptap/extension-character-count";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor, EditorContent, EditorContentProps } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BxBold, BxItalic, BxLink } from "../../generated/icons/regular";

type RichTextInputProps = Omit<EditorContentProps, "editor" | "ref"> & {
  placeholder?: string;
  characterLimit?: number;
  onUpdate?: (props: { editor: Editor }) => void;
  editable?: boolean;
  initContent?: string;
  unstyled?: boolean;
  editorStyleString?: string;
};

/**
 *
 * Note: More styling is configured in globals.css
 *
 */
export const RichTextInput = (props: RichTextInputProps) => {
  const {
    placeholder,
    characterLimit,
    editable = true,
    initContent,
    unstyled = false,
    onUpdate = () => {},
    className,
    editorStyleString = "",
    ...rest
  } = props;

  const editor = useEditor({
    // https://tiptap.dev/api/extensions/starter-kit
    onUpdate,
    editable,
    parseOptions: {
      preserveWhitespace: "full",
    },
    onFocus() {
      setFocused(true);
    },
    onBlur() {
      setFocused(false);
    },
    content: initContent,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        bulletList: false,
        codeBlock: false,
        hardBreak: false,
        horizontalRule: false,
        listItem: false,
        orderedList: false,

        code: false,
        strike: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? " ",
      }),
      Link.configure({
        HTMLAttributes: {
          class: "underline cursor-pointer text-green-500",
        },
      }),
      CharacterCount.configure({
        limit: characterLimit,
      }),
      // error - duplicate extension 'heading'
      // probably bc of starter kit
      Heading.configure({
        levels: [1, 2],
      }),
    ],
    editorProps: {
      attributes: {
        class: unstyled
          ? ""
          : "px-1 pb-1 bg-white focus:outline-none transition min-h-[120px]",
        style: editorStyleString,
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor || !initContent) {
      return;
    }
    if (initContent !== editor.getHTML()) {
      editor.commands.setContent(initContent);
    }
  }, [editor, initContent]);

  const [focused, setFocused] = useState(false);

  return (
    <>
      <div
        className={`overflow-hidden rounded-md border bg-white px-2 pt-2 transition ${
          focused ? "border-black" : "border-gray-400"
        }`}
      >
        <div className="flex flex-row items-center gap-2 ">
          <EditorButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <BxBold
              className={`transition ${
                editor?.isActive("bold")
                  ? "fill-gray-900"
                  : "fill-gray-300 group-hover:fill-gray-500"
              }`}
            />
          </EditorButton>
          <EditorButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <BxItalic
              className={`transition ${
                editor?.isActive("italic")
                  ? "fill-gray-900"
                  : "fill-gray-300 group-hover:fill-gray-500"
              }`}
            />
          </EditorButton>

          <div className="h-6 w-1 border-l border-gray-300"></div>

          <EditorButton
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <span
              className={`transition ${
                editor?.isActive("heading", { level: 1 })
                  ? "text-gray-900"
                  : "text-gray-300 group-hover:text-gray-500"
              }`}
            >
              H1
            </span>
          </EditorButton>
          <EditorButton
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <span
              className={`transition ${
                editor?.isActive("heading", { level: 2 })
                  ? "text-gray-900"
                  : "text-gray-300 group-hover:text-gray-500"
              }`}
            >
              H2
            </span>
          </EditorButton>

          <div className="h-6 w-1 border-l border-gray-300"></div>

          <EditorButton>
            <BxLink
              className={`transition ${
                editor?.isActive("link")
                  ? "fill-gray-900"
                  : "fill-gray-300 group-hover:fill-gray-500"
              }`}
            />
          </EditorButton>
        </div>
        <EditorContent {...rest} editor={editor} />
      </div>
      {characterLimit && (
        <div className="mt-1 flex w-full justify-end break-words text-gray-400">
          {editor?.storage.characterCount.characters()}/{characterLimit}{" "}
          characters
        </div>
      )}
    </>
  );
};

const EditorButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`group h-7 w-7 select-none rounded-md p-0.5 text-base `}
    {...props}
  >
    {props.children}
  </button>
);
