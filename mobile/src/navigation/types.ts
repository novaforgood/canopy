import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  Loading: undefined;
  SignIn: undefined;
  Home: undefined;
  SpaceHome: {
    spaceSlug: string;
  };
};

export type SpaceStackParamList = {
  SpaceBottomTabs: undefined;
  ProfilePage: {
    profileId: string;
  };
  ChatRoom: {
    chatRoomId: string;
  };
};

export type SpaceBottomTabStackParamList = {
  ProfilesList: undefined;
  ChatMessages: undefined;
  Account: undefined;
};

export type NavigationProp = CompositeNavigationProp<
  CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    StackNavigationProp<SpaceStackParamList>
  >,
  BottomTabNavigationProp<SpaceBottomTabStackParamList>
>;
