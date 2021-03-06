import { Fragment, SVGProps, useEffect, useState } from "react";

import AvatarEditor from "react-avatar-editor";
import toast from "react-hot-toast";
import { tuple } from "zod";

import { Text, Button, Input, Textarea, Modal } from "../components/atomic";
import { ToggleSwitch } from "../components/atomic/ToggleSwitch";
import { ImageUploader } from "../components/ImageUploader";
import { SimpleRichTextInput } from "../components/inputs/SimpleRichTextInput";
import { TextInput } from "../components/inputs/TextInput";
import { ActionModal } from "../components/modals/ActionModal";
import { ProfileImage } from "../components/ProfileImage";
import { BxUser } from "../generated/icons/regular";
import { theme } from "../tailwind.config";
import { CustomPage } from "../types";

// https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/components/ColorPaletteReference.js
export function ColorPaletteReference() {
  return (
    <div className="grid grid-cols-1 gap-8">
      {Object.entries(theme.colors).map(([color, colorVariants], i) => {
        const title = color;

        const palette = Object.entries(colorVariants).map(
          ([variant, hexCode]) => ({
            name: variant,
            value: hexCode,
          })
        );

        return (
          <div key={i}>
            <div className="flex flex-col space-y-3 sm:flex-row text-xs sm:space-y-0 sm:space-x-4">
              <div className="w-16 shrink-0">
                <div className="h-10 flex flex-col justify-center">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    {title
                      .split("")
                      .flatMap((l, i) => {
                        return i !== 0 && l.toUpperCase() === l
                          ? [" ", l]
                          : [l];
                      })
                      .join("")}
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1 grid grid-cols-5 xl:grid-cols-11 gap-x-4 gap-y-3 2xl:gap-x-2">
                {palette.map(({ name, value }, j) => {
                  return (
                    <div key={j} className="space-y-1.5">
                      <div
                        className="h-10 w-full rounded dark:ring-1 dark:ring-inset dark:ring-white/10 shadow-lg"
                        style={{ backgroundColor: value }}
                      />
                      <div className="px-0.5 md:flex flex-col 2xl:flex-row md:justify-between 2xl:space-x-0 2xl:block">
                        <div className="w-6 font-medium text-slate-900 2xl:w-full">
                          {name}
                        </div>
                        <div className="text-slate-500 font-mono lowercase dark:text-slate-400">
                          {value.replace(/^#[a-f0-9]+/gi, (m: string) =>
                            m.toUpperCase()
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ButtonsReference() {
  const variants = ["cta", "primary", "outline", "secondary"] as const;
  const propsets = [
    { title: "Normal", props: {} },
    {
      title: "Rounded",
      props: { rounded: true },
    },
    {
      title: "Disabled",
      props: { disabled: true },
    },
    {
      title: "Floating",
      props: { floating: true },
    },
    {
      title: "Loading",
      props: { loading: true },
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-8">
      {variants.map((variant) => (
        <div key={variant} className="font-bold text-lg">
          <div className="bg-green-50 w-auto">{variant}</div>
        </div>
      ))}
      {propsets.map(({ title, props }) => {
        return (
          <>
            {variants.map((variant) => (
              <div key={`${variant}-${title}`}>
                <div className="text-gray-900 mb-1">{title}</div>
                <Button variant={variant} {...props}>
                  Button
                </Button>
              </div>
            ))}
          </>
        );
      })}
    </div>
  );
}

function ModalReference() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <div className="w-96 bg-white p-4">
          <Modal.Title>Title</Modal.Title>
          <Modal.Description>Description</Modal.Description>
        </div>
      </Modal>
      <Modal
        isOpen={isOpen2}
        onClose={() => {
          setIsOpen2(false);
        }}
        backgroundBlur
      >
        <div className="w-96 bg-white p-4">
          <Modal.Title>Title</Modal.Title>
          <Modal.Description>Description</Modal.Description>
        </div>
      </Modal>
      <ActionModal
        isOpen={isOpen3}
        onClose={() => {
          setIsOpen3(false);
        }}
        actionText="Primary action"
        onAction={async () => {
          toast.success("Primary action clicked");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success("Modal closed");
          setIsOpen3(false);
        }}
        secondaryActionText="Secondary action"
        onSecondaryAction={() => {
          toast.error("Secondary action clicked");
          setIsOpen3(false);
        }}
      >
        <div className="bg-green-50">content</div>
      </ActionModal>

      <Button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Open modal
      </Button>

      <div className="h-4"></div>
      <Button
        onClick={() => {
          setIsOpen2(true);
        }}
      >
        Open modal (background blur)
      </Button>

      <div className="h-4"></div>
      <Button
        onClick={() => {
          setIsOpen3(true);
        }}
      >
        Open action modal
      </Button>
    </>
  );
}

function InputReference() {
  const [value, setValue] = useState("");
  const [editable, setEditable] = useState(true);

  const [bool, setBool] = useState(false);
  return (
    <>
      <ToggleSwitch enabled={bool} onChange={setBool} />
      <div className="text-lg font-bold mb-2 mt-8">Input</div>
      <Input placeholder="Type here..." />
      <div className="h-4"></div>
      <TextInput placeholder="Type here..." label="With a label" />
      <div className="h-4"></div>
      <TextInput
        placeholder="Type here..."
        renderPrefix={() => <div>Prefix</div>}
      />

      <div className="text-lg font-bold mb-2 mt-8">Textarea</div>
      <Textarea placeholder="Type in textarea..." />

      <div>
        <div className="text-lg font-bold mb-2 mt-8">
          Simple Rich Text Input
        </div>
        <SimpleRichTextInput
          placeholder="Type in simple rich text input..."
          characterLimit={200}
          onUpdate={({ editor }) => {
            setValue(editor.getHTML());
          }}
          editable={editable}
        />
        <Button
          variant="outline"
          onClick={() => {
            setEditable((prev) => !prev);
          }}
        >
          {editable ? "Make readonly" : "Make editable"}
        </Button>
      </div>
    </>
  );
}

function DropzoneReference() {
  const [src1, setSrc1] = useState<string | null>(null);
  const [src2, setSrc2] = useState<string | null>(null);
  return (
    <>
      <ImageUploader
        width={250}
        height={250}
        showZoom
        showRoundedCrop
        imageSrc={src1}
        onImageSrcChange={setSrc1}
      />
      <div className="h-16"></div>
      <ImageUploader
        width={500}
        height={250}
        showZoom
        imageSrc={src2}
        onImageSrcChange={setSrc2}
      />
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h1
      className="pb-4 pt-16 border-b mb-12 text-3xl"
      id={title.replace(" ", "-")}
    >
      {title}
    </h1>
  );
}

const ComponentsPage: CustomPage = () => {
  const [headers, setHeaders] = useState<
    { title: string; link: string; element: HTMLDivElement }[]
  >([]);

  useEffect(() => {
    setHeaders(
      Array.from(document.getElementsByTagName("h1")).map((el) => ({
        title: el.innerText,
        link: el.id,
        element: el,
      }))
    );
  }, []);

  return (
    <div className="flex w-full h-screen">
      <div className="h-full p-4 pr-16 flex-none text-white bg-gray-900">
        <div className="text-xl font-bold mb-8">Components</div>
        <div className="flex flex-col gap-1">
          {headers.map(({ title, link, element }, i) => {
            return (
              <div className="flex gap-2 cursor-default" key={i}>
                ???{" "}
                <div
                  className="hover:underline cursor-pointer"
                  onClick={() => {
                    element.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-screen flex-1 p-4 overflow-y-auto flex flex-col items-center">
        <div className="max-w-full xl:max-w-3xl">
          <SectionTitle title="Colors" />
          <ColorPaletteReference />

          <SectionTitle title="Typography" />
          <div className="flex flex-col gap-2">
            <Text variant="heading1">Heading 1</Text>
            <Text variant="heading2">Heading 2</Text>
            <Text variant="heading3">Heading 3</Text>
            <Text variant="heading4">Heading 4</Text>
            <Text variant="subheading1">Subheading 1</Text>
            <Text variant="subheading2">Subheading 2</Text>
            <Text variant="body1">Body 1</Text>
            <Text variant="body2">Body 2</Text>
            <Text variant="body3">Body 3</Text>
            <Text bold>Bold</Text>
            <Text italic>Italic</Text>
            <Text underline>Underline</Text>
          </div>

          <SectionTitle title="Buttons" />
          <div>Sizes</div>
          <div className="flex flex-col items-start gap-2">
            <Button size="medium">Medium</Button>
            <Button size="small" loading>
              Small
            </Button>
          </div>
          <div className="h-8"></div>

          <ButtonsReference />

          <SectionTitle title="Inputs" />

          <InputReference />

          <SectionTitle title="Modals" />
          <ModalReference />

          <SectionTitle title="Image Dropzone" />
          <DropzoneReference />

          <ProfileImage className="h-10 w-10" />

          <div className="h-screen"></div>
        </div>
      </div>
    </div>
  );
};

ComponentsPage.requiredAuthorizations = [];

export default ComponentsPage;
