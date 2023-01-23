import { User_Type_Enum } from "../../generated/graphql";
import { ProfileImage, ProfileImageProps } from "../common/ProfileImage";

interface ChatProfileImageProps extends ProfileImageProps {
  userType: User_Type_Enum | null;
}

export function ChatProfileImage(props: ChatProfileImageProps) {
  const { userType, ...rest } = props;
  if (userType === User_Type_Enum.User) {
    return <ProfileImage {...rest} />;
  } else if (userType === User_Type_Enum.Bot) {
    return <ProfileImage {...rest} src="/assets/canopy_logo_circle.svg" />;
  } else {
    return <ProfileImage {...rest} />;
  }
}
