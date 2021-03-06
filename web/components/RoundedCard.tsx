import classNames from "classnames";

export function RoundedCard(props: {
  children: React.ReactNode;
  className?: string;
}) {
  const { children, className } = props;

  const styles = classNames({
    "rounded-md border border-gray-300 p-6": true,
    [`${className}`]: true,
  });
  return <div className={styles}>{children}</div>;
}
