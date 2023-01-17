import { User_Type_Enum } from "../../generated/graphql";
import { ProfileImage, ProfileImageProps } from "../common/ProfileImage";

interface ChatProfileImageProps extends ProfileImageProps {
  userType: User_Type_Enum;
}

export function ChatProfileImage(props: ChatProfileImageProps) {
  const { userType, ...rest } = props;
  if (userType === User_Type_Enum.User) {
    return <ProfileImage {...rest} />;
  } else {
    return <ProfileImage {...rest} src="/assets/canopy_logo_circle.svg" />;
  }
}
