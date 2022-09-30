import Head from "next/head";

import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useQueryParam } from "../hooks/useQueryParam";

interface MetadataProps {
  title?: string;
}
export function Metadata(props: MetadataProps) {
  const { title } = props;

  const { currentSpace } = useCurrentSpace();
  const spaceSlug = useQueryParam("slug", "string");

  const defaultTitle = spaceSlug ? currentSpace?.name : "Canopy";
  return (
    <Head>
      <title>{title ?? defaultTitle}</title>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
        key="apple-touch-icon"
      />
      <link rel="icon" href="/favicon.ico" key="favicon" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
        key="favicon-32x32"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
        key="favicon-16x16"
      />
      <link rel="manifest" href="/site.webmanifest" key="manifest" />
      <link
        rel="mask-icon"
        href="/safari-pinned-tab.svg"
        color="#5bbad5"
        key="mask-icon"
      />
      <meta
        name="msapplication-TileColor"
        content="#505e52"
        key="msapplication-TileColor"
      />
      <meta name="theme-color" content="#ffffff" key="theme-color"></meta>
    </Head>
  );
}
