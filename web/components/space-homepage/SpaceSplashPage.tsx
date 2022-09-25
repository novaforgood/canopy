import { HTMLAttributes } from "react";

import classNames from "classnames";

import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Text } from "../atomic";
import { HtmlDisplay } from "../HtmlDisplay";
import { LoadingPlaceholderRect } from "../LoadingPlaceholderRect";
import { SpaceCoverPhoto } from "../SpaceCoverPhoto";

export function SpaceSplashPage() {
  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();

  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
      <div className="hidden flex-1 flex-col sm:flex">
        <Text
          variant="heading1"
          className="text-gray-900"
          loading={!currentSpace?.name}
        >
          {currentSpace?.name}
        </Text>
        <div className="h-12"></div>
        {!currentSpace ? (
          <LoadingPlaceholderRect className="h-12 w-64" />
        ) : (
          <HtmlDisplay html={currentSpace.description_html ?? ""} />
        )}
      </div>
      <div className="-mx-6 flex-1 self-stretch sm:mx-0">
        <SpaceCoverPhoto
          className="h-full w-full bg-gray-50"
          src={currentSpace?.space_cover_image?.image.url}
        ></SpaceCoverPhoto>
      </div>
      <div className="flex flex-1 flex-col sm:hidden">
        <Text variant="heading3">{currentSpace?.name}</Text>
        <div className="h-2"></div>
        <HtmlDisplay html={currentSpace?.description_html ?? ""} />
      </div>
    </div>
  );
}
