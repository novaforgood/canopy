// Must be in root folder due to react-native quirk
// https://forums.expo.dev/t/error-ejecting-from-sdk-42/54812/5

import { registerRootComponent } from "expo";

import App from "./src/App";

registerRootComponent(App);
