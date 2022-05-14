import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Text, Button, Input, Textarea, Modal } from "../components/atomic";
import { ActionModal } from "../components/modals/ActionModal";
import { theme } from "../tailwind.config";

// https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/components/ColorPaletteReference.js
export function ColorPaletteReference() {
  return (
    <div className="grid grid-cols-1 gap-8">
      {Object.entries(theme.colors).map(([color, colorVariants], i) => {
        let title = color;

        let palette = Object.entries(colorVariants).map(
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
                        className="h-10 w-full rounded dark:ring-1 dark:ring-inset dark:ring-white/10 shadow-md"
                        style={{ backgroundColor: value }}
                      />
                      <div className="px-0.5 md:flex md:justify-between md:space-x-2 2xl:space-x-0 2xl:block">
                        <div className="w-6 font-medium text-slate-900 2xl:w-full">
                          {name}
                        </div>
                        <div className="text-slate-500 font-mono lowercase dark:text-slate-400">
                          {value.replace(/^#[a-f0-9]+/gi, (m: any) =>
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
  const variants = ["primary", "outline"] as const;
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
  ];

  return (
    <div className="grid grid-cols-2 gap-8">
      {variants.map((variant) => (
        <div key={variant} className="font-bold text-lg">
          <div className="bg-teal-50 w-auto">{variant}</div>
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
        onAction={() => {
          toast.success("Primary action clicked");
          setIsOpen3(false);
        }}
        secondaryActionText="Secondary action"
        onSecondaryAction={() => {
          toast.error("Secondary action clicked");
          setIsOpen3(false);
        }}
      >
        <div className="w-120 h-40 bg-teal-50">content</div>
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

export default function ComponentsPage() {
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
    <div className="flex h-screen">
      <div className="h-full p-4 pr-16 flex-none text-white bg-gray-900">
        <div className="text-xl font-bold mb-8">Design System</div>
        <div className="flex flex-col gap-1">
          {headers.map(({ title, link, element }, i) => {
            return (
              <div className="flex gap-2 cursor-default" key={i}>
                →{" "}
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
      <div className="h-full w-full p-4 overflow-y-auto flex flex-col items-center">
        <div className="max-w-4xl">
          <SectionTitle title="Colors" />
          <ColorPaletteReference />

          <SectionTitle title="Buttons" />
          <ButtonsReference />

          <SectionTitle title="Inputs" />
          <div>
            <Input placeholder="Type here..." />
          </div>
          <div className="h-4"></div>
          <div>
            <Textarea placeholder="Type in textarea..." />
          </div>

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

          <SectionTitle title="Modals" />
          <ModalReference />

          <div className="h-screen"></div>
        </div>
      </div>
    </div>
  );
}