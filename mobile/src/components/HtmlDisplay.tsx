import { useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";

interface HtmlDusplayProps {
  html: string;
}
export function HtmlDisplay(props: HtmlDusplayProps) {
  const { html } = props;

  const { width } = useWindowDimensions();

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html }}
      tagsStyles={{
        p: {
          margin: 0,
          marginTop: 4,
        },
      }}
    />
  );
}
