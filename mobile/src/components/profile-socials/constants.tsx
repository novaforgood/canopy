import { ReactNode } from "react";

import { Profile_Listing_Social_Type_Enum as SocialEnum } from "../../generated/graphql";
import {
  BxlInstagram,
  BxlLinkedin,
  BxlTwitter,
} from "../../generated/icons/logos";

export const ALL_SOCIAL_TYPES = Object.values(SocialEnum);

type SocialProperties = {
  icon: (props: { color: string }) => JSX.Element;
  label: string;
  placeholder: string;
  renderPrefix?: () => JSX.Element;
  getLink?: (value: string) => string;
};

export const MAP_SOCIAL_TYPE_TO_PROPERTIES: Record<
  SocialEnum,
  SocialProperties
> = {
  [SocialEnum.Twitter]: {
    icon: BxlTwitter,
    label: "Twitter",
    placeholder: "Twitter username",
    renderPrefix: () => <div className="mr-1">@</div>,
    getLink: (value) => `https://twitter.com/${value}`,
  },
  [SocialEnum.Instagram]: {
    icon: BxlInstagram,
    label: "Instagram",
    placeholder: "Instagram username",
    renderPrefix: () => <div className="mr-1">@</div>,
    getLink: (value) => `https://instagram.com/${value}`,
  },
  [SocialEnum.LinkedIn]: {
    icon: BxlLinkedin,
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
  },
} as const;
