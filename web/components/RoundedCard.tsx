import classNames from "classnames";

export function RoundedCard(props: {
  children: React.ReactNode;
  className?: string;
}) {
  const { children, className } = props;

  const styles = classNames({
    "bg-white rounded-md border border-gray-300 p-2 sm:p-6": true,
    [`${className}`]: true,
  });
  return <div className={styles}>{children}</div>;
}
