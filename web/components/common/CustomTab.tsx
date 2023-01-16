import { Tab } from "@headlessui/react";
import classNames from "classnames";

import { Text } from "../atomic";

interface CustomTabProps {
  title: string;
  accessory?: React.ReactNode;
}
export function CustomTab(props: CustomTabProps) {
  const { title, accessory } = props;

  return (
    <Tab>
      {({ selected }) => (
        <div
          className={classNames({
            "relative border-b-2 pb-1": true,
            "border-gray-400": !selected,
            "border-gray-900": selected,
          })}
        >
          <Text
            bold
            className={classNames({
              "text-gray-400": !selected,
              "text-gray-900": selected,
            })}
          >
            {title}
          </Text>
          {accessory}
        </div>
      )}
    </Tab>
  );
}
