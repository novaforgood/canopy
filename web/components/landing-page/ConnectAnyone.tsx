import { ReactNode, useState } from "react";

import { useHover } from "@mantine/hooks";
import classNames from "classnames";

import { Text } from "../../components/atomic";
import {
  BxBook,
  BxBriefcaseAlt,
  BxGlobe,
  BxLink,
} from "../../generated/icons/regular";
import { Responsive } from "../layout/Responsive";

interface ConnectData {
  buttonIcon: ReactNode;
  buttonText: string;
  title: string;
  question: string;
  answer: string;
  imageUrl: string;
  imageAlt: string;
}
const DATA: ConnectData[] = [
  {
    buttonIcon: <BxBriefcaseAlt />,
    buttonText: "Professional Networks",
    title: "Professional Networks",
    question: "Want to connect people across your company or profession? ",
    answer:
      "Set up a unique directory to offer mentorship, connect hobbyists, or support DE&I initiatives across your professional community.",
    imageUrl: "/assets/landing/connect/connect_1.png",
    imageAlt: "People jumping in happiness",
  },
  {
    buttonIcon: <BxLink />,
    buttonText: "Mentorship Programs",
    title: "Mentorship Programs",
    question:
      "Want to start a new mentorship program or scale an existing one?",
    answer:
      "Let mentees drive the experience by selecting their own mentors from a directory, or create a directory so that mentees can find support beyond their mentor match.",
    imageUrl: "/assets/landing/connect/connect_2.png",
    imageAlt: "People jumping in happiness",
  },
  {
    buttonIcon: <BxBook />,
    buttonText: "Student Groups",
    title: "Student Groups",
    question:
      "Want to help members of your student org get to know each other better?",
    answer:
      "Set up a directory to learn about your members’ interests, or create a buddy directory that makes more experienced members accessible to new ones.",
    imageUrl: "/assets/landing/connect/connect_3.png",
    imageAlt: "People jumping in happiness",
  },
  {
    buttonIcon: <BxGlobe />,
    buttonText: "Alumni Groups",
    title: "Alumni Groups",
    question:
      "Want to keep students, alumni, or parents at your school engaged?",
    answer:
      "Set up a directory for classmates to stay in touch, or start an alumni mentorship directory for others to share advice and support.",
    imageUrl: "/assets/landing/connect/connect_4.png",
    imageAlt: "People tossing graduation caps",
  },
];

interface CommunityTypeButtonProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}
function CommunityTypeButton(props: CommunityTypeButtonProps) {
  const { active, icon, text, onClick } = props;
  const { ref, hovered } = useHover<HTMLButtonElement>();

  const styles = classNames({
    "self-stretch rounded-md border border-green-700 flex items-center gap-3 transition-all pl-4 pr-8 py-2":
      true,
    "bg-gray-50 text-green-700": !active,
    "bg-green-700 text-gray-50": active,
  });

  const iconStyles = classNames({
    "h-10 w-10 p-2 border rounded-full shrink-0": true,
    "border-green-700": !active,
    "border-gray-50": active,
  });

  return (
    <button className={styles} ref={ref} onClick={onClick}>
      <div className={iconStyles}>{icon}</div>
      <div className="text-left text-body2">{text}</div>
    </button>
  );
}

export function ConnectAnyone() {
  const [selected, setSelected] = useState<number>(0);

  const item = DATA[selected];

  return (
    <div className="flex flex-col sm:flex-row gap-8">
      <div className="flex flex-col gap-2">
        {DATA.map((data, index) => {
          return (
            <CommunityTypeButton
              key={index}
              icon={data.buttonIcon}
              text={data.buttonText}
              active={index === selected}
              onClick={() => {
                setSelected(index);
              }}
            />
          );
        })}
      </div>

      <Responsive mode="desktop-only">
        <div className="rounded-md border border-r border-green-700 grid grid-cols-2 overflow-hidden">
          <div className="bg-lime-200 border-r border-black p-8">
            <Text variant="heading4">{item.title}</Text>
            <div className="h-12"></div>
            <Text variant="body1" bold className="text-lime-700">
              {item.question}
            </Text>
            <div className="h-2"></div>
            <Text variant="body1">{item.answer}</Text>
          </div>

          {/**
           * Hack: Images have a tiny black border, so use negative margins to zoom slightly on
           * the image and hide that extra border
           */}

          <div className="-m-0.25">
            <img
              draggable={false}
              className="self-stretch overflow-hidden"
              src={item.imageUrl}
              alt={item.imageAlt}
            />
          </div>
        </div>
      </Responsive>
      <Responsive mode="mobile-only">
        <div className="rounded-md border border-r border-green-700 overflow-hidden">
          {/**
           * Hack: Images have a tiny black border, so use negative margins to zoom slightly on
           * the image and hide that extra border
           */}

          <div className="-m-0.25">
            <img
              draggable={false}
              className="self-stretch overflow-hidden"
              src={item.imageUrl}
              alt={item.imageAlt}
            />
          </div>

          <div className="bg-lime-200 p-8">
            <Text variant="heading4">{item.title}</Text>
            <div className="h-12"></div>
            <Text variant="body1" bold className="text-lime-700">
              {item.question}
            </Text>
            <div className="h-2"></div>
            <Text variant="body1">{item.answer}</Text>
          </div>
        </div>
      </Responsive>
    </div>
  );
}
