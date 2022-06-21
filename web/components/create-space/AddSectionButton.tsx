import React, { ButtonHTMLAttributes } from "react";

type AddSectionButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function AddSectionButton(props: AddSectionButtonProps) {
  return (
    <button
      {...props}
      className="bg-gray-50 active:translate-y-px hover:brightness-95 py-2 text-center w-full rounded-md text-gray-700"
    ></button>
  );
}
