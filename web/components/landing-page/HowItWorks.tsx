import { Text } from "../atomic";

interface HowItWorksData {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}
const DATA: HowItWorksData[] = [
  {
    title: "1. Set up",
    description:
      "Create your directory page in minutes, with full control over the tags and questions that go on directory profiles.",
    imageUrl: "/assets/landing/how-it-works/tree_1.svg",
    imageAlt: "Tree",
  },
  {
    title: "2. Onboard",
    description:
      "Send an invite link so that people can list their own profile or view others’ profiles.",
    imageUrl: "/assets/landing/how-it-works/tree_2.svg",
    imageAlt: "More Trees",
  },
  {
    title: "3. Connect",
    description:
      "Watch people in your directory find each other and connect. We make it easy to track engagement and connections across your community.",
    imageUrl: "/assets/landing/how-it-works/tree_3.svg",
    imageAlt: "Even More Trees",
  },
];

export function HowItWorks() {
  return (
    <div className="grid grid-rows sm:grid-cols-3 gap-8">
      {DATA.map((data, index) => {
        return (
          <div
            key={index}
            className="text-gray-900 border border-gray-900 rounded-md flex flex-col p-8 pb-0"
          >
            <Text variant="heading4" className="text-black">
              {data.title}
            </Text>
            <div className="h-8"></div>
            <Text>{data.description}</Text>
            <div className="flex-1 mt-16"></div>
            <img
              className="justify-self-end translate-y-0.25 select-none"
              src={data.imageUrl}
              alt={data.imageAlt}
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
