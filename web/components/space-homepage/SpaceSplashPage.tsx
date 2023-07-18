import { HTMLAttributes } from "react";

import classNames from "classnames";

import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Text } from "../atomic";
import { SpaceCoverPhoto } from "../common/SpaceCoverPhoto";
import { HtmlDisplay } from "../HtmlDisplay";
import { LoadingPlaceholderRect } from "../LoadingPlaceholderRect";

export function SpaceSplashPage() {
  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();

  return (
    <div className="flex flex-col gap-8 rounded-md border bg-white sm:flex-row sm:items-center">
      <div className="hidden flex-1 flex-col px-8 sm:flex">
        <Text
          variant="heading2"
          medium
          className="text-gray-900"
          loading={!currentSpace?.name}
        >
          {currentSpace?.name}
        </Text>
        <div className="h-4"></div>
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
