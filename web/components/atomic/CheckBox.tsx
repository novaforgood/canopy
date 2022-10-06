import { Text } from ".";

export function CheckBox(props: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const { label, checked, onChange } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className="flex items-baseline gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="form-checkbox h-4 w-4 shrink-0 translate-y-[2px]"
      />
      <Text variant="body1">{label}</Text>
    </div>
  );
}
