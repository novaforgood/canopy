import { Input, InputProps } from "../atomic/Input";

type TextInputProps = InputProps & {
  label: string;
};

export function TextInput(props: TextInputProps) {
  const { label, ...rest } = props;
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-bold mb-1">{label}</label>
      <Input {...rest} />
    </div>
  );
}
