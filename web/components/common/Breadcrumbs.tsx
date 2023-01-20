import { Fragment, ReactNode, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { useProfileByIdQuery } from "../../generated/graphql";
import { BxsHome } from "../../generated/icons/solid";
import { useIsLoggedIn } from "../../hooks/useIsLoggedIn";
import { getFullNameOfUser } from "../../lib/user";
import { Text } from "../atomic";

type BreadcrumbItem = {
  title: ReactNode;
  href: string | null;
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
  const isLoggedIn = useIsLoggedIn();

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const profileId = router.query.profileId as string;
  const [{ data: profileData }] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "", is_logged_in: isLoggedIn },
  });

  useEffect(() => {
    if (router) {
      const linkPath = router.asPath.split("/");
      linkPath.shift();

      const pathArray: BreadcrumbItem[] = linkPath
        .map((path, i) => {
          if (path === profileId && profileData?.profile_by_pk) {
            const fullName = getFullNameOfUser(profileData.profile_by_pk.user);
            return {
              title: fullName,
              href: `/space/${linkPath[i - 1]}/profile/${profileId}`,
            };
          } else if (path === "profile" && linkPath[i - 1] !== "account") {
            return {
              title: "profile",
              href: null,
            };
          } else {
            return {
              title: path,
              href: "/" + linkPath.slice(0, i + 1).join("/"),
            };
          }
        })
        .slice(1);

      pathArray[0].title = <BxsHome className="h-5 w-5" />;

      setBreadcrumbs(pathArray);
    }
  }, [profileData?.profile_by_pk, profileId, router]);

  if (!breadcrumbs) {
    return null;
  }

  return (
    <div className="flex justify-start gap-2 text-black">
      {breadcrumbs.map((item, i) => {
        return (
          <Fragment key={i}>
            <div className="flex-none">
              {item.href ? (
                <a href={item.href}>{item.title}</a>
              ) : (
                <div className="cursor-default text-gray-600">{item.title}</div>
              )}
            </div>
            <Text>/</Text>
          </Fragment>
        );
      })}
    </div>
  );
}
