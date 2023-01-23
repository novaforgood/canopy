import { useState } from "react";

import { addDays, addMonths, addYears, format } from "date-fns";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { useAdminDashDirectoryOverviewQuery } from "../../generated/graphql";
import { BxStar } from "../../generated/icons/regular";
import { BxsReport } from "../../generated/icons/solid";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { apiClient } from "../../lib/apiClient";
import { Button, Select, Text } from "../atomic";
import { Responsive } from "../layout/Responsive";

export function Dangerzone() {
  const { currentSpace } = useCurrentSpace();
  const router = useRouter();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          if (!currentSpace) {
            return;
          }
          const response = window.prompt(
            `Are you sure you want to delete "${currentSpace.name}"? This action cannot be undone. Type the name of the space to confirm.`
          );

          if (response !== currentSpace.name) {
            toast.error(
              "You must type the name of the space to confirm deletion."
            );
            return;
          }

          toast.promise(
            apiClient.post("/api/admin/deleteSpace", {
              spaceId: currentSpace.id,
            }),
            {
              loading: "Deleting space...",
              success: () => {
                router.push("/");
                return `Space "${currentSpace.name}" deleted!`;
              },
              error: (err) => err.message,
            }
          );
        }}
      >
        Delete Space
      </Button>
    </>
  );
}
