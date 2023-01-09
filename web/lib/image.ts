import { apiClient } from "./apiClient";

export async function uploadImage(imageUrl: string) {
  const blob = await (await fetch(imageUrl)).blob();
  const body = new FormData();
  body.append("upload", blob, "profile.png");
  return await apiClient.postForm<{ image: { id: string; url: string } }>(
    "/api/services/uploadImage",
    body
  );
}
