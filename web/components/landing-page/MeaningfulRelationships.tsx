import { ReactNode } from "react";

import {
  BxEditAlt,
  BxRocket,
  BxSearch,
  BxSearchAlt,
} from "../../generated/icons/regular";
import { Text } from "../atomic";

interface Data {
  icon: ReactNode;
  title: string;
  body: ReactNode;
}
const DATA: Data[] = [
  {
    icon: <BxEditAlt />,
    title: "Customized to your needs",
    body: (
      <div>
        <Text variant="body2" className="text-gray-700">
          Running a student veterans mentorship program? A fraternity alumni
          group?
        </Text>
        <div className="h-1"></div>
        <Text variant="body2" className="text-gray-700" medium>
          Configure a directory that fits your community’s identity.
        </Text>
      </div>
    ),
  },
  {
    icon: <BxRocket />,
    title: "Easy setup & onboarding",
    body: (
      <div>
        <Text variant="body2" className="text-gray-700">
          Create your directory and send member invites — all in minutes.
        </Text>
        <div className="h-1"></div>

        <Text variant="body2" className="text-gray-700" medium>
          Watch your directory grow as your members complete their profiles.
        </Text>
      </div>
    ),
  },
  {
    icon: <BxSearchAlt />,
    title: "Easy search & introductions",
    body: (
      <div>
        <Text variant="body2" className="text-gray-700">
          Cold-emailing is intimidating.
        </Text>
        <div className="h-1"></div>

        <Text variant="body2" className="text-gray-700" medium>
          As your members filter through profiles, Canopy facilitates email
          intros with the click of a button.
        </Text>
      </div>
    ),
  },
];

export function MeaningfulRelationships() {
  return (
    <div className="flex items-end gap-8">
      <img
        src="/assets/landing/two_people_connecting.png"
        alt="Two people connecting"
        draggable={false}
        className="w-64 mb-8 hidden lg:block"
      />
      <div className="grid gap-4 grid-rows sm:grid-cols-3">
        {DATA.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-lime-700 rounded-md px-8 py-6"
          >
            <div className="h-10 w-10 p-2 border rounded-full shrink-0 bg-lime-200 border-green-700 text-green-700">
              {item.icon}
            </div>
            <div className="h-4"></div>
            <Text variant="subheading1" className="text-green-700">
              {item.title}
            </Text>
            <div className="h-6"></div>
            {item.body}
          </div>
        ))}
      </div>
    </div>
  );
}
