import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  SpaceHome: {
    spaceSlug: string;
    spaceName: string;
  };
  ProfilePage: {
    profileId: string;
  };
  ChatRoom: {
    chatRoomId: string;
    chatRoomName: string;
  };
};

export type SpaceStackParamList = {
  ProfilesList: undefined;
  ChatMessages: undefined;
  Account: undefined;
};

export type NavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<SpaceStackParamList>
>;
