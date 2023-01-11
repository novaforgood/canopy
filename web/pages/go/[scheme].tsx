import { useQueryParam } from "../../hooks/useQueryParam";

export default function GoPage() {
  const scheme = useQueryParam("scheme", "string");
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <div className="text-center">You landed here. Scheme: {scheme}</div>
    </div>
  );
}
