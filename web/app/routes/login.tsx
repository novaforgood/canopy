import { useProviderLink } from "@nhost/react";

export default function Login() {
  const { google } = useProviderLink();

  return (
    <div>
      <a href={`${google}`}>Login with google</a>
    </div>
  );
}
