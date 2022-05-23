import { ReactNode, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { BxsHome } from "../generated/icons/solid";

import { Text } from "./atomic";

type BreadcrumbItem = {
  title: ReactNode;
  href: string;
};

const convertBreadcrumb = (string: string) => {
  return string
    .replace(/-/g, " ")
    .replace(/oe/g, "ö")
    .replace(/ae/g, "ä")
    .replace(/ue/g, "ü")
    .toUpperCase();
};

export function Breadcrumbs() {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    if (router) {
      const linkPath = router.asPath.split("/");
      linkPath.shift();

      const pathArray: BreadcrumbItem[] = linkPath
        .map((path, i) => {
          return {
            title: path,
            href: "/" + linkPath.slice(0, i + 1).join("/"),
          };
        })
        .slice(1);

      pathArray[0].title = <BxsHome className="h-5 w-5" />;
      console.log(pathArray);

      setBreadcrumbs(pathArray);
    }
  }, [router]);

  if (!breadcrumbs) {
    return null;
  }

  return (
    <div className="flex justify-start gap-2 text-black">
      {breadcrumbs.map((item, i) => {
        return (
          <>
            <div key={i} className="flex-none">
              <a href={item.href}>{item.title}</a>
            </div>
            <Text>/</Text>
          </>
        );
      })}
    </div>
  );
}
