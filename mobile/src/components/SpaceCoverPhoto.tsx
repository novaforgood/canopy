import { ImgHTMLAttributes, useState } from "react";

import { Image, View } from "react-native";

import { BxImage } from "../generated/icons/regular";
import { BxsImage } from "../generated/icons/solid";

import { Box, BoxProps } from "./atomic/Box";

type SpaceCoverPhotoProps = BoxProps & {
  src?: string | null;
  alt?: string;
};

export function SpaceCoverPhoto(props: SpaceCoverPhotoProps) {
  const { src, alt, ...rest } = props;

  return (
    <Box {...rest} backgroundColor="olive200" style={{ aspectRatio: 4 / 3 }}>
      {src ? (
        <Image
          style={{ width: "100%", height: "100%" }}
          source={{
            uri: src,
          }}
        />
      ) : (
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          height="100%"
          width="100%"
          backgroundColor="olive200"
          {...rest}
        >
          <BxsImage color="gray50" width="50%" />
        </Box>
      )}
    </Box>
  );
}
