import { useCallback, useState } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { boolean } from "zod";

import { Button, Text, Textarea } from "../../../../components/atomic";
import { ToggleSwitch } from "../../../../components/atomic/ToggleSwitch";
import { BackButton } from "../../../../components/BackButton";
import { SimpleTextArea } from "../../../../components/inputs/SimpleTextArea";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/navbar/Navbar";
import { ProfileImage } from "../../../../components/ProfileImage";
import { useProfileByIdQuery } from "../../../../generated/graphql";
import { useIsLoggedIn } from "../../../../hooks/useIsLoggedIn";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { apiClient } from "../../../../lib/apiClient";
import { uploadImage } from "../../../../lib/image";
import { CustomPage } from "../../../../types";

interface ReportProfileProps {
  onSubmitSuccess?: () => void;
}
function ReportProfile(props: ReportProfileProps) {
  const { onSubmitSuccess } = props;

  const profileId = useQueryParam("profileId", "string");
  const isLoggedIn = useIsLoggedIn();
  const [
    { data: profileData, fetching: fetchingProfileData },
    refetchProfileById,
  ] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "", is_logged_in: isLoggedIn },
  });

  const [anonymous, setAnonymous] = useState(false);
  const [reportBody, setReportBody] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const submitReport = useCallback(async () => {
    if (!profileId) {
      throw new Error("No profile id");
    }
    if (!reportBody) {
      throw new Error("No report body");
    }
    if (imageUrls.length > 5) {
      throw new Error("Too many images");
    }

    // Upload all images
    const imageIds = await Promise.all(
      imageUrls.map(async (url) => {
        const res = await uploadImage(url);
        if (!res) {
          throw new Error("Failed to upload images");
        }
        return res.data.image.id;
      })
    );

    console.log({
      subjectProfileId: profileId,
      body: reportBody,
      imageIds,
      anonymous,
    });
    return apiClient.post<
      {
        subjectProfileId: string;
        body: string;
        imageIds: string[];
        anonymous: boolean;
      },
      { reportId: string }
    >(`/api/services/submitReport`, {
      subjectProfileId: profileId,
      body: reportBody,
      imageIds,
      anonymous,
    });
  }, [anonymous, imageUrls, profileId, reportBody]);

  if (!profileData?.profile_by_pk) {
    return null;
  }

  const { first_name, last_name } = profileData.profile_by_pk.user;

  return (
    <div className="w-full sm:w-120">
      <Text variant="heading3">
        Report {first_name} {last_name}
      </Text>
      <div className="h-12"></div>
      <label className="mb-1 block text-sm font-bold">You are reporting</label>

      <div className="flex items-center">
        <ProfileImage
          className="h-8 w-8"
          src={
            profileData.profile_by_pk.profile_listing?.profile_listing_image
              ?.image.url
          }
        />

        <Text className="ml-2">
          {first_name} {last_name}
        </Text>
      </div>
      <div className="h-8"></div>
      <SimpleTextArea
        label="Description"
        value={reportBody}
        onValueChange={setReportBody}
      />
      <Text variant="body2" className="text-gray-700">
        Please provide a detailed explanation for why you are reporting{" "}
        {first_name} {last_name}.
      </Text>
      <div className="h-8"></div>
      <label className="mb-1 block text-sm font-bold">Upload images</label>
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => {
          const images = Array.from(e.target.files ?? []).map((file) => ({
            url: URL.createObjectURL(file),
            size: file.size,
          }));
          for (const img of images) {
            if (img.size > 2 * 1024 * 1024) {
              toast.error("Each image must be less than 2MB.");
              return;
            }
          }

          if (images.length > 5) {
            toast.error("Please upload up to 5 images maximum.");
            return;
          }
          setImageUrls(images.map((image) => image.url));
        }}
        multiple
      />
      <div className="h-2"></div>
      <Text variant="body2" className="text-gray-700">
        You may upload up to 5 images (up to 2MB each) that could provide
        evidence or context for your report.
      </Text>
      <div className="h-4"></div>
      {imageUrls.length > 0 && (
        <>
          <div className="flex w-full flex-wrap gap-2">
            {imageUrls.map((image, idx) => {
              // Render images
              return (
                <img
                  key={idx}
                  src={image}
                  alt="report image"
                  className="h-32"
                />
              );
            })}
          </div>
          <div className="h-1"></div>
          <Button
            variant="secondary"
            size="auto"
            onClick={() => {
              if (
                !window.confirm("Are you sure you want to clear all images?")
              ) {
                return;
              }
              setImageUrls([]);
            }}
          >
            Clear images
          </Button>
        </>
      )}
      <div className="h-8"></div>
      <div className="flex items-center gap-4">
        <ToggleSwitch
          enabled={anonymous}
          onChange={(newValue) => {
            setAnonymous(newValue);
          }}
        />
        <Text>Submit report anonymously</Text>
      </div>
      <div className="h-12"></div>
      <Button
        rounded
        disabled={!reportBody || imageUrls.length > 5}
        loading={loadingSubmit}
        onClick={() => {
          setLoadingSubmit(true);
          submitReport()
            .then(() => {
              onSubmitSuccess?.();
              // Clear everything
              setReportBody("");
              setImageUrls([]);
              setAnonymous(false);
            })
            .catch((err) => {
              toast.error(err.message);
            })
            .finally(() => {
              setLoadingSubmit(false);
            });
        }}
      >
        Submit Report
      </Button>
    </div>
  );
}

const ProfilePage: CustomPage = () => {
  const router = useRouter();
  const spaceSlug = useQueryParam("slug", "string");
  const [submitted, setSubmitted] = useState(false);

  const profileId = useQueryParam("profileId", "string");
  const isLoggedIn = useIsLoggedIn();
  const [
    { data: profileData, fetching: fetchingProfileData },
    refetchProfileById,
  ] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "", is_logged_in: isLoggedIn },
  });

  const firstName = profileData?.profile_by_pk?.user?.first_name;
  const lastName = profileData?.profile_by_pk?.user?.last_name;

  return (
    <div className="relative flex h-screen flex-col">
      <div className="bg-gray-100">
        <Navbar />
      </div>
      <SidePadding className="h-full bg-gray-100">
        <div className="h-16"></div>
        <div>
          <BackButton />
        </div>
        <div className="h-4"></div>
        {submitted ? (
          <div className="w-full sm:w-120">
            <div className="rounded-md bg-green-50 p-4">
              <Text>
                You have successfully reported {firstName} {lastName}. Feel free
                to contact the admin if you have any further concerns.
              </Text>
              <div className="h-4"></div>
              <div className="flex flex-wrap items-center">
                <Button
                  rounded
                  onClick={() => {
                    router.push(`/space/${spaceSlug}`);
                  }}
                >
                  Back to homepage
                </Button>
                <Button
                  rounded
                  variant="secondary"
                  onClick={() => {
                    setSubmitted(false);
                  }}
                >
                  Submit another report
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ReportProfile
            onSubmitSuccess={() => {
              setSubmitted(true);
            }}
          />
        )}
      </SidePadding>
    </div>
  );
};

export default ProfilePage;
