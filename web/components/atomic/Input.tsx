import classNames from "classnames";
import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  onValueChange?: (value: string) => void;
};

export const Input = ({
  onValueChange = () => {},
  onChange = () => {},
  className = "",
  ...props
}: InputProps) => {
  const styles = classNames({
    "border border-gray-400 focus:border-black rounded-md px-4 py-2 focus:outline-none transition":
      true,
    [`${className}`]: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
    onChange(e);
  };

  return <input {...props} className={styles} onChange={handleChange} />;
};
