import canopyLogo from "../../../assets/images/canopy_logo_circle.png";
import { User_Type_Enum } from "../../generated/graphql";
import { ProfileImage, ProfileImageProps } from "../ProfileImage";

interface ChatProfileImageProps extends ProfileImageProps {
  userType: User_Type_Enum | null;
}

export function ChatProfileImage(props: ChatProfileImageProps) {
  const { userType, ...rest } = props;
  if (userType === User_Type_Enum.User) {
    return <ProfileImage {...rest} />;
  } else if (userType === User_Type_Enum.Bot) {
    return <ProfileImage {...rest} source={canopyLogo} />;
  } else {
    return <ProfileImage {...rest} />;
  }
}
