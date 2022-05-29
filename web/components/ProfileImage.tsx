import { SVGProps } from "react";

import classNames from "classnames";

function UserSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 126 152"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0.5 113.369C0.5 107.988 4.52083 103.442 9.875 102.848C50.0573 98.3999 76.125 98.8009 116.219 102.947C118.221 103.157 120.118 103.946 121.68 105.217C123.241 106.488 124.398 108.186 125.01 110.104C125.622 112.021 125.663 114.076 125.126 116.016C124.59 117.957 123.5 119.699 121.99 121.03C74.6719 162.275 47.6302 161.707 3.83334 121.072C1.69792 119.093 0.5 116.28 0.5 113.374V113.369Z"
        fill="currentColor"
      />
      <path
        d="M104.669 42.1667C104.669 53.2174 100.279 63.8154 92.4654 71.6295C84.6514 79.4435 74.0533 83.8333 63.0026 83.8333C51.9519 83.8333 41.3538 79.4435 33.5398 71.6295C25.7258 63.8154 21.3359 53.2174 21.3359 42.1667C21.3359 31.116 25.7258 20.5179 33.5398 12.7039C41.3538 4.88987 51.9519 0.5 63.0026 0.5C74.0533 0.5 84.6514 4.88987 92.4654 12.7039C100.279 20.5179 104.669 31.116 104.669 42.1667Z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface ProfileImageProps {
  src?: string;
  alt?: string;
  className?: string;
  rounded?: boolean;
}

export function ProfileImage(props: ProfileImageProps) {
  const { src, alt = "Profile", className, rounded = true } = props;

  const styles = classNames({
    "rounded-full border border-gray-100": true,
    "rounded-full": rounded,
    "bg-gray-200 text-gray-50 flex items-center justify-center": !src,
    [`${className}`]: true,
  });
  return src ? (
    <img src={src} alt={alt} className={styles} />
  ) : (
    <div className={styles}>
      <UserSvg className="w-2/3 h-2/3" />
    </div>
  );
}
