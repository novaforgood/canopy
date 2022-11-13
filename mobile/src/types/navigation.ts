import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Directory: undefined;
  ProfilePage: {
    profileId: string;
    firstName: string;
    lastName: string;
  };
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;
