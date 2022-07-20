import { Switch } from "@headlessui/react";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}
export function ToggleSwitch(props: ToggleSwitchProps) {
  const { enabled, onChange } = props;

  return (
    <Switch
      checked={enabled}
      onChange={onChange}
      className={`${enabled ? "bg-green-900" : "bg-green-500"}
          relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`${enabled ? "translate-x-7" : "translate-x-0"}
            pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
      />
    </Switch>
  );
}
