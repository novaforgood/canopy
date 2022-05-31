import { apiClient } from "./apiClient";

export async function uploadImage(imageData: string) {
  const blob = await (await fetch(imageData)).blob();
  console.log(imageData);
  const body = new FormData();
  body.append("upload", blob, "profile.png");
  return await apiClient.postForm<{ image: { id: string; url: string } }>(
    "/api/services/uploadImage",
    body
  );
}
