import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Text } from "../atomic";
import { HtmlDisplay } from "../HtmlDisplay";
import { SpaceCoverPhoto } from "../SpaceCoverPhoto";

export function SpaceSplashPage() {
  const { currentSpace } = useCurrentSpace();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-8">
      <div className="flex-col flex-1 hidden sm:flex">
        <Text variant="heading1" className="text-gray-900">
          {currentSpace?.name}
        </Text>
        <div className="h-8"></div>
        <HtmlDisplay
          html={currentSpace?.description_html ?? ""}
          className="text-gray-900"
        />
      </div>
      <div className="flex-1 self-stretch -mx-6 sm:mx-0">
        <SpaceCoverPhoto
          className="h-full w-full bg-gray-50"
          src={currentSpace?.space_cover_image?.image.url}
        ></SpaceCoverPhoto>
      </div>
      <div className="flex-col flex-1 flex sm:hidden">
        <Text variant="heading3">{currentSpace?.name}</Text>
        <div className="h-2"></div>
        <HtmlDisplay html={currentSpace?.description_html ?? ""} />
      </div>
    </div>
  );
}
