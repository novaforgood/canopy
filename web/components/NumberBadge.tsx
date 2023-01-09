import classNames from "classnames";

interface NumberBadgeProps {
  number: number;
  className?: string;
}

export function NumberBadge(props: NumberBadgeProps) {
  const { number, className } = props;

  const styles = classNames({
    "flex h-[1.2rem] min-w-[1.2rem] items-center justify-center rounded-full bg-[#FA3E3E] px-0.5 text-center text-[0.75rem] leading-3 text-white font-bold shadow-sm":
      true,
    [`${className}`]: true,
  });
  return <div className={styles}>{number}</div>;
}
