import { ImgHTMLAttributes, SVGProps } from "react";

import { useTheme } from "@shopify/restyle";
import { Image, TouchableOpacity } from "react-native";
import Lightbox from "react-native-lightbox";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, SvgProps } from "react-native-svg";

import { BxX } from "../generated/icons/regular";

import { Box, BoxProps } from "./atomic/Box";

function UserSvg(props: SvgProps) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 126 152"
      fill="currentColor"
      {...props}
    >
      <Path
        d="M0.5 113.369C0.5 107.988 4.52083 103.442 9.875 102.848C50.0573 98.3999 76.125 98.8009 116.219 102.947C118.221 103.157 120.118 103.946 121.68 105.217C123.241 106.488 124.398 108.186 125.01 110.104C125.622 112.021 125.663 114.076 125.126 116.016C124.59 117.957 123.5 119.699 121.99 121.03C74.6719 162.275 47.6302 161.707 3.83334 121.072C1.69792 119.093 0.5 116.28 0.5 113.374V113.369Z"
        fill="currentColor"
      />
      <Path
        d="M104.669 42.1667C104.669 53.2174 100.279 63.8154 92.4654 71.6295C84.6514 79.4435 74.0533 83.8333 63.0026 83.8333C51.9519 83.8333 41.3538 79.4435 33.5398 71.6295C25.7258 63.8154 21.3359 53.2174 21.3359 42.1667C21.3359 31.116 25.7258 20.5179 33.5398 12.7039C41.3538 4.88987 51.9519 0.5 63.0026 0.5C74.0533 0.5 84.6514 4.88987 92.4654 12.7039C100.279 20.5179 104.669 31.116 104.669 42.1667Z"
        fill="currentColor"
      />
    </Svg>
  );
}

export type ProfileImageProps = BoxProps & {
  src?: string | null;
  alt?: string;
  rounded?: boolean;
  border?: boolean;
  showLightbox?: boolean;
};

export function ProfileImage(props: ProfileImageProps) {
  const {
    src,
    alt = "Profile",
    rounded = true,
    border = true,
    showLightbox = false,
    ...rest
  } = props;

  const theme = useTheme();
  return src ? (
    <Box
      backgroundColor="gray100"
      borderRadius={rounded ? "full" : undefined}
      overflow="hidden"
      style={{ aspectRatio: 1 }}
      pointerEvents={showLightbox ? "auto" : "none"}
      {...rest}
    >
      <Lightbox
        renderHeader={(close: () => void) => (
          <Box mt={8} ml={4}>
            <TouchableOpacity onPress={close}>
              <BxX height={28} width={28} color="white" />
            </TouchableOpacity>
          </Box>
        )}
        renderContent={() => (
          <Image
            style={{
              width: "100%",
              aspectRatio: 1,
              borderRadius: rounded ? theme.borderRadii.full : undefined,
            }}
            source={{
              uri: src,
            }}
          />
        )}
      >
        <Image
          style={{ width: "100%", height: "100%" }}
          source={{
            uri: src,
          }}
        />
      </Lightbox>
    </Box>
  ) : (
    <Box
      overflow="hidden"
      backgroundColor="olive200"
      alignItems="center"
      justifyContent="center"
      style={{ aspectRatio: 1 }}
      borderRadius={rounded ? "full" : undefined}
      {...rest}
    >
      <UserSvg width="66%" height="66%" color="gray50" />
    </Box>
  );
}
